import { gemini } from "./services/gemini";
import { handleCountDown } from "./timer";
import { PlayerProps } from "./types";
import { app, httpServer } from "./models/server";
import { userNameSpace } from "./controllers/socketController";
import { handleMatchMaking } from "./controllers/matchmakingController";
import {
  createPrivateRoom,
  joinPrivateRoom,
  updatePlayersAnswers,
  updatePlayerScore,
  updateRoom,
  updateSelectedLetter,
} from "./controllers/matchRoomController";
import {
  removeFromOnlineList,
  updateOnlinePlayersList,
  takePlayerOnline,
  takePlayerOffline,
} from "./controllers/onlineStatusController";

async function verifyAnswer({ query, type }: { query: string; type: string }) {
  const prompt = `return a  JSON object in this format "isReal" as a boolean and "description" as a string with a short description of about 4 lines of the answer, to the following question, "is this ${type} real? " "${query}"`;

  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

userNameSpace.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("handshake", async (username, cb) => {
    console.log("handshake", username);
    socket.join(`user-${username}`);
    await updateOnlinePlayersList({ socketId: socket.id });
    await takePlayerOnline({ username, socketId: socket.id });
    cb("success");
  });

  socket.on("FIND_MATCH", async (data, cb) => {
    // const dat = await client.del(`${data.lobbyType}_LOBBY`);
    // console.log(dat);
    handleMatchMaking({ data, socket, cb });
  });

  socket.on("CREATE_PRIVATE_MATCH", async (data, cb) => {
    const { private_room, host_id, guests, host } = data;

    await createPrivateRoom({ room: private_room, host, guests });
    socket.join(private_room);
    cb("success");
  });

  socket.on("JOIN_PRIVATE_LOBBY", async (data, cb) => {
    const { private_room, guest } = data;

    socket.join(private_room);
    await joinPrivateRoom(private_room, guest);
    userNameSpace.to(private_room).emit("PLAYER_JOINED", guest);
    console.log(
      `${guest.username} joined ${private_room} with  ${guest.character}`
    );
  });

  socket.on(
    "JOIN_ROOM",
    async (data: { player: PlayerProps; room: string }, cb) => {
      const { player, room } = data;
      console.log({ player, room });
    }
  );

  socket.on("SELECT_LETTER", async (data) => {
    const { room, letter } = data;
    await updateSelectedLetter({ room, letter });
  });

  socket.on("SUBMIT_ANSWERS", async (data) => {
    const { room, player } = data;
    await updatePlayersAnswers({
      room,
      playerToUpdate: player,
      answers: player.answers,
    });
  });

  socket.on("START_COUNTDOWN", async (data) => {
    const { room } = data;
    handleCountDown({ room });
  });

  socket.on("VERIFY_ANSWER", async (data, cb) => {
    const { room, username, query, type } = data;
    console.log({ room, username, query, type });
    userNameSpace.to(room).emit("WAITING_VERDICT", { username, query, type });
    const response = await verifyAnswer({ type, query });
    const verdict: { isReal: boolean; description: string } =
      JSON.parse(response);
    userNameSpace.to(room).emit("VERDICT_RECEIVED", { username, verdict });
    cb({ verdict });
  });

  socket.on("BUST_PLAYER", async (data) => {
    const { room, username, answer, type } = data;
    console.log({ room, username, answer, type });
    userNameSpace.to(room).emit("PLAYER_BUSTED", { username, answer, type });
  });

  socket.on("PLAYER_DONE_TALLYING", async (data) => {
    const { player, room, operation } = data;
    await updateRoom({ player, room, operation: "EXIT_TALLY_MODE" });
  });

  socket.on("UPDATE_SCORES", async (data) => {
    const { room, player, scoreForRound } = data;
    console.log({ room, player, scoreForRound });
    updatePlayerScore({ room, playerToUpdate: player, scoreForRound });
  });

  socket.on("ROUND_ENDED", async (data) => {
    const { room, nextTurn } = data;
    console.log({ room, nextTurn });
    userNameSpace.to(room).emit("READY_NEXT_ROUND", { nextTurn });
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    await removeFromOnlineList({ socketId: socket.id });
    await takePlayerOffline({ socketId: socket.id });
  });
});

app.get("/", async (req, res) => {
  res.send("json");
});

httpServer.listen(3000, () => {
  console.log("Server started on port 3000");
});
