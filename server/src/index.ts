import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
//why do we need all this here specifically why not in main and what do these do**

import { Player } from "../../shared/Player";
import { ChatMessage, MembershipMessage, Message } from "../../shared/Messages";

export interface ServerPlayer extends Player {
  ws: WebSocket;
}

//what is index used for do we apply this to any files specifically**

// start a WebSocetServer on port 3000
const wss = new WebSocketServer({ port: 3000 });

// a Map to store all client connections
//the string is the persons nickname and the serverplayer is**
const players = new Map<string, ServerPlayer>();

// send a message to all connected clients
// we send the message that one user sent to all the clients in the server (this is from the websocket server)**
// how does it know to call these methods if we never use them in any of our files**
// we have to do JSON.stringify because in main we had our message event listener and we parsed our data we got back for the message
// as a JS object so now we need to put it back in JSON format to send to the websocket for each player to see the message**
const broadcast = (data: Message) => {
  players.forEach((player) => {
    player.ws.send(JSON.stringify(data));
  });
};

// convert the players Map to an array for transmission
// why did we map players if we already had a list of them in the message file and in main**
// how do we know what id to give the player does the websocket give an id for each player automatically**
// why do we need an id for each player**
const getPlayerList = (): Player[] => {
  const playerList: Player[] = [];
  players.forEach((player) => {
    playerList.push({
      id: player.id,
      nickname: player.nickname,
    });
  });

  //why do we return this array of players if no other file can access it**
  return playerList;
};

// whenever a new client connection is made
// this is always used when a user launches the socket automatically (not after they fill in their nickname and the dialog goes
//through right)**
//difference between open event in main and connection event in here**
//go over all**
wss.on("connection", (ws) => {
  // assign an id to the client
  const id = uuidv4();

  // create an entry in our connections array
  // why do we use a map why don't we say push because we had a players array**
  players.set(id, { id, nickname: id, ws });

  // respond to any error events:
  // when would there be the case of an error**
  ws.on("error", console.error);

  // respond to any message events:
  // why did we have a message event in here and in main what is the difference**
  ws.on("message", (data) => {
    // parse the incoming message as a "Message" type
    // why do we parse this here if there is not connect to the chat file where we made the message a JSON.stringify**
    const incomingMessage: Message = JSON.parse(data.toString());
    const player = players.get(id);

    // use "Type Narrowing" - TypeScript knows what type it is based on the messageType
    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    // so each time someone joins is there a new id for each nickname even if they were already in the array of nicknames
    // and a new name added (what about when someone leaves)**
    // go over all**
    // why did we have 2 type narrowing one for main and one for here (whats the difference)**
    switch (incomingMessage.messageType) {
      case "join":
        player.nickname = incomingMessage.nickname;
        const playerList = getPlayerList();

        const joinResponse: MembershipMessage = {
          messageType: "membership",
          text: `${incomingMessage.nickname} has joined the chat.`,
          playerList,
        };
        //this sends all the data from the server (websocket) the to players (clients)**
        broadcast(joinResponse);
        break;
      case "chat":
        const chatResponse: ChatMessage = {
          messageType: "chat",
          text: incomingMessage.text,
          nickname: player.nickname,
        };
        //this sends all the data from the server (websocket) the to players (clients)**
        broadcast(chatResponse);
        break;
    }
  });

  // respond to any close events:
  ws.on("close", () => {
    const player = players.get(id);
    // (by removing this client from the connections Map)
    players.delete(id);

    //update the playerlist if someone left (each nickname still existing will get a new id right)**
    //will it also maintain its order in the DOM for whoever was added more ot less recently**
    const playerList = getPlayerList();

    //we make a membership message and braodcast it from the server (websocket) to the clients (everyone in the chat)
    //saying that someone has left based on their username**
    //why did we use : here instead of = whats the difference**  const response = MembershipMessage and 
    //const response: MembershipMessage** (are we making this variable of type membership message is that why)**
    //why wouldnt it be response = instead of membership message  = then**
    const response: MembershipMessage = {
      messageType: "membership",
      text: `${player.nickname} has left the chat.`,
      playerList,
    };
    broadcast(response);
  });
});

//why did we need this here on the bottom**
console.log("listening on 3000");

//difference between main.TS and index.TS**
