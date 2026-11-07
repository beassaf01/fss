// math_actugmatu3m.js
(() => {
  const pre = document.getElementById('math-art');
  if (!pre) return;

  const COLS = 100;
  const ROWS = 48;

  const zBuffer = new Float32Array(COLS * ROWS);
  const charBuffer = new Array(COLS * ROWS);

  const MATH_CHARS = ".:+-=~*#%@$&8";
  const WAVE_CHARS = ".:-=+*#%@";

  let A = 0.6, B = 0.3, C = 0.0, t = 0;

  function plotPoint(x, y, z, nx, ny, nz, charSet) {
    const sinA = Math.sin(A), cosA = Math.cos(A);
    const sinB = Math.sin(B), cosB = Math.cos(B);
    const sinC = Math.sin(C), cosC = Math.cos(C);

    const rotate = (vx, vy, vz) => {
      const y1 = vy * cosA - vz * sinA;
      const z1 = vy * sinA + vz * cosA;
      const x2 = vx * cosB + z1 * sinB;
      const z2 = -vx * sinB + z1 * cosB;
      const x3 = x2 * cosC - y1 * sinC;
      const y3 = x2 * sinC + y1 * cosC;
      return [x3, y3, z2];
    };

    const [rx, ry, rz] = rotate(x, y, z);
    const [, rny, rnz] = rotate(nx, ny, nz);

    const ooz = 1 / (rz + 7.5);
    const xp = Math.floor(COLS / 2 + 52 * ooz * rx);
    const yp = Math.floor(ROWS / 2 - 30 * ooz * ry);

    if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) return;
    const idx = xp + yp * COLS;

    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      const L = Math.max(0, (rny * 0.65 - rnz * 0.75 + 1) * 0.5);
      const charIdx = Math.min(charSet.length - 1, Math.floor(L * charSet.length));
      charBuffer[idx] = charSet[charIdx];
    }
  }

  function render() {
    zBuffer.fill(0);
    charBuffer.fill(' ');

    for (let i = -3.2; i <= 3.2; i += 0.08) {
      plotPoint(i, 0, 0, 0, 1, -1, "-+X");
      plotPoint(0, i, 0, 0, 1, -1, "|+Y");
      plotPoint(0, 0, i, 0, 1, -1, "·+Z");
    }

    for (let u = -2.5; u <= 2.5; u += 0.15) {
      for (let v = -2.5; v <= 2.5; v += 0.15) {
        const r = Math.sqrt(u * u + v * v) + 0.001;
        const z = 0.65 * Math.sin(r * 2.8 - t * 3.0) * Math.cos(u - v);
        const dzdu = 1.8 * Math.cos(r * 2.8 - t * 3.0) * (u / r);
        const dzdv = 1.8 * Math.cos(r * 2.8 - t * 3.0) * (v / r);
        const len = Math.hypot(-dzdu, -dzdv, 1);
        plotPoint(u, v, z, -dzdu / len, -dzdv / len, 1 / len, WAVE_CHARS);
      }
    }

    for (let phi = 0; phi < Math.PI * 2; phi += 0.03) {
      const cx = (1.6 + 0.65 * Math.cos(3 * phi + t)) * Math.cos(2 * phi);
      const cy = (1.6 + 0.65 * Math.cos(3 * phi + t)) * Math.sin(2 * phi);
      const cz = 0.65 * Math.sin(3 * phi + t);

      for (let theta = 0; theta < Math.PI * 2; theta += 0.4) {
        const tubeR = 0.28;
        const nx = Math.cos(theta) * Math.cos(2 * phi);
        const ny = Math.cos(theta) * Math.sin(2 * phi);
        const nz = Math.sin(theta);

        plotPoint(
          cx + tubeR * nx,
          cy + tubeR * ny,
          cz + tubeR * nz,
          nx, ny, nz,
          MATH_CHARS
        );
      }
    }

    let out = '';
    for (let r = 0; r < ROWS; r++) {
      out += charBuffer.slice(r * COLS, (r + 1) * COLS).join('') + '\n';
    }
    pre.textContent = out;

    A += 0.014;
    B += 0.021;
    C += 0.007;
    t += 0.03;

    requestAnimationFrame(render);
  }

  render();
})();