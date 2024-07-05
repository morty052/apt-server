import express, { json } from "express";
import { createClient } from "redis";
import { createServer } from "http";
import { Server } from "socket.io";
import { gemini } from "./services/gemini";
import { handleCountDown } from "./timer";

// @ts-ignore
async function verifyAnswer({ query, type }) {
  const prompt = `return a  JSON object in this format "isReal" as a boolean and "description" as a string, to the following question, "is this ${type} real? " "${query}"`;

  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

const client = createClient({
  password: "a6GbwDFrRFgqDj88xZMgvG59dMzsqqcG",
  socket: {
    host: "redis-12535.c331.us-west1-1.gce.redns.redis-cloud.com",
    port: 12535,
  },
});

client
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.log(err));

// @ts-ignore
const addToQueue = async (player, lobbyType) => {
  await client.rPush(`${lobbyType}_LOBBY`, JSON.stringify(player));
};

// @ts-ignore
const createRoom = async (player) => {
  await client.rPush(`DUO_ROOM_${player.username}`, JSON.stringify(player));
};

const addToRoom = async () => {
  const data = await client.lRange("DUO_LOBBY", 0, -1);
  return data.map((player) => JSON.parse(player));
};

const getQueue = async () => {
  const data = await client.lRange("DUO_LOBBY", 0, -1);
  return data.map((player) => JSON.parse(player));
};

const app = express();
app.use(json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // ...
  console.log("io connected", socket.id);
});

const userNameSpace = io.of("/user");

userNameSpace.on("connection", (socket) => {
  // ...
  console.log("a user connected", socket.id);

  socket.on("handshake", (username, cb) => {
    console.log("handshake", username);
    socket.join(`user-${username}`);
    cb("success");
  });

  socket.on("FIND_MATCH", async (data, cb) => {
    console.log("finding match", data);

    const { player, lobbyType } = data;

    await addToQueue(player, lobbyType);

    const queue = await getQueue();

    // * handle 1 player in the queue
    if (queue.length === 1) {
      socket.join(`DUO_LOBBY_${data.player.username}`);
      createRoom(data.player);
      cb({
        message: "Lobby created",
      });
      return;
    }

    if (queue.length === 2) {
      await socket.join(`DUO_LOBBY_${queue[0].username}`);
      await client.del("DUO_LOBBY");
      const lobby = queue.map((player, index) => {
        return {
          ...player,
          turn: index,
        };
      });
      userNameSpace.to(`DUO_LOBBY_${queue[0].username}`).emit("MATCH_FOUND", {
        queue: lobby,
        room: `DUO_LOBBY_${queue[0].username}`,
      });
      return;
    }

    cb(queue);
  });

  socket.on("SELECT_LETTER", async (data) => {
    const { room, letter } = data;
    console.log({ room, letter });
    userNameSpace.to(room).emit("LETTER_SELECTED", { letter });
  });

  socket.on("SUBMIT_ANSWERS", async (data) => {
    const { room, player } = data;
    console.log({ room, player });
    userNameSpace.to(room).emit("PLAYER_SUBMITTED", { player });
  });

  socket.on("START_COUNTDOWN", async (data) => {
    const { room } = data;
    handleCountDown({ socket });
  });

  socket.on("VERIFY_ANSWER", async (data, cb) => {
    const { room, username, query, type } = data;
    console.log({ room, username, query, type });
    const response = await verifyAnswer({ type, query });
    const verdict = JSON.parse(response);
    userNameSpace.to(room).emit("VERDICT_RECEIVED", { username, verdict });
    cb({ verdict });
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
