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

export type AvatarObject = {
  BodyColor: number;
  BodySize: number;
  BodyEyes: number;
  BodyHair: number;
  BodyFaceHair: number;
  BackgroundColor: number;
};

export type answerProps = {
  Name: string;
  Animal: string;
  Place: string;
  Thing: string;
};

export type GameModes =
  | "HEAD_TO_HEAD"
  | "FULL_HOUSE"
  | "PRIVATE_MATCH"
  | "SURVIVAL_MATCH"
  | "TRIPLE_THREAT";

export type CharacterNames = "DETECTIVE" | "RACOON" | "CHAMELEON" | "GENIUS";

export type CharacterProps = {
  name: CharacterNames;
  url: string;
  description: string;
  perk: string;
  // thumbnail: string;
};

export type playerProps = {
  username: string;
  answers: answerProps;
  turn: number;
  score: number;
  inTallyMode: boolean;
  doneTallying: boolean;
  strikes: number;
  character: CharacterNames | null;
};

export type friend = {
  username: string;
  total_score: number;
  avatar: AvatarObject;
  online: boolean;
};

export type inviteProps = {
  host: string;
  avatar: AvatarObject;
  game_id: string;
  guests: string[];
};

export type inviteDataProps = {
  host: {
    username: string;
    avatar: AvatarObject;
  };
  avatar: AvatarObject;
  game_id: string;
  guests: string[];
};

export type StatsProps = {
  level: number;
  points: number;
  high_score: number;
  games_played: number;
  wins: number;
  losses: number;
};
