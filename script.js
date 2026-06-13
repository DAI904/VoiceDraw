const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");

let history = [];

saveCanvasState();

function runCommand() {
  const input = document.getElementById("commandInput");
  const command = input.value.trim();

  if (command === "") {
    message.innerText = "请先输入一条指令。";
    return;
  }

  message.innerText = "识别到指令：" + command;

  if (command.includes("清空")) {
    saveCanvasState();
    clearCanvas();
    message.innerText = "已清空画布。";
    input.value = "";
    return;
  }

  if (command.includes("撤销") || command.includes("返回上一步")) {
    undo();
    input.value = "";
    return;
  }

  if (command.includes("保存")) {
    saveImage();
    input.value = "";
    return;
  }

  let color = getColor(command);
  let position = getPosition(command);

  if (
    command.includes("风景") ||
    command.includes("一幅画") ||
    command.includes("场景") ||
    command.includes("完整画")
  ) {
    saveCanvasState();
    drawLandscape();
    message.innerText = "已生成一幅完整风景画。";
  } else if (command.includes("太阳")) {
    saveCanvasState();
    drawSun(position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一个太阳。";
  } else if (command.includes("房子") || command.includes("房屋")) {
    saveCanvasState();
    drawHouse(position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一座房子。";
  } else if (command.includes("笑脸") || command.includes("表情")) {
    saveCanvasState();
    drawSmile(position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一个笑脸。";
  } else if (command.includes("云") || command.includes("云朵")) {
    saveCanvasState();
    drawCloud(position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一朵云。";
  } else if (command.includes("星星") || command.includes("五角星")) {
    saveCanvasState();
    drawStar(position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一颗星星。";
  } else if (command.includes("圆")) {
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
  } else if (
    command.includes("三角形") ||
    command.includes("三角")
  ) {
    saveCanvasState();
    drawTriangle(color, position);
    message.innerText = "已在" + getChinesePosition(position) + "绘制一个" + getChineseColor(color) + "三角形。";
  } else {
    message.innerText = "暂时无法识别该指令，请尝试：画一幅风景画 / 画一个太阳 / 画一座房子 / 在左边画一个红色圆形 / 保存图片";
  }

  input.value = "";
}

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    message.innerText = "当前浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器测试。";
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = false;

  message.innerText = "正在聆听，请说出绘图指令，例如：画一幅风景画";

  recognition.start();

  recognition.onresult = function (event) {
    const voiceText = event.results[0][0].transcript;
    const input = document.getElementById("commandInput");

    input.value = voiceText;
    message.innerText = "语音识别结果：" + voiceText;

    runCommand();
  };

  recognition.onerror = function (event) {
    message.innerText = "语音识别失败，请重试。错误信息：" + event.error;
  };

  recognition.onend = function () {
    console.log("语音识别结束");
  };
}

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
  } else if (command.includes("橙")) {
    return "orange";
  } else if (command.includes("粉")) {
    return "pink";
  } else {
    return "black";
  }
}

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

function getCoordinates(position) {
  if (position === "left") {
    return { x: 180, y: 200 };
  } else if (position === "right") {
    return { x: 520, y: 200 };
  } else if (position === "top") {
    return { x: 350, y: 110 };
  } else if (position === "bottom") {
    return { x: 350, y: 290 };
  } else {
    return { x: 350, y: 200 };
  }
}

function drawCircle(color, position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.arc(point.x, point.y, 60, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawRectangle(color, position) {
  const point = getCoordinates(position);

  ctx.fillStyle = color;
  ctx.fillRect(point.x - 60, point.y - 50, 120, 100);
}

function drawTriangle(color, position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.moveTo(point.x, point.y - 70);
  ctx.lineTo(point.x - 70, point.y + 60);
  ctx.lineTo(point.x + 70, point.y + 60);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}

function drawSun(position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.arc(point.x, point.y, 45, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();

  ctx.strokeStyle = "orange";
  ctx.lineWidth = 4;

  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    const startX = point.x + Math.cos(angle) * 60;
    const startY = point.y + Math.sin(angle) * 60;
    const endX = point.x + Math.cos(angle) * 85;
    const endY = point.y + Math.sin(angle) * 85;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function drawHouse(position) {
  const point = getCoordinates(position);

  ctx.fillStyle = "#f4c27a";
  ctx.fillRect(point.x - 70, point.y - 20, 140, 100);

  ctx.beginPath();
  ctx.moveTo(point.x - 90, point.y - 20);
  ctx.lineTo(point.x, point.y - 100);
  ctx.lineTo(point.x + 90, point.y - 20);
  ctx.closePath();
  ctx.fillStyle = "#c0392b";
  ctx.fill();

  ctx.fillStyle = "#8b4513";
  ctx.fillRect(point.x - 20, point.y + 25, 40, 55);

  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(point.x - 55, point.y + 5, 30, 30);
  ctx.fillRect(point.x + 25, point.y + 5, 30, 30);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(point.x - 70, point.y - 20, 140, 100);
}

function drawSmile(position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.arc(point.x, point.y, 70, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(point.x - 25, point.y - 20, 8, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(point.x + 25, point.y - 20, 8, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(point.x, point.y + 5, 35, 0, Math.PI);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();
}

function drawCloud(position) {
  const point = getCoordinates(position);

  ctx.fillStyle = "#dff6ff";

  ctx.beginPath();
  ctx.arc(point.x - 50, point.y + 10, 35, 0, Math.PI * 2);
  ctx.arc(point.x - 15, point.y - 15, 45, 0, Math.PI * 2);
  ctx.arc(point.x + 30, point.y, 40, 0, Math.PI * 2);
  ctx.arc(point.x + 65, point.y + 15, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#7f8c8d";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawStar(position) {
  const point = getCoordinates(position);
  const outerRadius = 70;
  const innerRadius = 30;
  const spikes = 5;

  let rotation = Math.PI / 2 * 3;
  let x = point.x;
  let y = point.y;

  ctx.beginPath();
  ctx.moveTo(point.x, point.y - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = point.x + Math.cos(rotation) * outerRadius;
    y = point.y + Math.sin(rotation) * outerRadius;
    ctx.lineTo(x, y);
    rotation += Math.PI / spikes;

    x = point.x + Math.cos(rotation) * innerRadius;
    y = point.y + Math.sin(rotation) * innerRadius;
    ctx.lineTo(x, y);
    rotation += Math.PI / spikes;
  }

  ctx.lineTo(point.x, point.y - outerRadius);
  ctx.closePath();
  ctx.fillStyle = "gold";
  ctx.fill();
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 3;
  ctx.stroke();
}

// 一键绘制完整风景画
function drawLandscape() {
  clearCanvas();

  // 天空
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, canvas.width, 260);

  // 草地
  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, 260, canvas.width, 140);

  // 太阳
  drawSunAt(90, 80);

  // 云朵
  drawCloudAt(230, 80);
  drawCloudAt(520, 100);

  // 远山
  drawMountain(150, 260, 120, "#8e9aaf");
  drawMountain(330, 260, 150, "#6c7a89");
  drawMountain(520, 260, 130, "#8e9aaf");

  // 房子
  drawHouseAt(470, 250);

  // 树
  drawTreeAt(120, 270);
  drawTreeAt(610, 280);

  // 小河
  drawRiver();

  // 小花
  drawFlowerAt(210, 335, "red");
  drawFlowerAt(260, 360, "yellow");
  drawFlowerAt(580, 345, "pink");
  drawFlowerAt(640, 365, "purple");

  // 小路
  drawPath();
}

function drawSunAt(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 38, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();

  ctx.strokeStyle = "orange";
  ctx.lineWidth = 4;

  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
    ctx.lineTo(x + Math.cos(angle) * 75, y + Math.sin(angle) * 75);
    ctx.stroke();
  }
}

function drawCloudAt(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x - 45, y + 10, 28, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 10, 38, 0, Math.PI * 2);
  ctx.arc(x + 35, y, 32, 0, Math.PI * 2);
  ctx.arc(x + 65, y + 12, 25, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountain(x, baseY, height, color) {
  ctx.beginPath();
  ctx.moveTo(x - 120, baseY);
  ctx.lineTo(x, baseY - height);
  ctx.lineTo(x + 120, baseY);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - 35, baseY - height + 35);
  ctx.lineTo(x, baseY - height);
  ctx.lineTo(x + 35, baseY - height + 35);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
}

function drawHouseAt(x, y) {
  ctx.fillStyle = "#f4c27a";
  ctx.fillRect(x - 60, y - 20, 120, 90);

  ctx.beginPath();
  ctx.moveTo(x - 80, y - 20);
  ctx.lineTo(x, y - 90);
  ctx.lineTo(x + 80, y - 20);
  ctx.closePath();
  ctx.fillStyle = "#c0392b";
  ctx.fill();

  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x - 18, y + 25, 36, 45);

  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(x - 48, y + 5, 28, 28);
  ctx.fillRect(x + 20, y + 5, 28, 28);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 60, y - 20, 120, 90);
}

function drawTreeAt(x, y) {
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x - 12, y, 24, 75);

  ctx.beginPath();
  ctx.arc(x, y - 20, 45, 0, Math.PI * 2);
  ctx.fillStyle = "#2ecc71";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x - 30, y, 35, 0, Math.PI * 2);
  ctx.arc(x + 30, y, 35, 0, Math.PI * 2);
  ctx.fillStyle = "#27ae60";
  ctx.fill();
}

function drawRiver() {
  ctx.beginPath();
  ctx.moveTo(300, 400);
  ctx.bezierCurveTo(340, 350, 330, 320, 370, 285);
  ctx.bezierCurveTo(410, 250, 470, 270, 500, 250);
  ctx.lineTo(570, 260);
  ctx.bezierCurveTo(520, 300, 470, 330, 450, 400);
  ctx.closePath();
  ctx.fillStyle = "#4fc3f7";
  ctx.fill();

  ctx.strokeStyle = "#0288d1";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawFlowerAt(x, y, color) {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x - 2, y, 4, 25);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 8, y, 7, 0, Math.PI * 2);
  ctx.arc(x + 8, y, 7, 0, Math.PI * 2);
  ctx.arc(x, y - 8, 7, 0, Math.PI * 2);
  ctx.arc(x, y + 8, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
}

function drawPath() {
  ctx.beginPath();
  ctx.moveTo(430, 400);
  ctx.lineTo(500, 400);
  ctx.lineTo(490, 320);
  ctx.lineTo(460, 320);
  ctx.closePath();
  ctx.fillStyle = "#d2b48c";
  ctx.fill();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearCanvasByButton() {
  saveCanvasState();
  clearCanvas();
  message.innerText = "已通过按钮清空画布。";
}

function saveCanvasState() {
  const imageData = canvas.toDataURL();
  history.push(imageData);
}

function undo() {
  if (history.length <= 1) {
    clearCanvas();
    message.innerText = "已经没有可以撤销的步骤了。";
    return;
  }

  history.pop();
  const previousState = history[history.length - 1];
  const img = new Image();

  img.onload = function () {
    clearCanvas();
    ctx.drawImage(img, 0, 0);
    message.innerText = "已撤销上一步。";
  };

  img.src = previousState;
}

function saveImage() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  tempCtx.fillStyle = "white";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = "voicedraw.png";
  link.href = tempCanvas.toDataURL("image/png");
  link.click();

  message.innerText = "已保存当前画布为图片。";
}

function getChineseColor(color) {
  if (color === "red") return "红色";
  if (color === "blue") return "蓝色";
  if (color === "green") return "绿色";
  if (color === "black") return "黑色";
  if (color === "yellow") return "黄色";
  if (color === "purple") return "紫色";
  if (color === "orange") return "橙色";
  if (color === "pink") return "粉色";
  return "";
}

function getChinesePosition(position) {
  if (position === "left") return "左边";
  if (position === "right") return "右边";
  if (position === "top") return "上方";
  if (position === "bottom") return "下方";
  if (position === "center") return "中间";
  return "";
}