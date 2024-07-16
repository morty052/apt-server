import { Server } from "socket.io";
import { httpServer } from "../models/server";

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // ...
  console.log("io connected", socket.id);
});

export const userNameSpace = io.of("/user");
