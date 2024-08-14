const { getRandomInRange } = require("./functions/tools");
const now = new Date();
const target = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  16,
  1
);
let token = "SOL_USDC";
console.log(token.includes(`SOL_USDC`));
