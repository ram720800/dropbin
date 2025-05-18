export const encodeState = (userId: string) => {
  return Buffer.from(JSON.stringify({ userId })).toString("base64url");
};

export const decodeState = (state: string): { userId: string } => {
  return JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
};
