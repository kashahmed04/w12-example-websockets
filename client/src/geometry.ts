import { Player } from "../../shared/Player";

// how far between two points?
// go over**
export const getDistance = (x: number, y: number, tx: number, ty: number) => {
  const a = tx - x;
  const b = ty - y;
  return Math.sqrt(a * a + b * b);
};

// where is the player along its travel line?
// go over**
export const getPosition = (player: Player, now: number) => {
  let x = 0;
  let y = 0;
  //when would now be less than start or greater than estimated time**
  if (now < player.start) {
    x = player.x;
    y = player.y;
  } else if (now > player.eta) {
    x = player.tx;
    y = player.ty;
  } else {
    const percent = (now - player.start) / (player.eta - player.start);
    x = player.x + (player.tx - player.x) * percent;
    y = player.y + (player.ty - player.y) * percent;
  }

  return { x, y };
};
