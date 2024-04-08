import { Player } from "./Player";

//so there is a message for when it says a player has joined the chat, the membership message for when someone leaves or joins the chat**, 
//and the chat message for when a player has entered some text in the chat 
//don't these all get output to everyone regardless of their machine (does each player also have different links or same
//link to get to a web socket connection)** so why do we use message types**
export type MessageType = "join" | "membership" | "chat";

//what was the base message for** (are we saying each type of message will of type base message in the message type
//interfaces)**
export interface BaseMessage {
  messageType: MessageType;
}

// JoinMessage
// FREQUENCY : once per client.
// DIRECTION : single client to the server.**
// SENT : when joining the chat.
// PURPOSE : let the server know what this client's nickname is.
// what do all of these mean**
export interface JoinMessage extends BaseMessage {
  messageType: "join"; //how does it know which message type to use without calling the interface name in the message type variable**
  nickname: string;
}

// MembershipMessage
// FREQUENCY : once per player list change
// DIRECTION : server to all clients**
// SENT : when a new player joins, or an existing player exits the chat.
// PURPOSE : let all players know who is here.
// what is the difference between the join and memebership because these are used to tell everyone a player has joined the chat**
export interface MembershipMessage extends BaseMessage {
  messageType: "membership";
  text: string;
  playerList: Player[];
  //why did we define seperate player type in a different file (player.ts)**
}

//what is the text field** for the membership and chat message interface**
//for the membership interface we had the playerlist which is the player id and the nickname (how do we know 
//to generate the player id and what it can be)**
//so each player entry in the array will be and id and a nickname (how can we have 2 entires in one entry for an array)**
//so the entry for playerList field in the membership message is saying we will have an array of type player**

// ChatMessage
// FREQUENCY : often (how often)**
// DIRECTION : client to server, then server to all clients**
// SENT : when a player sends a chat message, that message is broadcast to all players
// PURPOSE : send text to be displayed in the chat
export interface ChatMessage extends BaseMessage {
  messageType: "chat";
  text: string;
  nickname: string;
}

//we have the union type saying a message can be any of these 3 types of messages** (why do we have the string version type
//added on the top then if we have this type here)**
export type Message = JoinMessage | MembershipMessage | ChatMessage;
