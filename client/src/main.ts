import "./reset.css";
import "./styles.css";

import { Message } from "../../shared/Messages";
import { setupJoin } from "./join";
import { setupGame, updateScore } from "./game";
import { displayChat, setupChat, updateMembers } from "./chat";
import { Player } from "../../shared/Player";

// Connect to the WebSocket server
// (I'll have to change this to the teacher station IP address for the class demo)
const ws = new WebSocket("ws://localhost:3000");

//did we have this in the first branch why do we need this here I thought we did this index.TS**
let playerList: Player[];
let myId = "unknown-player";
let playerMap: Map<string, Player>;

// once the connection is open
ws.addEventListener("open", (evt) => {
  console.log("connected", evt);
  // allow the user to join the chat (see join.ts)
  setupJoin(ws);
  // allow the user to monitor the chat (see chat.ts)
  setupChat(ws);
});

ws.addEventListener("message", async (evt) => {
  // parse the JSON message
  const message: Message = JSON.parse(evt.data) as Message;
  console.log(message);

  // use "Type Narrowing" - TypeScript knows what type it is based on the messageType
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  switch (message.messageType) {
    case "identify":
      //where did we define this**
      myId = message.yourId;
      break;
    case "membership":
      playerList = message.playerList;
      updateMembers(message.playerList);

      const nickname = message.text.split(" ")[0];
      if (nickname.length < 26) {
        // I want to hide join/leaves from users without nicknames.
        displayChat("server", message.text);
      }
      break;
    case "chat":
      displayChat(message.nickname, message.text);
      break;

    //so this is where we show the game menu right**
    //why do we just target the game class name and never say on or off to turn it on or off**
    //for the setup game would the message be the HVZ we say in chat and why would we need our ID (this refers to our ID right)**
    //the ID would be the person who entered HVZ in the chat right**
    //go over all** (go over difference between main branch and HVZ branch)**
    case "beginGame":
      document.body.className = "game";
      playerMap = setupGame(ws, message, myId);
      updateScore(playerMap);
      break;

    case "walkTo":
      const player = playerMap.get(message.playerId) as Player;
      player.x = message.x;
      player.y = message.y;
      player.tx = message.tx;
      player.ty = message.ty;
      player.start = message.start;
      player.eta = message.eta;
      break;

    case "turn":
      const freshZom = playerMap.get(message.exHumanId) as Player;
      freshZom.type = "zombie";
      updateScore(playerMap);
      break;
  }
});
