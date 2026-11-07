// fss_amplua.js — Волновой суперчетырехугольник
(() => {
  const pre = document.getElementById('supercubesin');
  if (!pre) return;

  const COLS = 100;
  const ROWS = 48;

  const zBuffer = new Float32Array(COLS * ROWS);
  const charBuffer = new Array(COLS * ROWS);
  const QUAD_CHARS = "·~=+*#%@W";

  let A = 0.5, B = 0.3, C = 0.1, t = 0;

  function plot(x, y, z, nx, ny, nz, rotA, rotB, rotC) {
    const sA = Math.sin(rotA), cA = Math.cos(rotA);
    const sB = Math.sin(rotB), cB = Math.cos(rotB);
    const sC = Math.sin(rotC), cC = Math.cos(rotC);

    const y1 = y * cA - z * sA;
    const z1 = y * sA + z * cA;
    const x2 = x * cB + z1 * sB;
    const z2 = -x * sB + z1 * cB;
    const rx = x2 * cC - y1 * sC;
    const ry = x2 * sC + y1 * cC;
    const rz = z2;

    const ny1 = ny * cA - nz * sA;
    const nz1 = ny * sA + nz * cA;
    const nx2 = nx * cB + nz1 * sB;
    const nz2 = -nx * sB + nz1 * cB;
    const rnx = nx2 * cC - ny1 * sC;
    const rny = nx2 * sC + ny1 * cC;
    const rnz = nz2;

    const ooz = 1 / (rz + 7.2);
    const xp = (COLS / 2 + 52 * ooz * rx) | 0;
    const yp = (ROWS / 2 - 28 * ooz * ry) | 0;

    if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) return;
    const idx = xp + yp * COLS;

    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      const lum = Math.max(0, (rnx * -0.35 + rny * 0.65 - rnz * 0.68 + 1) * 0.5);
      const boosted = Math.pow(lum, 0.85);
      const cIdx = Math.min(QUAD_CHARS.length - 1, (boosted * QUAD_CHARS.length) | 0);
      charBuffer[idx] = QUAD_CHARS[cIdx];
    }
  }

  function render() {
    zBuffer.fill(0);
    charBuffer.fill(' ');

    const superR = 3.25;
    const p = 0.65;
    const corners = 4;

    for (let s = 0; s < Math.PI * 2; s += 0.015) {
      const cs = Math.cos(s), ss = Math.sin(s);
      const sx = Math.sign(cs) * Math.pow(Math.abs(cs), p) * superR;
      const sy = Math.sign(ss) * Math.pow(Math.abs(ss), p) * superR;

      const waveZ = 0.55 * Math.sin(corners * s * 2 - t * 3.5);
      const waveR = 1 + 0.08 * Math.cos(8 * s + t * 2.5);

      for (let ring = 0; ring < Math.PI * 2; ring += 1.05) {
        const tube = 0.14;
        const nx = Math.cos(ring) * cs;
        const ny = Math.cos(ring) * ss;
        const nz = Math.sin(ring);

        plot(
          sx * waveR + tube * nx,
          sy * waveR + tube * ny,
          waveZ + tube * nz,
          nx, ny, nz,
          A * 0.45, -B * 0.65, C * 0.9
        );
      }
    }

    let out = '';
    for (let r = 0; r < ROWS; r++) {
      out += charBuffer.slice(r * COLS, (r + 1) * COLS).join('') + '\n';
    }
    pre.textContent = out;

    A += 0.018;
    B += 0.013;
    C += 0.009;
    t += 0.04;

    requestAnimationFrame(render);
  }

  render();
})();