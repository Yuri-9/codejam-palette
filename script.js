const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let squireX = 0;
let squireY = 0;
const scale = 4;
const scaleNumber = 512 / scale;
let currentTool = 'pencil';
let colorSelected = localStorage.getItem('colorSelected') || '#00fff0';
const objectColor = {
  currentColor: colorSelected,
  prevColor: localStorage.getItem('prevColor') || '#00ff00',
  redColor: '#ff0000',
  blueColor: '#0000ff',
};

document.getElementById('currentColorBackground').style.backgroundColor = colorSelected;
document.getElementById('prevColorBackground').style.backgroundColor = objectColor.prevColor;
document.getElementById('redColorBackground').style.backgroundColor = objectColor.redColor;
document.getElementById('blueColorBackground').style.backgroundColor = objectColor.blueColor;

(function initCanvasAfterReload() {
  const dataURL = localStorage.getItem('imageDataURL');
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
}());

function removeClassClickBtn(className) {
  const arrayElements = document.querySelectorAll(className);
  arrayElements.forEach((item) => item.classList.remove('clickBtn'));
}

function clearCanvas() {
  ctx.clearRect(0, 0, 512, 512);
}

function setTool(event) {
  const elementTool = event.target;
  removeClassClickBtn('.menu_tools--item');
  elementTool.classList.add('clickBtn');
  currentTool = elementTool.id;
  if (currentTool === 'clear') clearCanvas();
}

function setToolKeyboard(element) {
  const elementTool = document.getElementById(element);
  removeClassClickBtn('.menu_tools--item');
  elementTool.classList.add('clickBtn');
  currentTool = elementTool.id;
}

function keyboardHandler(event) {
  switch (event.code) {
    case 'KeyF':
      setToolKeyboard('bucket');
      break;
    case 'KeyC':
      setToolKeyboard('picker');
      break;
    case 'KeyP':
      setToolKeyboard('pencil');
      break;
    default:
  }
}

function getInputColor(event) {
  const { value } = event.target;
  objectColor.prevColor = objectColor.currentColor;
  objectColor.currentColor = value;

  const { currentColor, prevColor } = objectColor;

  document.getElementById('currentColorBackground').style.background = currentColor;
  document.getElementById('prevColorBackground').style.background = prevColor;

  colorSelected = currentColor;
}

function setColor(event) {
  const itemColor = event.target.closest('LI');
  removeClassClickBtn('.menu_color--item');
  itemColor.classList.add('clickBtn');
  colorSelected = objectColor[itemColor.id];
}

function setSize(event) {
  removeClassClickBtn('.menu_size--item');
  event.target.classList.add('clickBtn');
}

function drawPencil(event) {
  if (!isDrawing) return;
  if (currentTool === 'pencil') {
    for (let i = 0; i <= scale; i += 1) {
      if (scaleNumber * i - event.offsetX < 0) {
        squireX = i * scaleNumber;
      }
      if (scaleNumber * i - event.offsetY < 0) {
        squireY = i * scaleNumber;
      }
    }
    ctx.fillStyle = colorSelected;
    ctx.fillRect(squireX, squireY, scaleNumber, scaleNumber);
  }
}

function changeHexToRGBA(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return [r, g, b, 255];
}

function fillColor(event) {
  const colorPixel = ctx.getImageData(event.offsetX, event.offsetY, 1, 1);

  const colorSelectedRGBA = changeHexToRGBA(colorSelected);
  const canvasData = ctx.getImageData(0, 0, 512, 512);

  for (let i = 0; i < canvasData.data.length; i += 4) {
    if (colorPixel.data.every((item, ind) => item === canvasData.data[i + ind])) {
      for (let j = 0; j < 4; j += 1) {
        canvasData.data[i + j] = colorSelectedRGBA[j];
      }
    }
  }
  ctx.putImageData(canvasData, 0, 0);
}

function changeRgbaToHex(rgbaData) {
  let [r, g, b, a] = rgbaData;
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  a = a.toString(16);
  if (r.length === 1) r = `0${r}`;
  if (g.length === 1) g = `0${g}`;
  if (b.length === 1) b = `0${b}`;
  if (a.length === 1) a = `0${a}`;
  return `#${r}${g}${b}${a}`;
}

function chooseColorPicker(event) {
  removeClassClickBtn('.menu_color--item');
  document.getElementById('currentColor').classList.add('clickBtn');

  const { offsetX, offsetY } = event;
  const rgbaData = ctx.getImageData(offsetX, offsetY, 1, 1).data;

  let colorNewHex = changeRgbaToHex(rgbaData);
  if (colorNewHex === colorSelected) return;
  if (colorNewHex === '#00000000') {
    colorNewHex = '#ffffffff';
  }
  colorSelected = colorNewHex;
  objectColor.prevColor = objectColor.currentColor;
  objectColor.currentColor = colorNewHex;

  document.getElementById('currentColorBackground').style.background = colorNewHex;
  document.getElementById('prevColorBackground').style.background = objectColor.prevColor;
}

function setLocalStorage() {
  const imageDataURL = canvas.toDataURL();

  localStorage.setItem('imageDataURL', imageDataURL);
  localStorage.setItem('colorSelected', colorSelected);
  localStorage.setItem('prevColor', objectColor.prevColor);
}

function mousedownHandler(event) {
  isDrawing = true;
  switch (currentTool) {
    case 'bucket':
      fillColor(event);
      break;
    case 'picker':
      chooseColorPicker(event);
      break;
    case 'pencil':
      drawPencil(event);
      break;
    default:
  }
}

canvas.addEventListener('mousemove', drawPencil);
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousedown', mousedownHandler);

document.querySelector('.menu_tools').addEventListener('mousedown', setTool);
document.querySelector('.menu_color').addEventListener('mousedown', setColor);
document.querySelector('.menu_size').addEventListener('mousedown', setSize);

document.addEventListener('keydown', keyboardHandler);
window.addEventListener('input', getInputColor);
window.addEventListener('beforeunload', setLocalStorage);
