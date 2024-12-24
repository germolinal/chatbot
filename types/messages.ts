export type Origin = "user" | "bot";
export type Message = {
  origin: Origin;
  msg: string;
  audioContent?: string;
};
