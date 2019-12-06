/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let isDrawing = false;
let squireX = 0;
let squireY = 0;
const scale = 4;
const scaleNumber = 512 / scale;


let colorGlobal;
let prevColor;
colorGlobal = localStorage.getItem('colorSocket1');
prevColor = localStorage.getItem('colorSocket2');
// eslint-disable-next-line eqeqeq
if (colorGlobal == undefined) {
  colorGlobal = '#ffff00';
  prevColor = '#00ff40';
}

document.querySelector('#red').style.backgroundColor = '#ff0000';
document.querySelector('#blue').style.backgroundColor = '#0000ff';
document.querySelector('#current_color').style.backgroundColor = colorGlobal;
document.querySelector('#prev_color').style.backgroundColor = prevColor;


function chooseTools(event) {
  const chooseToolEL = event.target.classList;
  document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
  chooseToolEL.add('clickBtn');
}

function chooseToolsKeyboard(event) {
  if (event.code === 'KeyF') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_fill_bucket').classList.add('clickBtn');
  }
  if (event.code === 'KeyC') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_choose_color').classList.add('clickBtn');
  }
  if (event.code === 'KeyP') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_pencil').classList.add('clickBtn');
  }
}

function chooseColor(event) {
  window.oninput = function oninputColor() {
    prevColor = document.querySelector('#current_color').style.backgroundColor;
    document.querySelector('#prev_color').style.backgroundColor = prevColor;
    const inputColor = document.getElementById('current_color_input').value;
    document.querySelector('#current_color').style.backgroundColor = inputColor;
    colorGlobal = inputColor;
    localStorage.setItem('colorSocket1', colorGlobal);
    localStorage.setItem('colorSocket2', prevColor);
  };

  const colorEv = event.target;
  if (colorEv.tagName === 'DIV') return;
  document.querySelector('.menu_color .clickBtn').classList.remove('clickBtn');
  colorEv.classList.add('clickBtn');
  colorGlobal = colorEv.previousElementSibling.style.backgroundColor;
}

function chooseSize(event) {
  document.querySelector('.menu_size .clickBtn').classList.remove('clickBtn');
  event.target.classList.add('clickBtn');
}

function drawPencil(event) {
  if (document.querySelector('.menu_tools--btn_pencil').classList.length !== 3) return;
  if (!isDrawing) return;
  for (let i = 0; i <= scale; i++) {
    if (scaleNumber * i - event.offsetX < 0) {
      squireX = i * scaleNumber;
    }
    if (scaleNumber * i - event.offsetY < 0) {
      squireY = i * scaleNumber;
    }
  }
  ctx.fillStyle = colorGlobal;
  ctx.fillRect(squireX, squireY, scaleNumber, scaleNumber);
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function fillColor(event) {
  if (document.querySelector('.menu_tools--btn_fill_bucket').classList.length !== 3) return;
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  const xEl = event.offsetX;
  const yEl = event.offsetY;
  const rgbaEl = ctx.getImageData(xEl, yEl, 1, 1).data;
  let rgbaStringEl = `rgb(${rgbaEl[0]}, ${rgbaEl[1]}, ${rgbaEl[2]})`;
  let colorGlobalRbg;
  if (rgbaStringEl === 'rgb(0,0,0)' && (colorGlobal[0] === '#')) {
    rgbaStringEl = 'rgb(255,255,255)';
    colorGlobalRbg = hexToRGB(colorGlobal);
  } else {
    colorGlobalRbg = colorGlobal;
  }
  if (rgbaStringEl !== colorGlobalRbg) {
    const fillArea = function fillArea() {
      for (let x = 0; x < scale; x++) {
        for (let y = 0; y < scale; y++) {
          const pixelCanvasColor = ctx.getImageData((x * scaleNumber + 1),
            (y * scaleNumber + 1), 1, 1).data;
          const pixelCanvasColorRgb = `rgb(${pixelCanvasColor[0]}, ${pixelCanvasColor[1]}, ${pixelCanvasColor[2]})`;
          if (pixelCanvasColorRgb === rgbaStringEl) {
            ctx.fillStyle = colorGlobal;
            ctx.fillRect(x * scaleNumber, y * scaleNumber, scaleNumber, scaleNumber);
          }
        }
      }
    };

    fillArea();
  }
}

// eslint-disable-next-line func-names
canvas.onmousedown = function (event) {
  if (document.querySelector('.menu_tools--btn_choose_color').classList.length !== 3) return;
  const x = event.offsetX;
  const y = event.offsetY;
  const rgba = ctx.getImageData(x, y, 1, 1).data;
  let rgbaString = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`;
  if (rgbaString === 'rgba(0,0,0,0)') {
    rgbaString = 'rgba(255,255,255,255)';
  }

  document.querySelector('.menu_color .clickBtn').classList.remove('clickBtn');
  document.querySelector('#current_color_label').classList.add('clickBtn');

  document.querySelector('#current_color').style.backgroundColor = rgbaString;
  colorGlobal = rgbaString;
};

canvas.addEventListener('mousemove', drawPencil);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousedown', () => isDrawing = true);

document.querySelector('.menu_tools').addEventListener('mousedown', chooseTools);
document.querySelector('.menu_color').addEventListener('mousedown', chooseColor);
document.querySelector('.menu_size').addEventListener('mousedown', chooseSize);
document.addEventListener('keydown', chooseToolsKeyboard);

canvas.addEventListener('mousedown', fillColor);
