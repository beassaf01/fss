// prog_binary_core.js
(() => {
  const pre = document.getElementById('4Dcube');
  if (!pre) return;

  const COLS = 100;
  const ROWS = 48;

  const zBuffer = new Float32Array(COLS * ROWS);
  const charBuffer = new Array(COLS * ROWS);

  let angle3D_A = 0.4, angle3D_B = 0.2;
  let angle4D_XW = 0, angle4D_YW = 0, tick = 0;

  const vertices4D = [];
  for (let i = 0; i < 16; i++) {
    vertices4D.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }

  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if ((diff & (diff - 1)) === 0) edges.push([i, j]);
    }
  }

  function plot3D(x, y, z, char) {
    const sinA = Math.sin(angle3D_A), cosA = Math.cos(angle3D_A);
    const sinB = Math.sin(angle3D_B), cosB = Math.cos(angle3D_B);

    const y1 = y * cosA - z * sinA;
    const z1 = y * sinA + z * cosA;
    const x2 = x * cosB + z1 * sinB;
    const z2 = -x * sinB + z1 * cosB;

    const ooz = 1 / (z2 + 6.5);
    const xp = Math.floor(COLS / 2 + 50 * ooz * x2);
    const yp = Math.floor(ROWS / 2 - 28 * ooz * y1);

    if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) return;
    const idx = xp + yp * COLS;

    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      charBuffer[idx] = char;
    }
  }

  function project4Dto3D(v) {
    const [x, y, z, w] = v;
    const c1 = Math.cos(angle4D_XW), s1 = Math.sin(angle4D_XW);
    const x1 = x * c1 - w * s1;
    const w1 = x * s1 + w * c1;

    const c2 = Math.cos(angle4D_YW), s2 = Math.sin(angle4D_YW);
    const y2 = y * c2 - w1 * s2;
    const w2 = y * s2 + w1 * c2;

    // Увеличили коэффициент с 1.45 до 2.65 — тессеракт теперь занимает почти весь холст
    const scale = 2.65 / (2.8 - w2);
    return [x1 * scale, y2 * scale, z * scale];
  }

  function render() {
    zBuffer.fill(0);
    charBuffer.fill(' ');

    const CODE_SYMS = "01{};&^|xF";
    const projected = vertices4D.map(project4Dto3D);

    for (let e = 0; e < edges.length; e++) {
      const [p1, p2] = edges[e];
      const v1 = projected[p1];
      const v2 = projected[p2];

      // Шаг уменьшен с 0.04 до 0.015, чтобы длинные рёбра оставались сплошными
      for (let t = 0; t <= 1; t += 0.015) {
        const x = v1[0] + (v2[0] - v1[0]) * t;
        const y = v1[1] + (v2[1] - v1[1]) * t;
        const z = v1[2] + (v2[2] - v1[2]) * t;

        const symIdx = Math.floor((e + t * 10 + tick) % CODE_SYMS.length);
        plot3D(x, y, z, CODE_SYMS[symIdx]);
      }
    }

    let out = '';
    for (let r = 0; r < ROWS; r++) {
      out += charBuffer.slice(r * COLS, (r + 1) * COLS).join('') + '\n';
    }
    pre.textContent = out;

    angle3D_A += 0.012;
    angle3D_B += 0.018;
    angle4D_XW += 0.022;
    angle4D_YW += 0.015;
    tick += 0.08;

    requestAnimationFrame(render);
  }

  render();
})();