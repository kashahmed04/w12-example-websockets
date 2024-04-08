import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

import { Player } from "../../shared/Player";
import {
  BeginGameMessage,
  ChatMessage,
  IdentifyMessage,
  MembershipMessage,
  Message,
} from "../../shared/Messages";

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
      x: player.x,
      y: player.y,
      tx: player.tx,
      ty: player.ty,
      start: player.start,
      eta: player.eta,
      type: player.type,
    });
  });

  return playerList;
};

// whenever a new client connection is made
wss.on("connection", (ws) => {
  // assign an id to the client
  const id = uuidv4();

  // create an entry in our connections array
  players.set(id, {
    id,
    nickname: id,
    ws,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    start: 0,
    eta: 0,
    type: "human",
  });

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
        if (incomingMessage.text === "HvZ") {
          let i = 0;
          players.forEach((player) => {
            player.type = i % 6 === 0 ? "zombie" : "human";
            if (player.type === "zombie") {
              player.x = player.tx = Math.random() * 200;
              player.y = player.ty = 100 + Math.random() * 100;
              player.start = player.eta = 0;
            } else {
              player.x = player.tx = Math.random() * 200;
              player.y = player.ty = Math.random() * 100;
              player.start = player.eta = 0;
            }
            i++;
          });

          const beginGame: BeginGameMessage = {
            messageType: "beginGame",
            players: getPlayerList(),
            timestamp: Date.now(),
          };
          broadcast(beginGame);
        }
        break;

      case "walkTo":
        broadcast(incomingMessage);
        break;

      case "turn":
        players.get(incomingMessage.exHumanId).type = "zombie";
        broadcast(incomingMessage);
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

  const identify: IdentifyMessage = {
    messageType: "identify",
    yourId: id,
  };
  ws.send(JSON.stringify(identify));
});

console.log("listening on 3000");
