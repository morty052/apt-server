import { gemini } from "./services/gemini";
import { handleCountDown } from "./timer";
import { LobbyType, PlayerProps } from "./types";
import { app, httpServer } from "./models/server";
import { userNameSpace } from "./controllers/socketController";
import { handleMatchMaking } from "./controllers/matchmakingController";
import {
  updateRoom,
  updateSelectedLetter,
} from "./controllers/matchRoomController";

async function verifyAnswer({ query, type }: { query: string; type: string }) {
  const prompt = `return a  JSON object in this format "isReal" as a boolean and "description" as a string with a short description of about 4 lines of the answer, to the following question, "is this ${type} real? " "${query}"`;

  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

userNameSpace.on("connection", (socket) => {
  // ...
  console.log("a user connected", socket.id);

  socket.on("handshake", (username, cb) => {
    console.log("handshake", username);
    socket.join(`user-${username}`);
    cb("success");
  });

  socket.on("FIND_MATCH", async (data, cb) => {
    // const dat = await client.del(`${data.lobbyType}_LOBBY`);
    // console.log(dat);
    handleMatchMaking({ data, socket, cb });
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
    await updateSelectedLetter({ room, letter, socket });
  });

  socket.on("SUBMIT_ANSWERS", async (data) => {
    const { room, player } = data;
    console.log({ room, player });
    await updateRoom({
      player,
      room,
      operation: "UPDATE_ANSWERS",
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
    const verdict = JSON.parse(response);
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

  socket.on("ROUND_ENDED", async (data) => {
    const { room, nextTurn } = data;
    console.log({ room, nextTurn });
    userNameSpace.to(room).emit("READY_NEXT_ROUND", { nextTurn });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

app.get("/", async (req, res) => {
  //   await client.del("DUO_LOBBY");
  // @ts-ignore
  handleCountDown({ userNameSpace, room: 10 });
  res.send("json");
});

httpServer.listen(3000, () => {
  console.log("Server started on port 3000");
});
