// trefoil.js — Узел-трилистник (Trefoil Knot)
(() => {
  const pre = document.getElementById('trefoil');
  if (!pre) return;

  const COLS = 100;
  const ROWS = 48;

  const zBuffer = new Float32Array(COLS * ROWS);
  const charBuffer = new Array(COLS * ROWS);

  const MATH_CHARS = ".:+-=~*#%@$&8";

  let A = 0.6, B = 0.3, C = 0.0, t = 0;

  function plotPoint(x, y, z, nx, ny, nz) {
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
      const charIdx = Math.min(MATH_CHARS.length - 1, Math.floor(L * MATH_CHARS.length));
      charBuffer[idx] = MATH_CHARS[charIdx];
    }
  }

  function render() {
    zBuffer.fill(0);
    charBuffer.fill(' ');

    // Узел-трилистник (Trefoil knot)
    for (let phi = 0; phi < Math.PI * 2; phi += 0.025) {
      const cx = (1.6 + 0.65 * Math.cos(3 * phi + t)) * Math.cos(2 * phi);
      const cy = (1.6 + 0.65 * Math.cos(3 * phi + t)) * Math.sin(2 * phi);
      const cz = 0.65 * Math.sin(3 * phi + t);

      for (let theta = 0; theta < Math.PI * 2; theta += 0.25) {
        const tubeR = 0.32;
        const nx = Math.cos(theta) * Math.cos(2 * phi);
        const ny = Math.cos(theta) * Math.sin(2 * phi);
        const nz = Math.sin(theta);

        plotPoint(
          cx + tubeR * nx,
          cy + tubeR * ny,
          cz + tubeR * nz,
          nx, ny, nz
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