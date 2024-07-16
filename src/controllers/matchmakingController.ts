import client from "../services/redis";
import { LobbyType, PlayerProps, SocketProps } from "../types";
import { userNameSpace } from "./socketController";

const getMaxPlayers = (lobbyType: LobbyType) => {
  console.log("lobby Type", lobbyType);
  switch (lobbyType) {
    case "HEAD_TO_HEAD":
      return 2;
    case "FULL_HOUSE":
      return 4;
    default:
      return 2;
  }
};

const addToQueue = async (player: PlayerProps, lobbyType: LobbyType) => {
  await client.rPush(`${lobbyType}_LOBBY`, JSON.stringify(player));
};

const getQueue = async (lobbyType: LobbyType) => {
  const data = await client.lRange(`${lobbyType}_LOBBY`, 0, -1);
  return data.map((player) => JSON.parse(player));
};

const createRoom = async (room: string, players: PlayerProps[]) => {
  const data = await client.hSet(room, {
    players: JSON.stringify(players),
  });
  console.log(data);
};

export const getRoom = async (room: string) => {
  const data = await client.lRange(room, 0, -1);
  console.log("room", data);
  return data.map((player) => JSON.parse(player));
};

export const handleMatchMaking = async ({
  data,
  socket,
  cb,
}: {
  data: { player: PlayerProps; lobbyType: LobbyType };
  socket: SocketProps;
  cb: (data: { message: string }) => void;
}) => {
  const { player, lobbyType } = data;

  // * get max players for lobby type
  const maxPlayersForLobby = getMaxPlayers(lobbyType);

  // * add player to queue
  await addToQueue(player, lobbyType);

  // * get queue
  const queue = await getQueue(lobbyType);

  const LOBBY_NAME = `${lobbyType}_LOBBY_${queue[0].username}`;

  // * handle 1st player in the queue
  if (queue.length === 1) {
    socket.join(LOBBY_NAME);
    cb({
      message: "Lobby created",
    });
    return;
  }

  // * handle queue complete
  if (queue.length === maxPlayersForLobby) {
    // * add last player to the created lobby
    await socket.join(LOBBY_NAME);

    //* add extra details to players in queue
    const lobby = queue.map((player, index) => {
      return {
        ...player,
        turn: index,
        score: 0,
        doneTallying: false,
        inTallyMode: false,
        answers: { Name: "", Animal: "", Place: "", Thing: "" },
        submitted: false,
      };
    });

    // * create new room with players in queue
    await createRoom(LOBBY_NAME, lobby);

    // * send players data and room name to frontend
    userNameSpace.to(LOBBY_NAME).emit("MATCH_FOUND", {
      queue: lobby,
      room: LOBBY_NAME,
    });

    // * delete the queue
    await client.del(`${lobbyType}_LOBBY`);

    // const ddt = await client.del(`${lobbyType}_ROOM_${queue[0].username}`);
    // console.log({ ddt });
    return;
  }

  // * join the created lobby
  // await socket.join(LOBBY_NAME);
  console.log(LOBBY_NAME, queue.length);
  cb({
    message: "Function reached end ",
  });
};
