const canvas_lineLoop = document.getElementById("canvas");
const gl_lineLoop = canvas_lineLoop.getContext("webgl2");

if (!gl_lineLoop) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

function createFlowerGeometry() {
    const vertices = [];
    const colors = [];
    const numPetals = 20;
    const innerRadius = 0.45;
    const outerRadius = 0.8;

    // Definindo as cores (R, G, B)
    const corCentro = [0.1, 0.3, 0.12]; // Verde
    const corCanto = [0.54, 0.27, 0.07]; // Marrom
    const corBase = [1.0, 0.7, 0.0]; // Laranja
    const corPonta  = [1.0, 1.0, 0.0]; // Amarelo

    for (let i = 0; i < numPetals; i++) {
        const angle1 = (i * 2 * Math.PI) / numPetals;
        const angle2 = ((i + 1) * 2 * Math.PI) / numPetals; 
        const angleTip = ((i + 0.5) * 2 * Math.PI) / numPetals;

        const p1x = innerRadius * Math.cos(angle1);
        const p1y = innerRadius * Math.sin(angle1);
        const p2x = innerRadius * Math.cos(angle2);
        const p2y = innerRadius * Math.sin(angle2);
        const pTipX = outerRadius * Math.cos(angleTip);
        const pTipY = outerRadius * Math.sin(angleTip);

        // --- TRIÂNGULO DO MIOLO ---
        // Vértices: Centro, P1, P2
        vertices.push(0.0, 0.0,  p1x, p1y,  p2x, p2y);

        colors.push(
            ...corCentro, 
            ...corCanto, 
            ...corCanto
        );

        // --- TRIÂNGULO DA PÉTALA ---
        // Vértices: P1, Bico da Pétala, P2
        vertices.push(p1x, p1y,  pTipX, pTipY,  p2x, p2y);

        colors.push(
            ...corBase, 
            ...corPonta, 
            ...corBase
        );
    }
    
    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors)
    };
}

const flowerData = createFlowerGeometry();
const vertices_flower = flowerData.vertices;
const colors_flower = flowerData.colors;


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_lineLoop = gl_lineLoop.createBuffer();

gl_lineLoop.bindBuffer(gl_lineLoop.ARRAY_BUFFER, verticesBuffer_lineLoop);

gl_lineLoop.bufferData(
    gl_lineLoop.ARRAY_BUFFER,
    vertices_flower,
    gl_lineLoop.STATIC_DRAW
);

const colorsBuffer = gl_lineLoop.createBuffer();

gl_lineLoop.bindBuffer(gl_lineLoop.ARRAY_BUFFER, colorsBuffer);

gl_lineLoop.bufferData(gl_lineLoop.ARRAY_BUFFER, colors_flower, gl_lineLoop.STATIC_DRAW);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_lineLoop = `#version 300 es
    in vec2 aPosition;
    in vec3 aColor;
    out vec3 vColor;

    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vColor = aColor;
    }
`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_lineLoop = `#version 300 es
    precision mediump float;
    in vec3 vColor;
    out vec4 outColor;

    void main() {
        outColor = vec4(vColor, 1.0);
    }
`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader_lineLoop = createShader(
    gl_lineLoop,
    gl_lineLoop.VERTEX_SHADER,
    vertexShaderSource_lineLoop
);

const fragmentShader_lineLoop = createShader(
    gl_lineLoop,
    gl_lineLoop.FRAGMENT_SHADER,
    fragmentShaderSource_lineLoop
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_lineLoop = gl_lineLoop.createProgram();

gl_lineLoop.attachShader(program_lineLoop, vertexShader_lineLoop);
gl_lineLoop.attachShader(program_lineLoop, fragmentShader_lineLoop);

gl_lineLoop.linkProgram(program_lineLoop);

if (!gl_lineLoop.getProgramParameter(program_lineLoop, gl_lineLoop.LINK_STATUS)) {

    throw new Error(
        gl_lineLoop.getProgramInfoLog(program_lineLoop)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_lineLoop =
    gl_lineLoop.getAttribLocation(
        program_lineLoop,
        "aPosition"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl_lineLoop.bindBuffer(gl_lineLoop.ARRAY_BUFFER, verticesBuffer_lineLoop);

gl_lineLoop.enableVertexAttribArray(positionLocation_lineLoop);

gl_lineLoop.vertexAttribPointer(
    positionLocation_lineLoop,
    2,
    gl_lineLoop.FLOAT,
    false,
    0,
    0
);

const colorLocation = gl_lineLoop.getAttribLocation(program_lineLoop, "aColor");

gl_lineLoop.bindBuffer(gl_lineLoop.ARRAY_BUFFER, colorsBuffer);
gl_lineLoop.enableVertexAttribArray(colorLocation);
gl_lineLoop.vertexAttribPointer(colorLocation, 3, gl_lineLoop.FLOAT, false, 0, 0);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl_lineLoop.clearColor(0.0, 0.7, 1.0, 1.0);

gl_lineLoop.clear(gl_lineLoop.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl_lineLoop.useProgram(program_lineLoop);

const totalPontos = vertices_flower.length / 2;

gl_lineLoop.drawArrays(
    gl_lineLoop.TRIANGLES, 
    0,  
    totalPontos
);