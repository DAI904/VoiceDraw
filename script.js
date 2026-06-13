// 获取页面中的画布
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");

// 用来保存每一步画布状态，方便撤销
let history = [];

// 页面加载后，先保存一张空白画布
saveCanvasState();

// 执行用户输入的指令
function runCommand() {
  const input = document.getElementById("commandInput");
  const command = input.value.trim();

  if (command === "") {
    message.innerText = "请先输入一条指令。";
    return;
  }

  message.innerText = "识别到指令：" + command;

  // 清空画布
  if (command.includes("清空")) {
    saveCanvasState();
    clearCanvas();
    message.innerText = "已清空画布。";
    input.value = "";
    return;
  }

  // 撤销上一步
  if (command.includes("撤销") || command.includes("返回上一步")) {
    undo();
    input.value = "";
    return;
  }

  // 1. 判断颜色
  let color = getColor(command);

  // 2. 判断位置
  let position = getPosition(command);

  // 3. 判断图形
  if (command.includes("圆")) {
    saveCanvasState();
    drawCircle(color, position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一个" + getChineseColor(color) + "圆形。";
  } else if (
    command.includes("矩形") ||
    command.includes("方形") ||
    command.includes("方块")
  ) {
    saveCanvasState();
    drawRectangle(color, position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一个" + getChineseColor(color) + "矩形。";
  } else {
    message.innerText = "暂时无法识别该指令，请尝试：在左边画一个红色圆形 / 在右边画一个蓝色矩形 / 撤销 / 清空画布";
  }

  input.value = "";
}

// 判断颜色
function getColor(command) {
  if (command.includes("红")) {
    return "red";
  } else if (command.includes("蓝")) {
    return "blue";
  } else if (command.includes("绿")) {
    return "green";
  } else if (command.includes("黑")) {
    return "black";
  } else if (command.includes("黄")) {
    return "yellow";
  } else if (command.includes("紫")) {
    return "purple";
  } else {
    return "black";
  }
}

// 判断位置
function getPosition(command) {
  if (command.includes("左")) {
    return "left";
  } else if (command.includes("右")) {
    return "right";
  } else if (command.includes("上")) {
    return "top";
  } else if (command.includes("下")) {
    return "bottom";
  } else if (command.includes("中") || command.includes("中间")) {
    return "center";
  } else {
    return "center";
  }
}

// 根据位置获取坐标
function getCoordinates(position) {
  if (position === "left") {
    return { x: 180, y: 200 };
  } else if (position === "right") {
    return { x: 520, y: 200 };
  } else if (position === "top") {
    return { x: 350, y: 100 };
  } else if (position === "bottom") {
    return { x: 350, y: 300 };
  } else {
    return { x: 350, y: 200 };
  }
}

// 画圆形
function drawCircle(color, position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.arc(point.x, point.y, 60, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// 画矩形
function drawRectangle(color, position) {
  const point = getCoordinates(position);

  ctx.fillStyle = color;
  ctx.fillRect(point.x - 60, point.y - 50, 120, 100);
}

// 清空画布
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 保存当前画布状态
function saveCanvasState() {
  const imageData = canvas.toDataURL();
  history.push(imageData);
}

// 撤销上一步
function undo() {
  if (history.length <= 1) {
    clearCanvas();
    message.innerText = "已经没有可以撤销的步骤了。";
    return;
  }

  const previousState = history.pop();
  const img = new Image();

  img.onload = function () {
    clearCanvas();
    ctx.drawImage(img, 0, 0);
    message.innerText = "已撤销上一步。";
  };

  img.src = previousState;
}

// 英文颜色转中文
function getChineseColor(color) {
  if (color === "red") return "红色";
  if (color === "blue") return "蓝色";
  if (color === "green") return "绿色";
  if (color === "black") return "黑色";
  if (color === "yellow") return "黄色";
  if (color === "purple") return "紫色";
  return "";
}

// 英文位置转中文
function getChinesePosition(position) {
  if (position === "left") return "左边";
  if (position === "right") return "右边";
  if (position === "top") return "上方";
  if (position === "bottom") return "下方";
  if (position === "center") return "中间";
  return "";
}