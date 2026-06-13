const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const voiceText = document.getElementById("voiceText");

let history = [];
let recognition = null;
let isListening = false;

saveCanvasState();

// 启动语音控制
function startVoiceControl() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    message.innerText = "当前浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器测试。";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.continuous = true;
  recognition.interimResults = false;

  isListening = true;
  message.innerText = "语音控制已启动，请直接说出绘图指令。";

  recognition.onresult = function (event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const command = event.results[i][0].transcript.trim();

        if (voiceText) {
          voiceText.innerText = "语音识别结果：" + command;
        }

        message.innerText = "正在执行语音指令：" + command;
        runVoiceCommand(command);
      }
    }
  };

  recognition.onerror = function (event) {
    message.innerText = "语音识别出现问题：" + event.error + "。请重试或检查麦克风权限。";
  };

  recognition.onend = function () {
    if (isListening) {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.log("语音识别重启中：", error);
        }
      }, 500);
    }
  };

  try {
    recognition.start();
  } catch (error) {
    console.log("语音识别启动中：", error);
  }
}

// 停止语音控制
function stopVoiceControl() {
  isListening = false;

  if (recognition) {
    recognition.stop();
  }

  message.innerText = "语音控制已停止。";
}

// 兼容旧按钮名称
function startVoiceRecognition() {
  startVoiceControl();
}

// 执行语音指令
function runVoiceCommand(command) {
  if (!command) {
    return;
  }

  if (
    command.includes("停止语音") ||
    command.includes("停止识别") ||
    command.includes("停止语音控制") ||
    command.includes("结束语音")
  ) {
    stopVoiceControl();
    return;
  }

  const startTime = performance.now();

  const commandList = splitComplexCommand(command);

  for (let i = 0; i < commandList.length; i++) {
    executeSingleCommand(commandList[i]);
  }

  const endTime = performance.now();
  const usedTime = Math.round(endTime - startTime);

  message.innerText = message.innerText + " 指令解析与绘图执行耗时：" + usedTime + " ms。";
  console.log("本次指令执行耗时：" + usedTime + "ms");
}

// 拆解复杂指令
function splitComplexCommand(command) {
  return command
    .replace(/，|。|；|,/g, "然后")
    .split(/然后|接着|并且|同时|再(?=在|画|清空|撤销|保存|重新)/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// 执行单条指令
function executeSingleCommand(command) {
  if (command.includes("帮助") || command.includes("怎么用")) {
    message.innerText = "你可以说：画一幅风景画、在左边画一个红色圆形、画一个太阳、撤销、清空画布、保存图片、停止语音控制。";
    return;
  }

  if (command.includes("清空")) {
    saveCanvasState();
    clearCanvas();
    message.innerText = "已根据语音指令清空画布。";
    return;
  }

  if (command.includes("撤销") || command.includes("返回上一步")) {
    undo();
    return;
  }

  if (command.includes("保存")) {
    saveImage();
    return;
  }

  const color = getColor(command);
  const position = getPosition(command);

  if (
    command.includes("风景") ||
    command.includes("一幅画") ||
    command.includes("场景") ||
    command.includes("完整画")
  ) {
    saveCanvasState();
    drawLandscape();
    message.innerText = "已生成一幅稳定构图的随机风景画。";
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
    message.innerText = "暂时无法识别该语音指令，请尝试：画一幅风景画 / 画一个太阳 / 撤销 / 清空画布 / 保存图片。";
  }
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

// 基础图形：圆形
function drawCircle(color, position) {
  const point = getCoordinates(position);

  ctx.beginPath();
  ctx.arc(point.x, point.y, 60, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// 基础图形：矩形
function drawRectangle(color, position) {
  const point = getCoordinates(position);

  ctx.fillStyle = color;
  ctx.fillRect(point.x - 60, point.y - 50, 120, 100);
}

// 基础图形：三角形
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

// 组合图案：太阳
function drawSun(position) {
  const point = getCoordinates(position);
  drawSunAt(point.x, point.y);
}

// 组合图案：房子
function drawHouse(position) {
  const point = getCoordinates(position);
  drawHouseAt(point.x, point.y);
}

// 组合图案：云朵
function drawCloud(position) {
  const point = getCoordinates(position);
  drawCloudAt(point.x, point.y);
}

// 组合图案：笑脸
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

// 组合图案：星星
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

// 稳定构图版随机风景画
function drawLandscape() {
  clearCanvas();

  const skyColors = ["#87ceeb", "#9bdcff", "#b3e5fc"];
  const grassColors = ["#7ec850", "#6abf69", "#8bc34a"];
  const flowerColors = ["red", "yellow", "pink", "purple", "orange", "white"];

  const skyColor = randomChoice(skyColors);
  const grassColor = randomChoice(grassColors);
  const horizonY = 250;

  // 天空
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, horizonY);

  // 草地
  ctx.fillStyle = grassColor;
  ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

  // 太阳：固定在左上或右上，避免遮挡主体
  const sunPosition = randomChoice([
    { x: 90, y: 80 },
    { x: 590, y: 80 }
  ]);
  drawSunAt(sunPosition.x, sunPosition.y);

  // 云朵：只在天空区域随机轻微偏移
  const cloudPositions = [
    { x: 230, y: 80 },
    { x: 430, y: 100 },
    { x: 560, y: 130 }
  ];

  const cloudCount = randomInt(2, 3);
  for (let i = 0; i < cloudCount; i++) {
    const cloud = cloudPositions[i];
    drawCloudAt(
      cloud.x + randomInt(-20, 20),
      cloud.y + randomInt(-10, 10)
    );
  }

  // 远山
  drawMountain(150, horizonY, randomInt(90, 120), "#8e9aaf");
  drawMountain(330, horizonY, randomInt(110, 145), "#6c7a89");
  drawMountain(520, horizonY, randomInt(90, 125), "#8e9aaf");

  // 小池塘：放在左下角，避免和房子、小路重叠
  drawStablePond();

  // 房子：固定在右侧中景
  const houseX = 505 + randomInt(-15, 15);
  const houseY = 280;
  drawHouseAt(houseX, houseY);

  // 小路：从房子门口向下
  drawStablePath(houseX, houseY);

  // 树木：左右两侧
  drawTreeAt(115 + randomInt(-10, 10), 295);
  drawTreeAt(625 + randomInt(-10, 10), 300);

  // 花朵：避开房子、小路和池塘
  const flowerAreas = [
    { minX: 60, maxX: 160, minY: 340, maxY: 375 },
    { minX: 190, maxX: 290, minY: 330, maxY: 375 },
    { minX: 585, maxX: 665, minY: 335, maxY: 375 }
  ];

  for (let i = 0; i < 8; i++) {
    const area = randomChoice(flowerAreas);
    drawFlowerAt(
      randomInt(area.minX, area.maxX),
      randomInt(area.minY, area.maxY),
      randomChoice(flowerColors)
    );
  }
}

// 太阳
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

// 云朵
function drawCloudAt(x, y) {
  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(x - 45, y + 10, 28, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 10, 38, 0, Math.PI * 2);
  ctx.arc(x + 35, y, 32, 0, Math.PI * 2);
  ctx.arc(x + 65, y + 12, 25, 0, Math.PI * 2);
  ctx.fill();
}

// 远山
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

// 房子
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

// 树
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

// 小池塘
function drawStablePond() {
  ctx.beginPath();
  ctx.ellipse(270, 345, 85, 35, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = "#4fc3f7";
  ctx.fill();

  ctx.strokeStyle = "#0288d1";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(230, 338);
  ctx.quadraticCurveTo(265, 325, 310, 338);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(240, 355);
  ctx.quadraticCurveTo(270, 345, 300, 355);
  ctx.stroke();
}

// 小路
function drawStablePath(houseX, houseY) {
  ctx.beginPath();
  ctx.moveTo(houseX - 18, houseY + 70);
  ctx.lineTo(houseX + 18, houseY + 70);
  ctx.lineTo(houseX + 65, 400);
  ctx.lineTo(houseX - 55, 400);
  ctx.closePath();

  ctx.fillStyle = "#d2b48c";
  ctx.fill();

  ctx.strokeStyle = "#a67c52";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 花
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

// 随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机选择数组元素
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 清空画布
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 兼容旧清空按钮
function clearCanvasByButton() {
  saveCanvasState();
  clearCanvas();
  message.innerText = "已清空画布。";
}

// 保存当前画布状态
function saveCanvasState() {
  const imageData = canvas.toDataURL();
  history.push(imageData);
}

// 撤销
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

// 保存图片
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