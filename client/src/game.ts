import {
  BeginGameMessage,
  TurnMessage,
  WalkToMessage,
} from "../../shared/Messages";
import { Player } from "../../shared/Player";
import { getDistance, getPosition } from "./geometry";

//this is pixels per second**
//go over all**
const PXPS = 10;

export const setupGame = (
  ws: WebSocket,
  beginMessage: BeginGameMessage,
  myId: string
) => {
  const canvas = document.querySelector("#game canvas") as HTMLCanvasElement;
  canvas.width = 800;
  canvas.height = 600;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  //what does this do**
  let skipMask = false;

  document.addEventListener("keypress", (evt) => {
    console.log(evt);
    if (evt.key === "`") {
      skipMask = true;
    }
  });

  let players = beginMessage.players;
  let playerMap: Map<string, Player> = new Map();
  players.forEach((player) => {
    playerMap.set(player.id, player);
  });

  // Track the mouse position (mainly for human view-cone)**
  let mouseX = 400;
  let mouseY = 300;
  canvas.addEventListener("mousemove", (evt) => {
    mouseX = evt.clientX - canvas.offsetLeft;
    mouseY = evt.clientY - canvas.offsetTop;
  });

  // Click to set where your player is walking towards
  // so every time we click the canvas all of this in the event listener happens** (reloads everything in the browser)**
  canvas.addEventListener("click", (evt) => {
    //why did we use date.now()**
    let { x, y } = getPosition(playerMap.get(myId) as Player, Date.now());
    // account for the canvas not being in the exact upper left corner of the viewport 
    //why did we do this**
    //if offset built in for the canvas is there a top, bottom, left, and right**
    let tx = evt.clientX - canvas.offsetLeft;
    let ty = evt.clientY - canvas.offsetTop;
    //get our distance on where we have to go based on the start and target position (where we click)**
    //how did we define x and y above**
    const distance = getDistance(x, y, tx, ty);
    let start = Date.now();

    // compose and send a walkTo message to the server
    // what is myID and where did we define it (did we pass it in from main)**
    const walkTo: WalkToMessage = {
      messageType: "walkTo",
      x,
      y,
      tx,
      ty,
      start,
      eta: Math.round(start + (distance / PXPS) * 1000),
      playerId: myId,
    };
    ws.send(JSON.stringify(walkTo));
    //pass this data into the socket (server) to**
  });

  // draw a dot for every player
  //go over all**
  const renderPlayer = (player: Player, now: number) => {
    let position = getPosition(player, now);

    context.fillStyle = player.type === "human" ? "blue" : "orange"; //this says if its a human make the circle blue
    //otherwise we make it orange for a zombie** 
    //we renderplayer in draw because we have to see if they are human or zombie each frame of the game (starting from 
    //the begginning of the game)**
    context.beginPath();
    context.arc(position.x, position.y, 5, 0, Math.PI * 2);
    context.fill();
  };

  // check zombie self against each human's position
  // go over**
  const checkBrains = (me: Player) => {
    const now = Date.now();
    const { x, y } = getPosition(me, now);
    playerMap.forEach((player) => {
      if (player.type === "human") {
        const pos = getPosition(player, now);
        const distance = getDistance(x, y, pos.x, pos.y);
        if (distance < 10) {
          const turn: TurnMessage = {
            messageType: "turn",
            exHumanId: player.id,
          };
          ws.send(JSON.stringify(turn));
        }
      }
    });
  };

  //go over**
  const clipMe = () => {
    let me = playerMap.get(myId) as Player;
    let { x, y } = getPosition(me, Date.now());

    if (me.type === "human") {
      // humans have a narrow cone of view, pointing at the mouse
      const angle = Math.atan2(mouseY - y, mouseX - x);
      context.moveTo(x, y);
      context.arc(x, y, 50, angle - Math.PI / 4, angle + Math.PI / 4);
      context.closePath();
      context.arc(x, y, 20, 0, Math.PI * 2);
      context.clip();
    } else {
      // zombies have a wider cone of view
      context.moveTo(x, y);
      context.arc(x, y, 150, 0, Math.PI * 2);
      context.clip();
    }
  };

  //go over all**
  //this happens each frame right even though it's in the click event for the canvas (so it happens if there is a click
  //and each frame so it happens twice when there is a click because it's already doing it for the requestanimationframe)**
  const draw = () => {
    // clear the background
    context.reset();
    context.fillStyle = "black";
    context.fillRect(0, 0, 800, 600);

    // set up the clipping path
    //what does this do**
    if (!skipMask) {
      clipMe();
    }

    context.fillStyle = "white";
    context.fillRect(0, 0, 800, 600);

    // check for zombie self touching a human
    let me = playerMap.get(myId) as Player;
    if (me.type === "zombie") {
      checkBrains(me);
    }

    // render all players at the same timestamp
    // why do we do this**
    const now = Date.now();
    players.forEach((player) => {
      renderPlayer(playerMap.get(player.id) as Player, now);
    });

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);

  //why do we return the player map**
  return playerMap;
};

// Count how many humans / zombies remain, and update the scoreboard.
// go over all**
export const updateScore = (players: Map<string, Player>) => {
  let zombies = 0;
  let humans = 0;
  players.forEach((player) => {
    if (player.type === "human") {
      humans++;
    }
    if (player.type === "zombie") {
      zombies++;
    }
  });

  const score = document.querySelector("#score") as HTMLDivElement;
  //what does this do** (does it empty out the element is this what is does for replace child on all elements)**
  score?.replaceChildren();

  //we add the current status of how many humans and zombies there are in the game on the canvas or outside the canvas**
  const hum = document.createElement("p");
  hum.className = "human";
  hum.innerText = `${humans} humans remain.`;
  score?.appendChild(hum);

  const zom = document.createElement("p");
  zom.className = "zombie";
  zom.innerText = `${zombies} zombies exist.`;
  score?.appendChild(zom);
};
