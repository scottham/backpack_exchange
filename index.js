"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backpack_client_1 = require("./backpack_client");
const { checkbox, input } = require("@inquirer/prompts");
const { tokenList } = require("./token");
const { buyfun, sellfun } = require("./functions/trade");
const {
  getNowFormatDate,
  getDelayUntil,
  getRandomInRange,
} = require("./functions/tools");
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  const tokenAnswer = await checkbox(tokenList); //币种列表
  if (tokenAnswer.length == 0) {
    console.log("未选择币种，退出");
    return;
  }
  console.log("已选", tokenAnswer);
  const randomAnser = await input({
    message: "请输入交易随机时间间隔(秒)格式为 数字-数字，默认可不填",
    default: "1-3",
    validate: function (value) {
      const pass = value.match(/^\d+-\d+$/);
      if (pass) {
        const numbers = value.split("-").map(Number);
        if (numbers[0] < numbers[1]) {
          return true;
        }
        return "第一个数字必须小于第二个数字！";
      }
      return '请输入正确格式的字符串（例如 "12-43"）！';
    },
  });
  console.log(`已选${randomAnser}秒 随机交易`);

  const tradeTimes = await input({
    message: "请输入交易次数，格式为 数字%-数字%，默认可不填",
    default: "2-4",
    validate: function (value) {
      const pass = value.match(/^\d+-\d+$/);
      if (pass) {
        const numbers = value.split("-").map(Number);
        if (numbers[0] < numbers[1]) {
          return true;
        }
        return "第一个数字必须小于第二个数字！";
      }
      return '请输入正确格式的字符串（例如 "12-43"）！';
    },
  });
  console.log(`已选${tradeTimes}秒 随机交易`);

  const moneyAnser = await input({
    message: "请输入周交易随机代币比例，格式为 数字%-数字%，默认可不填",
    default: "80%-90%",
    validate: function (value) {
      const pass = value.match(/^\d+%-\d+%$/);
      if (pass) {
        const numbers = value.split("-").map((num) => parseInt(num, 10));
        if (numbers[0] < numbers[1]) {
          return true;
        }
        return "第一个数字必须小于第二个数字！";
      }
      return '请输入正确格式的字符串（例如 "12%-43%"）！';
    },
  });
  console.log(`已选${moneyAnser}比例 随机交易`);

  let randomAnserArr = randomAnser.split("-").map(Number);
  randomAnserArr = Array.from(
    { length: randomAnserArr[1] - randomAnserArr[0] + 1 },
    (_, index) => index + randomAnserArr[0]
  );
  console.log(randomAnserArr);

  let tradeTimesArr = tradeTimes.split("-").map(Number);
  tradeTimesArr = Array.from(
    { length: tradeTimesArr[1] - tradeTimesArr[0] + 1 },
    (_, index) => index + tradeTimesArr[0]
  );

  console.log(tradeTimesArr);

  let moneyAnserArr = moneyAnser.split("-").map((s) => parseInt(s, 10));
  moneyAnserArr = Array.from(
    { length: moneyAnserArr[1] - moneyAnserArr[0] + 1 },
    (_, index) => index + moneyAnserArr[0]
  );
  console.log(moneyAnserArr);

  const apisecret = process.env.apisecret;
  const apikey = process.env.apikey;
  const client = new backpack_client_1.BackpackClient(apisecret, apikey);

  let tokenIndexFirst = getRandomIndex(tokenAnswer);
  let tokenTradeFirst = tokenAnswer[tokenIndexFirst];
  await init(
    client,
    tokenTradeFirst,
    randomAnserArr,
    moneyAnserArr.map((num) => num * 0.1),
    tradeTimesArr[1]
  );
  dailyTrade(client, tokenAnswer, randomAnserArr, moneyAnserArr, tradeTimesArr);
})();

const dailyTrade = async (
  client,
  tokenAnswer,
  randomAnserArr,
  moneyAnserArr,
  tradeTimesArr
) => {
  const now = new Date();
  const hour = Math.floor(getRandomInRange(0, 23));
  const minute = Math.floor(getRandomInRange(0, 59));
  const delay = getDelayUntil(hour, minute);
  let tokenIndex = getRandomIndex(tokenAnswer);
  let tokenTrade = tokenAnswer[tokenIndex];
  setTimeout(async () => {
    let times = tradeTimesArr[getRandomIndex(tradeTimesArr)];
    let tradeActual = moneyAnserArr;
    if (now.getUTCDay() !== 3) {
      // Wednesday in UTC
      tradeActual = moneyAnserArr.map((num) => num * 0.1); // Random small volume
    }
    await init(client, tokenTrade, randomAnserArr, tradeActual, times);
    dailyTrade(
      client,
      tokenAnswer,
      randomAnserArr,
      moneyAnserArr,
      tradeTimesArr
    );
  }, delay);
};

function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length);
}

//返回小数位
function countDecimalPlaces(number) {
  let decimalPart = String(number).match(/\.(\d*)/);
  return decimalPart ? decimalPart[1].length : 0;
}

let successbuy = 0;
let sellbuy = 0;

const init = async (client, token, random, money, times) => {
  console.log(`计划交易：${times}次`);
  let markets = await client.Markets();
  let tokensDecimal = {};
  //token 最小交易小数位
  markets.forEach((market) => {
    tokensDecimal[market.symbol] = countDecimalPlaces(
      market.filters.quantity.minQuantity
    );
  });
  console.log(getNowFormatDate(), "初始化完成");
  let i = 1;
  while (i <= times) {
    try {
      let randomIndex = getRandomIndex(random);
      let moneyIndex = getRandomIndex(money);

      console.log(`成功买入次数:${successbuy},成功卖出次数:${sellbuy}`);
      console.log(getNowFormatDate(), `等待${random[randomIndex]}秒...`);
      await delay(random[randomIndex] * 1000);
      console.log(getNowFormatDate(), "正在获取账户信息中...");
      let userbalance = await client.Balance();
      let tokenPriceList = await client.Tickers();
      Object.keys(userbalance).map((item) => {
        if (item == "USDC") {
          userbalance[item].value = userbalance[item].available;
          userbalance[item].symbol = `USDC`;
          return;
        }
        userbalance[item].value =
          userbalance[item].available *
          tokenPriceList.find((token) => token.symbol == `${item}_USDC`)
            .lastPrice;
        userbalance[item].symbol = `${item}_USDC`;
      });
      //当前账号价值最大的币种名字 跳过symbol为USDC的币种
      let maxToken = Object.keys(userbalance)
        .filter((item) => item != "USDC" && token.includes(`${item}_USDC`))
        .reduce((a, b) =>
          userbalance[a].value > userbalance[b].value ? a : b
        );
      console.log("账号价值最大的币种", maxToken);
      let condition1 =
        maxToken == "USDC" ? true : userbalance[maxToken].value < 8;
      //判断账号USDC余额是否大于5以及购买的币种余额是否小于5USDC
      if (userbalance.USDC.available > 5 && condition1) {
        //根据比例随机买入随机币种
        await buyfun(
          client,
          token,
          money[moneyIndex],
          tokensDecimal,
          successbuy
        );
      } else {
        //指定账号价值最大的币
        await sellfun(client, token, tokensDecimal, sellbuy);
        return;
      }
    } catch (e) {
      if (e.message == "卖出成功、程序重新执行") {
        i++;
        console.log(`当前计划已执行${i}次`);
      }
      console.log(getNowFormatDate(), "挂单失败，重新挂单中...");
      await delay(1000);
    }
  }
  console.log("完成当前计划任务");
};
