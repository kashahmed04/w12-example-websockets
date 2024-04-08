import { Player } from "./Player";

export type MessageType = "join" | "membership" | "chat";

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

// MembershipMessage
// FREQUENCY : once per player list change
// DIRECTION : server to all clients
// SENT : when a new player joins, or an existing player exits the chat.
// PURPOSE : let all players know who is here.
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
export interface ChatMessage extends BaseMessage {
  messageType: "chat";
  text: string;
  nickname: string;
}

export type Message = JoinMessage | MembershipMessage | ChatMessage;
