import client from "../services/redis";
import { handleCountDown, handleTallyCountDown } from "../timer";
import { AnswerProps, PlayerProps, SocketProps } from "../types";
import { userNameSpace } from "./socketController";

type OperationTypes = "READY_PLAYER" | "EXIT_TALLY_MODE" | "UPDATE_ANSWERS";

const getPlayersInRoom = async (room: string): Promise<PlayerProps[]> => {
  try {
    const data = await client.hGetAll(room);
    const players = JSON.parse(data.players);
    return players;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getRoomDetails = async (
  room: string
): Promise<{ players: PlayerProps[]; round: number }> => {
  try {
    const data = await client.hGetAll(room);
    const players = JSON.parse(data.players);
    const round = JSON.parse(data.round);
    return { players, round };
  } catch (error) {
    console.log(error);
    return { players: [], round: 0 };
  }
};

const getPlayer = (players: PlayerProps[], username: string) => {
  const player = players.find((player) => player.username === username);

  return player;
};

export const createPrivateRoom = async ({
  room,
  host,
  guests,
}: {
  room: string;
  host: PlayerProps & { id: string };
  guests: PlayerProps[];
}) => {
  try {
    const queue = [host, ...guests];

    console.log({ queue, guests });

    //* add extra details to players in created room
    const lobby = queue.map((player, index) => {
      if (player.username === host.username) {
        return {
          ...player,
          turn: index,
          totalScore: 0,
          doneTallying: false,
          inTallyMode: false,
          answers: { Name: "", Animal: "", Place: "", Thing: "" },
          submitted: false,
          joined: true,
          character: host.character,
        };
      }
      return {
        ...player,
        turn: index,
        totalScore: 0,
        doneTallying: false,
        inTallyMode: false,
        answers: { Name: "", Animal: "", Place: "", Thing: "" },
        submitted: false,
        joined: false,
      };
    });

    const data = await client.hSet(room, {
      players: JSON.stringify(lobby),
      round: 0,
      maxPlayers: lobby.length,
      room_id: room,
    });

    console.log("created private room", data);
  } catch (error) {
    console.log(error);
  }
};

export const joinPrivateRoom = async (room: string, guest: PlayerProps) => {
  const players = await getPlayersInRoom(room);

  const updatedPlayers = players.map((player) => {
    if (player.username === guest.username) {
      return {
        ...player,
        joined: true,
        character: guest.character,
      };
    }
    return player;
  });

  // @ts-ignore
  const allPlayerJoined = updatedPlayers.every((player) => player.joined);

  if (allPlayerJoined) {
    // * send players data and room name to frontend
    userNameSpace.to(room).emit("START_PRIVATE_MATCH", {
      queue: updatedPlayers,
      room,
    });

    return;
  }

  const data = await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });

  console.log(data);
};

export const exitPrivateRoom = async (room: string, guest: PlayerProps) => {
  const players = await getPlayersInRoom(room);

  const updatedPlayers = players.filter(
    (player) => player.username !== guest.username
  );

  const allPlayersLeft = updatedPlayers.length <= 1;

  if (allPlayersLeft) {
    // * send players data and room name to frontend
    userNameSpace.to(room).emit("Cancel_PRIVATE_MATCH", {
      queue: updatedPlayers,
      room,
    });

    return;
  }

  const data = await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });

  console.log(data);
};

const checkAllPlayersDoneTallying = (data: PlayerProps[]): boolean => {
  const allPlayersDone = data.every((player) => player.doneTallying);

  if (allPlayersDone) {
    console.log("All Players Done");
    return true;
  }

  return false;
};

const checkHalfPlayersDoneTallying = (playerList: PlayerProps[]): boolean => {
  const playerCount = playerList.length;

  const totalPlayersDone = playerList.filter(
    (player) => player.doneTallying
  ).length;

  if (totalPlayersDone >= playerCount / 2) {
    return true;
  }

  return false;
};

const allPlayersSubmitted = (playerList: PlayerProps[]) => {
  if (playerList.every((player) => player.submitted)) {
    return true;
  }

  return false;
};

const checkForfeitedAnswers = (answers: AnswerProps): boolean => {
  const answersArray = Object.values(answers);

  if (answersArray.some((answer) => answer === "FORFEITED")) {
    return true;
  }

  return false;
};

const checkForWinner = (players: PlayerProps[]): PlayerProps => {
  const scoresList = players.map((player) => player.totalScore);
  const maxScore = Math.max(...scoresList);
  const winners = players.filter((player) => player.totalScore === maxScore);

  // *handle draw
  if (winners.length > 1) {
    // handle draw stuff here
    return;
  }
  return winners[0];
};

const exitPlayerFromTally = async ({
  room,
  playerToExitTally,
}: {
  room: string;
  playerToExitTally: PlayerProps;
}) => {
  // const players = await getPlayersInRoom(room);

  const { players, round } = await getRoomDetails(room);

  const updatedPlayers = players.map((player) => {
    if (player.username === playerToExitTally.username) {
      return {
        ...player,
        doneTallying: true,
      };
    }
    return player;
  });

  // * check if half of players ready to leave tally mode
  const halfOfPlayersDoneTallying =
    checkHalfPlayersDoneTallying(updatedPlayers);

  // * check if all players ready to leave tally mode
  const allPlayersExitedTally = checkAllPlayersDoneTallying(updatedPlayers);

  // * handle 50% of players ready to leave tally mode
  if (halfOfPlayersDoneTallying) {
    // * start countdown for remaining players to exit
    handleTallyCountDown({ room });
    // * update room on redis DB
    await client.hSet(room, {
      players: JSON.stringify(updatedPlayers),
    });
  }

  // * handle all players ready to leave tally mode
  if (allPlayersExitedTally) {
    // * check and handle if game should end after tally
    if (round + 1 == 3) {
      const winner = checkForWinner(updatedPlayers);
      userNameSpace.to(room).emit("GAME_OVER", { winner });
      client.del(room);
      return;
    }

    // * reset all players answers, remove from tallymode
    const resetedPlayers = players.map((player) => {
      return {
        ...player,
        doneTallying: false,
        answers: { Name: "", Animal: "", Place: "", Thing: "" },
      };
    });

    // * update room on redis DB / increase round
    await client.hSet(room, {
      players: JSON.stringify(resetedPlayers),
      round: round + 1,
    });

    // * Present final tally modal on player device
    userNameSpace.to(room).emit("SHOW_FINAL_TALLY", { nextRound: round + 1 });
    return;
  }

  // * handle single player ready to leave tally mode
  userNameSpace.to(room).emit("PLAYER_DONE_TALLYING", { playerToExitTally });

  // * update room on redis DB
  await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });
};

export const updatePlayersAnswers = async ({
  room,
  playerToUpdate,
  answers,
}: {
  room: string;
  playerToUpdate: PlayerProps;
  answers: PlayerProps["answers"];
}) => {
  // * get all players in room
  const players = await getPlayersInRoom(room);

  // const player = getPlayer(players, playerToUpdate.username);

  // * check if player forfeited any answer
  // const playerHasForfeitedAnswers = checkForfeitedAnswers(answers);

  // * update target players answers / set submitted to true / increment strikes where applicable
  const updatedPlayers = players.map((player) => {
    if (player.username === playerToUpdate.username) {
      // if (playerHasForfeitedAnswers) {
      //   return {
      //     ...player,
      //     strikes: player.strikes + 1,
      //     submitted: true,
      //   };
      // }
      return {
        ...player,
        answers,
        submitted: true,
      };
    }
    return player;
  });

  // // * check if player should die
  // const playerHasDied = checkForPlayerDeath(player as PlayerProps);

  // // * handle player death
  // if (playerHasDied) {
  //   console.log("player has died");
  //   userNameSpace.to(room).emit("PLAYER_DIED", {
  //     deadPlayer: playerToUpdate.username,
  //     updatedPlayers,
  //   });

  //   return;
  // }

  // check if all players submitted
  // const allPlayersSubmittedAnswers = allPlayersSubmitted(updatedPlayers);

  // handle all players submitted
  // if (allPlayersSubmittedAnswers) {
  //   const updatedPlayers = players.map((player) => {
  //     if (player.username === playerToUpdate.username) {
  //       return {
  //         ...player,
  //         answers,
  //         submitted: false,
  //       };
  //     }
  //     return {
  //       ...player,
  //       submitted: false,
  //     };
  //   });
  //   await client.hSet(room, {
  //     players: JSON.stringify(updatedPlayers),
  //   });

  //   userNameSpace.to(room).emit("ALL_PLAYERS_SUBMITTED", {
  //     allPlayersSubmitted: true,
  //     updatedPlayers,
  //   });

  //   return;
  // }

  // * send back updated players list to players in room

  console.log(updatedPlayers);

  userNameSpace.to(room).emit("PLAYER_SUBMITTED", {
    username: playerToUpdate.username,
    updatedPlayers,
  });

  await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });
};

export const updatePlayerScore = async ({
  room,
  playerToUpdate,
  scoreForRound,
}: {
  room: string;
  playerToUpdate: PlayerProps;
  scoreForRound: number;
}) => {
  try {
    // * get all players in room
    const players = await getPlayersInRoom(room);

    // * update target players scores
    const updatedPlayers = players.map((player) => {
      if (player.username === playerToUpdate.username) {
        return {
          ...player,
          totalScore: player.totalScore + scoreForRound,
        };
      }
      return player;
    });

    // * update room on redis
    await client.hSet(room, {
      players: JSON.stringify(updatedPlayers),
    });

    console.log(
      `updatedScore for ${playerToUpdate.username}, ${scoreForRound}`
    );
  } catch (error) {
    console.log(error);
  }
};

export const updateSelectedLetter = async ({
  room,
  letter,
}: {
  room: string;
  letter: string;
}) => {
  console.log({ room, letter });
  await handleCountDown({ room });
  userNameSpace.to(room).emit("LETTER_SELECTED", { letter });
  // console.log(`letter selected in ${room}  starting countdown`);
};

const deleteLobby = async () => {
  const del = await client.del("HEAD_TO_HEAD_LOBBY_Eve");
  console.log(del);
};

type updateRoomProps = {
  room: string;
  player: PlayerProps;
  operation: OperationTypes;
};

export const updateRoom = async ({
  room,
  player,
  operation,
}: updateRoomProps) => {
  switch (operation) {
    case "EXIT_TALLY_MODE":
      await exitPlayerFromTally({ room, playerToExitTally: player });
      break;

    case "UPDATE_ANSWERS":
      updatePlayersAnswers({
        room,
        playerToUpdate: player,
        answers: player.answers,
      });
      break;

    default:
      break;
  }
};

// getPlayersInRoom("HEAD_TO_HEAD_LOBBY_adam");
// deleteLobby();
// exitPlayerFromTally({
//   room: "HEAD_TO_HEAD_LOBBY_adam",
//   playerToExit: { username: "Mikey Mouse", doneTallying: false },
// });

// updateRoom({
//   room: "HEAD_TO_HEAD_LOBBY_adam",
//   player: { username: "Mikey Mouse", doneTallying: false },
//   operation: "EXIT_TALLY_MODE",
// });
