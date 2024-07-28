import { Socket } from "socket.io";
export type LobbyType = "HEAD_TO_HEAD" | "FULL_HOUSE" | "PRIVATE_MATCH";

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
  strikes: number;
  totalScore?: number;
  character?: any;
};

export type SocketProps = Socket;
