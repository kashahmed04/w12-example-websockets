export interface Player {
  id: string;
  nickname: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  start: number;
  eta: number;
  type: "human" | "zombie";
  //we add a start x and y, target x and y, starting time, estimated time to get from start to target, and a type for human or zombie**
}
