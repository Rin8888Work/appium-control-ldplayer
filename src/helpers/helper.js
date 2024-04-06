const fs = require("fs");
const axios = require("axios");

function getRandomColor() {
  const colors = [
    "\x1b[31m", // Đỏ
    "\x1b[32m", // Xanh lá cây
    "\x1b[33m", // Vàng
    "\x1b[34m", // Xanh dương
    "\x1b[35m", // Tím
    "\x1b[36m", // Xanh da trời
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
function log(message) {
  const color = getRandomColor();
  console.log(color + JSON.stringify(message) + "\x1b[0m"); // Kết thúc màu
}

function delay(s, isMilisecond) {
  return new Promise((resolve) =>
    setTimeout(resolve, isMilisecond ? s : s * 1000)
  );
}

function delayRandom(minSeconds = 1, maxSeconds = 3) {
  const randomDelay =
    Math.random() * (maxSeconds - minSeconds + 1) + minSeconds; // Generate a random delay in seconds within the specified range
  return new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readAndRemoveLine(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Tách dữ liệu thành các dòng
      const lines = data.split("\n");

      // Lấy dòng đầu tiên
      const firstLine = lines[0].trim();

      // // Xóa dòng đầu tiên
      lines.shift();

      // Ghi lại dữ liệu vào tệp
      fs.writeFile(filePath, lines.join("\n"), "utf8", (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(firstLine);
      });
    });
  });
}

async function refreshIp(link) {
  try {
    // Make a GET request to the API endpoint
    const response = await axios.get(link);

    // Extract data from the response
    const data = response.data;
    console.log(data);
    return true;
  } catch (error) {
    // Handle any errors
    return false;
  }
}

function getArgvProcess(args) {
  const result = [];
  args?.map((arg) => {
    if (arg.includes("=")) {
      const matchArg = arg.replaceAll("-", "").split("=");
      const [flag, value] = matchArg;
      result.push({ flag, value });
    }
  });
  return result;
}

function getArg(argName, args) {
  return args.find((i) => i.flag === argName);
}

module.exports = {
  getRandomColor,
  log,
  delay,
  delayRandom,
  getRandomNumber,
  readAndRemoveLine,
  refreshIp,
  getArgvProcess,
  getArg,
};
