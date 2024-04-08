import { Player } from "./Player";

export type MessageType = //why do we need pipes here**
  | "join"
  | "identify"
  | "membership"
  | "chat"
  | "beginGame"
  | "walkTo"
  | "turn";

export interface BaseMessage {
  messageType: MessageType;
}

// JoinMessage
// FREQUENCY : once per client.
// DIRECTION : single client to the server.
// SENT : when joining the chat.
// PURPOSE : let the server know what this client's nickname is.
export interface JoinMessage extends BaseMessage {
  messageType: "join";
  nickname: string;
}

// IdentifyMessage
// FREQUENCY : once per client.
// DIRECTION : server to single client. 
// SENT : when joining the chat.
// PURPOSE : client know what their ID is.
// we need the id for each player because**
//go over**
export interface IdentifyMessage extends BaseMessage {
  messageType: "identify";
  yourId: string;
}

// MembershipMessage
// FREQUENCY : once per player list change
// DIRECTION : server to all clients
// SENT : when a new player joins, or an existing player exits the chat.
// PURPOSE : let all players know who is here.
// why do we need this if we don't have a chatbox anymore**
export interface MembershipMessage extends BaseMessage {
  messageType: "membership";
  text: string;
  playerList: Player[];
}

// ChatMessage
// FREQUENCY : often
// DIRECTION : client to server, then server to all clients
// SENT : when a player sends a chat message, that message is broadcast to all players
// PURPOSE : send text to be displayed in the chat
// why do we need this 
export interface ChatMessage extends BaseMessage {
  messageType: "chat";
  text: string;
  nickname: string;
}

// BeginGameMessage
// FREQUENCY : once per game, at the start
// DIRECTION : server to all clients
// SENT : when a player sends a chat message "HvZ", a start game message is sent to all players
// PURPOSE : initialize and change to game mode
//go over**
export interface BeginGameMessage extends BaseMessage {
  messageType: "beginGame";
  players: Player[];
  timestamp: number;
}

// WalkToMessage
// FREQUENCY : many times per game
// DIRECTION : client to server, then server to all clients
// SENT : when a player clicks the canvas, to update their target position
// PURPOSE : allow for player movement
// go over**
export interface WalkToMessage extends BaseMessage {
  messageType: "walkTo";
  playerId: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  start: number;
  eta: number;
}

// TurnMessage
// FREQUENCY : a few times per game
// DIRECTION : client to server, then server to all clients
// SENT : when a zombie player gets close enough to a human player
// PURPOSE : BRAAAAIINNZZZ
// go over**
export interface TurnMessage extends BaseMessage {
  messageType: "turn";
  exHumanId: string;
}

//go over** (why do we need it as strings then and why do we need it with pipes here)**
export type Message =
  | JoinMessage
  | IdentifyMessage
  | MembershipMessage
  | ChatMessage
  | BeginGameMessage
  | WalkToMessage
  | TurnMessage;
