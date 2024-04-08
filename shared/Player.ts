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
}
