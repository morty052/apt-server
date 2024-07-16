import express, { json } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { LobbyType, PlayerProps } from "../types";

export const app = express();
app.use(json());

export const httpServer = createServer(app);
