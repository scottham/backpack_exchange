//当前年份日期时分秒
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var strHour = date.getHours();
  var strMinute = date.getMinutes();
  var strSecond = date.getSeconds();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (strHour >= 0 && strHour <= 9) {
    strHour = "0" + strHour;
  }
  if (strMinute >= 0 && strMinute <= 9) {
    strMinute = "0" + strMinute;
  }
  if (strSecond >= 0 && strSecond <= 9) {
    strSecond = "0" + strSecond;
  }
  var currentdate =
    date.getFullYear() +
    seperator1 +
    month +
    seperator1 +
    strDate +
    " " +
    strHour +
    seperator2 +
    strMinute +
    seperator2 +
    strSecond;
  return currentdate;
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
function getDelayUntil(hour, minute) {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute
  );

  // If target time is already passed for today, schedule for the next day
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  console.log(`现时间：${now}，预计交易时间：${target}`);
  return target - now;
}
module.exports = {
  getNowFormatDate,
  getRandomInRange,
  getDelayUntil,
};
