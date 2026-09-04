const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) throw new Error("WebGL 2 não suportado.");

let pontoInicial = null;

const paletaDeCores = {
  '0': [1.0, 1.0, 1.0], // Branco
  '1': [1.0, 0.0, 0.0], // Vermelho
  '2': [0.0, 1.0, 0.0], // Verde
  '3': [0.0, 0.0, 1.0], // Azul (Cor Inicial!)
  '4': [1.0, 1.0, 0.0], // Amarelo
  '5': [1.0, 0.0, 1.0], // Magenta
  '6': [0.0, 1.0, 1.0], // Ciano
  '7': [1.0, 0.5, 0.0], // Laranja
  '8': [0.5, 0.0, 0.5], // Roxo Escuro
  '9': [0.5, 0.5, 0.5]  // Cinza
};

let corAtual = paletaDeCores['3']; 
let verticesDaLinha = new Float32Array([0.0, 0.0]);

// =====================================================
//  O ALGORITMO DE BRESENHAM
// =====================================================
function calcularBresenham(x0, y0, x1, y1) {
  const pontos = [];

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);

  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;

  let erro = dx - dy;

  while (true) {
    pontos.push(x0, y0);

    if (x0 === x1 && y0 === y1) break;

    const erro2 = 2 * erro;
    if (erro2 > -dy) {
      erro -= dy;
      x0 += sx;
    }
    if (erro2 < dx) {
      erro += dx;
      y0 += sy;
    }
  }
  return pontos;
}

// =====================================================
//  CONVERSÃO DE COORDENADAS
// =====================================================
function pixelsParaWebGL(pontosEmPixels) {
  const pontosWebGL = new Float32Array(pontosEmPixels.length);
  for (let i = 0; i < pontosEmPixels.length; i += 2) {
    pontosWebGL[i] = (pontosEmPixels[i] / canvas.width) * 2 - 1;
    pontosWebGL[i+1] = -((pontosEmPixels[i+1] / canvas.height) * 2 - 1);
  }
  return pontosWebGL;
}

// =====================================================
//  CONFIGURAÇÃO WEBGL (Shaders e Buffers)
// =====================================================
const vertexShaderSource = `#version 300 es
            in vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                gl_PointSize = 10.0;
            }
        `;

const fragmentShaderSource = `#version 300 es
            precision mediump float;
            uniform vec3 uColor;
            out vec4 outColor;
            void main() {
                outColor = vec4(uColor, 1.0);
            }
        `;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);

const positionBuffer = gl.createBuffer();
const aPositionLoc = gl.getAttribLocation(program, "aPosition");
const uColorLoc = gl.getUniformLocation(program, "uColor");

// =====================================================
//  FUNÇÃO DE DESENHO
// =====================================================
function desenharCena() {
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.uniform3fv(uColorLoc, corAtual);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesDaLinha, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

  const numPontos = verticesDaLinha.length / 2;
  gl.drawArrays(gl.POINTS, 0, numPontos);
}

// =====================================================
//  INTERAÇÕES (Mouse e Teclado)
// =====================================================

canvas.addEventListener('mousedown', (event) => {
  if (event.button !== 0) return; 

  const x = Math.round(event.offsetX);
  const y = Math.round(event.offsetY);

  if (pontoInicial === null) {
    pontoInicial = { x: x, y: y };
    console.log("Ponto Inicial registrado:", pontoInicial);
  } else {
    console.log("Ponto Final registrado:", {x, y});

    const pixelsDaLinha = calcularBresenham(pontoInicial.x, pontoInicial.y, x, y);

    verticesDaLinha = pixelsParaWebGL(pixelsDaLinha);

    pontoInicial = null; 

    desenharCena();
  }
});

window.addEventListener('keydown', (event) => {
  const tecla = event.key;

  if (paletaDeCores[tecla]) {
    corAtual = paletaDeCores[tecla];
    desenharCena();
  }
});

desenharCena();
