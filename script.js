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

  // 保存图片
  if (command.includes("保存")) {
    saveImage();
    input.value = "";
    return;
  }

  // 判断颜色和位置
  let color = getColor(command);
  let position = getPosition(command);

  // 优先判断组合图案
  if (command.includes("太阳")) {
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
    message.innerText = "暂时无法识别该指令，请尝试：画一个太阳 / 画一座房子 / 画一个笑脸 / 在左边画一个红色圆形 / 保存图片";
  }

  input.value = "";
}

// 开始语音识别
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

  message.innerText = "正在聆听，请说出绘图指令，例如：画一个太阳";

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
  } else if (command.includes("橙")) {
    return "orange";
  } else if (command.includes("粉")) {
    return "pink";
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
    return { x: 350, y: 110 };
  } else if (position === "bottom") {
    return { x: 350, y: 290 };
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

// 画三角形
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

// 画太阳：圆形 + 光线
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

// 画房子：墙体 + 屋顶 + 门 + 窗户
function drawHouse(position) {
  const point = getCoordinates(position);

  // 墙体
  ctx.fillStyle = "#f4c27a";
  ctx.fillRect(point.x - 70, point.y - 20, 140, 100);

  // 屋顶
  ctx.beginPath();
  ctx.moveTo(point.x - 90, point.y - 20);
  ctx.lineTo(point.x, point.y - 100);
  ctx.lineTo(point.x + 90, point.y - 20);
  ctx.closePath();
  ctx.fillStyle = "#c0392b";
  ctx.fill();

  // 门
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(point.x - 20, point.y + 25, 40, 55);

  // 窗户
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(point.x - 55, point.y + 5, 30, 30);
  ctx.fillRect(point.x + 25, point.y + 5, 30, 30);

  // 边框
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(point.x - 70, point.y - 20, 140, 100);
}

// 画笑脸：脸 + 眼睛 + 嘴巴
function drawSmile(position) {
  const point = getCoordinates(position);

  // 脸
  ctx.beginPath();
  ctx.arc(point.x, point.y, 70, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  // 左眼
  ctx.beginPath();
  ctx.arc(point.x - 25, point.y - 20, 8, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // 右眼
  ctx.beginPath();
  ctx.arc(point.x + 25, point.y - 20, 8, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // 嘴巴
  ctx.beginPath();
  ctx.arc(point.x, point.y + 5, 35, 0, Math.PI);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();
}

// 画云朵：多个圆形组合
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

// 画星星
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

// 清空画布
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 点击按钮清空画布
function clearCanvasByButton() {
  saveCanvasState();
  clearCanvas();
  message.innerText = "已通过按钮清空画布。";
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

// 保存画布为图片
function saveImage() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  // 添加白色背景，避免保存出来是透明背景
  tempCtx.fillStyle = "white";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 把当前画布内容画到临时画布上
  tempCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = "voicedraw.png";
  link.href = tempCanvas.toDataURL("image/png");
  link.click();

  message.innerText = "已保存当前画布为图片。";
}

// 英文颜色转中文
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

// 英文位置转中文
function getChinesePosition(position) {
  if (position === "left") return "左边";
  if (position === "right") return "右边";
  if (position === "top") return "上方";
  if (position === "bottom") return "下方";
  if (position === "center") return "中间";
  return "";
}