import client from "../services/redis";
import { handleCountDown } from "../timer";
import { PlayerProps, SocketProps } from "../types";
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

const checkAllPlayersDoneTallying = (data: PlayerProps[]): boolean => {
  const allPlayersDone = data.every((player) => player.doneTallying);

  if (allPlayersDone) {
    console.log("All Players Done");
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

const exitPlayerFromTally = async ({
  room,
  playerToExitTally,
}: {
  room: string;
  playerToExitTally: PlayerProps;
}) => {
  const players = await getPlayersInRoom(room);

  const updatedPlayers = players.map((player) => {
    if (player.username === playerToExitTally.username) {
      return {
        ...player,
        doneTallying: true,
      };
    }
    return player;
  });

  const allPlayersExitedTally = checkAllPlayersDoneTallying(updatedPlayers);

  if (allPlayersExitedTally) {
    userNameSpace.to(room).emit("SHOW_FINAL_TALLY");

    // * reset all players answers and tallymode
    const updatedPlayers = players.map((player) => {
      return {
        ...player,
        doneTallying: false,
        answers: { Name: "", Animal: "", Place: "", Thing: "" },
      };
    });
    await client.hSet(room, {
      players: JSON.stringify(updatedPlayers),
    });
    return;
  }

  userNameSpace.to(room).emit("PLAYER_DONE_TALLYING", { playerToExitTally });

  await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });
};

const updatePlayersAnswers = async ({
  room,
  playerToUpdate,
  answers,
}: {
  room: string;
  playerToUpdate: PlayerProps;
  answers: PlayerProps["answers"];
}) => {
  const players = await getPlayersInRoom(room);

  const updatedPlayers = players.map((player) => {
    if (player.username === playerToUpdate.username) {
      return {
        ...player,
        answers,
        submitted: true,
      };
    }
    return player;
  });

  const allPlayersSubmittedAnswers = allPlayersSubmitted(updatedPlayers);

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

  userNameSpace.to(room).emit("PLAYER_SUBMITTED", {
    username: playerToUpdate.username,
    updatedPlayers,
  });

  await client.hSet(room, {
    players: JSON.stringify(updatedPlayers),
  });
};

export const updateSelectedLetter = async ({
  room,
  letter,
  socket,
}: {
  room: string;
  letter: string;
  socket: SocketProps;
}) => {
  console.log({ room, letter });
  userNameSpace.to(room).emit("LETTER_SELECTED", { letter });
  handleCountDown({ room });
  console.log(`letter selected in ${room}  starting countdown`);
};

const deleteLobby = async () => {
  const del = await client.del("HEAD_TO_HEAD_LOBBY_Eve");
  console.log(del);
};

type updateRoomReturnProps = {
  updatedPlayersList?: PlayerProps[];
  allPlayersSubmitted?: boolean;
  playerToExitTally?: PlayerProps;
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
