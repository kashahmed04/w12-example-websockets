import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

import { Player } from "../../shared/Player";
import { ChatMessage, MembershipMessage, Message } from "../../shared/Messages";

export interface ServerPlayer extends Player {
  ws: WebSocket;
}

// start a WebSocetServer on port 3000
const wss = new WebSocketServer({ port: 3000 });

// a Map to store all client connections
const players = new Map<string, ServerPlayer>();

// send a message to all connected clients
const broadcast = (data: Message) => {
  players.forEach((player) => {
    player.ws.send(JSON.stringify(data));
  });
};

// convert the players Map to an array for transmission
const getPlayerList = (): Player[] => {
  const playerList: Player[] = [];
  players.forEach((player) => {
    playerList.push({
      id: player.id,
      nickname: player.nickname,
    });
  });

  return playerList;
};

// whenever a new client connection is made
wss.on("connection", (ws) => {
  // assign an id to the client
  const id = uuidv4();

  // create an entry in our connections array
  players.set(id, { id, nickname: id, ws });

  // respond to any error events:
  ws.on("error", console.error);

  // respond to any message events:
  ws.on("message", (data) => {
    // parse the incoming message as a "Message" type
    const incomingMessage: Message = JSON.parse(data.toString());
    const player = players.get(id);

    // use "Type Narrowing" - TypeScript knows what type it is based on the messageType
    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    switch (incomingMessage.messageType) {
      case "join":
        player.nickname = incomingMessage.nickname;
        const playerList = getPlayerList();

        const joinResponse: MembershipMessage = {
          messageType: "membership",
          text: `${incomingMessage.nickname} has joined the chat.`,
          playerList,
        };

        broadcast(joinResponse);
        break;
      case "chat":
        const chatResponse: ChatMessage = {
          messageType: "chat",
          text: incomingMessage.text,
          nickname: player.nickname,
        };
        broadcast(chatResponse);
        break;
    }
  });

  // respond to any close events:
  ws.on("close", () => {
    const player = players.get(id);
    // (by removing this client from the connections Map)
    players.delete(id);

    const playerList = getPlayerList();

    const response: MembershipMessage = {
      messageType: "membership",
      text: `${player.nickname} has left the chat.`,
      playerList,
    };
    broadcast(response);
  });
});

console.log("listening on 3000");
