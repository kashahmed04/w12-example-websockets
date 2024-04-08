import {
  BeginGameMessage,
  TurnMessage,
  WalkToMessage,
} from "../../shared/Messages";
import { Player } from "../../shared/Player";
import { getDistance, getPosition } from "./geometry";

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

  // Track the mouse position (mainly for human view-cone)
  let mouseX = 400;
  let mouseY = 300;
  canvas.addEventListener("mousemove", (evt) => {
    mouseX = evt.clientX - canvas.offsetLeft;
    mouseY = evt.clientY - canvas.offsetTop;
  });

  // Click to set where your player is walking towards
  canvas.addEventListener("click", (evt) => {
    let { x, y } = getPosition(playerMap.get(myId) as Player, Date.now());
    // account for the canvas not being in the exact upper left corner of the viewport
    let tx = evt.clientX - canvas.offsetLeft;
    let ty = evt.clientY - canvas.offsetTop;
    const distance = getDistance(x, y, tx, ty);
    let start = Date.now();

    // compose and send a walkTo message to the server
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
  });

  // draw a dot for every player
  const renderPlayer = (player: Player, now: number) => {
    let position = getPosition(player, now);

    context.fillStyle = player.type === "human" ? "blue" : "orange";
    context.beginPath();
    context.arc(position.x, position.y, 5, 0, Math.PI * 2);
    context.fill();
  };

  // check zombie self against each human's position
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

  const draw = () => {
    // clear the background
    context.reset();
    context.fillStyle = "black";
    context.fillRect(0, 0, 800, 600);

    // set up the clipping path
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
    const now = Date.now();
    players.forEach((player) => {
      renderPlayer(playerMap.get(player.id) as Player, now);
    });

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);

  return playerMap;
};

// Count how many humans / zombies remain, and update the scoreboard.
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
  score?.replaceChildren();

  const hum = document.createElement("p");
  hum.className = "human";
  hum.innerText = `${humans} humans remain.`;
  score?.appendChild(hum);

  const zom = document.createElement("p");
  zom.className = "zombie";
  zom.innerText = `${zombies} zombies exist.`;
  score?.appendChild(zom);
};
