const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

// --------------------------------------------------
// 1. CARIMBOS
// --------------------------------------------------

// Carimbo 1: Um quadrado de 1x1 no centro
const squareVertices = new Float32Array([
    -0.5, 0.5, // Topo Esquerda
    -0.5, -0.5, // Base Esquerda
    0.5, -0.5, // Base Direita
    0.5, 0.5  // Topo Direita
]);

// Carimbo 2: Um círculo no centro
const circleVertices = [];
circleVertices.push(0.0, 0.0); // Ponto central
for (let i = 0; i <= 30; i++) {
    const angle = (i * 2 * Math.PI) / 30;
    circleVertices.push(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5);
}
const circleArray = new Float32Array(circleVertices);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------
const squareBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW);

const circleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
gl.bufferData(gl.ARRAY_BUFFER, circleArray, gl.STATIC_DRAW);

// --------------------------------------------------
// 3 e 4. SHADERS (Com Uniforms de Posição, Escala e Cor)
// --------------------------------------------------
const vertexShaderSource = `#version 300 es
            in vec2 aPosition;
            uniform vec2 uScale;
            uniform vec2 uOffset;
            void main() {
                gl_Position = vec4((aPosition * uScale) + uOffset, 0.0, 1.0);
            }
        `;

const fragmentShaderSource = `#version 300 es
            precision mediump float;
            uniform vec4 uColor;
            out vec4 outColor;
            void main() {
                outColor = uColor;
            }
        `;

// Compilação (Encurtei para caber, mas é a mesma função que você já usa)
function compileShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
}
const program = gl.createProgram();
gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);
gl.useProgram(program);

// --------------------------------------------------
// 5. LOCALIZAR VARIÁVEIS NA GPU
// --------------------------------------------------
const aPositionLoc = gl.getAttribLocation(program, "aPosition");

// NOVO: Localizando os Uniforms
const uScaleLoc = gl.getUniformLocation(program, "uScale");
const uOffsetLoc = gl.getUniformLocation(program, "uOffset");
const uColorLoc = gl.getUniformLocation(program, "uColor");

// --------------------------------------------------
// 6. FUNÇÃO MÁGICA DE DESENHAR
// --------------------------------------------------
function drawShape(buffer, numPontos, scaleX, scaleY, offsetX, offsetY, r, g, b) {
    // 1. Pluga o molde (Quadrado ou Círculo)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // 2. Envia as ordens de tamanho, posição e cor (Uniforms)
    gl.uniform2f(uScaleLoc, scaleX, scaleY);
    gl.uniform2f(uOffsetLoc, offsetX, offsetY);
    gl.uniform4f(uColorLoc, r, g, b, 1.0);

    // 3. Carimba na tela
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPontos);
}

// --------------------------------------------------
// 7. MONTANDO O ROBÔ
// --------------------------------------------------
gl.clearColor(0.4, 0.4, 0.4, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const qtdPontosQuadrado = 4;
const qtdPontosCirculo = circleArray.length / 2;

// drawShape: altura, largura, x, y, r, g, b
//corpo
drawShape(squareBuffer, qtdPontosQuadrado, 0.7, 1.0, 0.0, 0.0, 0.0, 0.3, 0.0);

// cabeça
drawShape(squareBuffer, qtdPontosQuadrado, 0.3, 0.2, 0.0, 0.6, 0.0, 0.35, 0.0);

// braço
drawShape(squareBuffer, qtdPontosQuadrado, 0.7, 0.15, 0.2, 0.3, 0.0, 0.35, 0.0);

// roda
drawShape(circleBuffer, qtdPontosCirculo, 1.0, 0.25, 0.0, -0.5, 0.1, 0.1, 0.1);

// calota
drawShape(circleBuffer, qtdPontosCirculo, 0.8, 0.15, 0.0, -0.5, 0.3, 0.35, 0.3);

// olhos
drawShape(circleBuffer, qtdPontosCirculo, 0.1, 0.1, 0.13, 0.6, 0.5, 0.05, 0.0);
