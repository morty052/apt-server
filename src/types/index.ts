import { Socket } from "socket.io";
export type LobbyType = "HEAD_TO_HEAD" | "FULL_HOUSE";

export type AnswerProps = {
  Name: string;
  Animal: string;
  Place: string;
  Thing: string;
};

export type PlayerProps = {
  username: string;
  doneTallying: boolean;
  answers: AnswerProps;
  submitted: boolean;
};

export type SocketProps = Socket;
