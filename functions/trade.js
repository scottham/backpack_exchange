const { getNowFormatDate } = require("./tools");

// 挂单。通过money变量的比例用USDC买入token
const buyfun = async (client, token, money, tokensDecimal, successbuy) => {
  //取消所有未完成订单
  let GetOpenOrders = await client.GetOpenOrders({ symbol: token });
  if (GetOpenOrders.length > 0) {
    let CancelOpenOrders = await client.CancelOpenOrders({ symbol: token });
    console.log(getNowFormatDate(), "取消了所有挂单");
  } else {
    console.log(getNowFormatDate(), "账号订单正常，无需取消挂单");
  }
  console.log(getNowFormatDate(), "正在获取账户信息中...");
  //获取账户信息
  let userbalance = await client.Balance();
  console.log(getNowFormatDate(), "账户信息:", userbalance);
  console.log(getNowFormatDate(), "正在获取" + token + "的市场当前价格中...");
  let PayUSDC = userbalance.USDC.available * (money / 100) - 2;
  //获取当前
  let { lastPrice } = await client.Ticker({ symbol: token });
  console.log(getNowFormatDate(), "" + token + "的市场当前价格:", lastPrice);
  console.log(token, "小数位", tokensDecimal[token]);
  console.log(
    getNowFormatDate(),
    `正在买入中... 花${PayUSDC.toFixed(
      tokensDecimal[token]
    ).toString()}个USDC买${token}`
  );
  let quantitys = (PayUSDC / lastPrice)
    .toFixed(tokensDecimal[token])
    .toString();
  let orderResultBid = await client.ExecuteOrder({
    orderType: "Limit",
    price: lastPrice.toString(),
    quantity: quantitys,
    side: "Bid", //买
    symbol: token,
    timeInForce: "IOC",
  });
  if (orderResultBid?.status == "Filled" && orderResultBid?.side == "Bid") {
    console.log(getNowFormatDate(), "下单成功");
    successbuy += 1;
    console.log(
      getNowFormatDate(),
      "订单详情:",
      `购买价格:${orderResultBid.price}, 购买数量:${orderResultBid.quantity}, 订单号:${orderResultBid.id}`
    );
    throw new Error("买入成功、程序重新执行");
  } else {
    console.log(getNowFormatDate(), "下单失败");
    throw new Error("买入失败");
  }
};

const sellfun = async (client, token, tokensDecimal, sellbuy) => {
  //取消所有未完成订单
  let GetOpenOrders = await client.GetOpenOrders({ symbol: token });
  if (GetOpenOrders.length > 0) {
    let CancelOpenOrders = await client.CancelOpenOrders({ symbol: token });
    console.log(getNowFormatDate(), "取消了所有挂单");
  } else {
    console.log(getNowFormatDate(), "账号订单正常，无需取消挂单");
  }
  console.log(getNowFormatDate(), "正在获取账户信息中...");
  //获取账户信息
  let userbalance2 = await client.Balance();
  console.log(getNowFormatDate(), "账户信息:", userbalance2);
  console.log(getNowFormatDate(), `正在获取${token}的市场当前价格中...`);
  //获取当前
  let currentToken = token.split("_")[0];
  let { lastPrice: lastPriceask } = await client.Ticker({ symbol: token });
  console.log(getNowFormatDate(), `${token}的市场当前价格:`, lastPriceask);
  let quantitys = (userbalance2[currentToken].available * 0.9)
    .toFixed(tokensDecimal[token])
    .toString();
  console.log(getNowFormatDate(), `正在卖出中... 卖${quantitys}个${token}`);
  let orderResultAsk = await client.ExecuteOrder({
    orderType: "Limit",
    postOnly: false,
    price: lastPriceask.toString(),
    quantity: quantitys,
    side: "Ask", //卖
    symbol: token,
  });

  if (orderResultAsk?.status == "Filled" && orderResultAsk?.side == "Ask") {
    console.log(getNowFormatDate(), "卖出成功");
    sellbuy += 1;
    console.log(
      getNowFormatDate(),
      "订单详情:",
      `卖出价格:${orderResultAsk.price}, 卖出数量:${orderResultAsk.quantity}, 订单号:${orderResultAsk.id}`
    );
    throw new Error("卖出成功、程序重新执行");
  } else {
    console.log(getNowFormatDate(), "卖出失败");
    throw new Error("卖出失败");
  }
};

exports.buyfun = buyfun;
exports.sellfun = sellfun;
