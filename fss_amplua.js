// fss_amplua.js — Пончик + Многомерная лента Мёбиуса + Волновой суперчетырехугольник
(() => {
  const pre =
    document.getElementById('amplua-art')
  if (!pre) return;

  const COLS = 100;
  const ROWS = 48;

  const zBuffer = new Float32Array(COLS * ROWS);
  const charBuffer = new Array(COLS * ROWS);

  // Палитры от тусклого к сочному белому (плотные символы на старших индексах)
  const DONUT_CHARS  = ".,-~:;=!*#$@8&%";
  const MOBIUS_CHARS = ".:+x*#01%@";
  const QUAD_CHARS   = "·~=+*#%@W";

  let A = 0.5, B = 0.3, C = 0.1, t = 0;

  // Вращение и проекция точки с учетом нормали освещения
  function plot(x, y, z, nx, ny, nz, palette, rotA, rotB, rotC) {
    const sA = Math.sin(rotA), cA = Math.cos(rotA);
    const sB = Math.sin(rotB), cB = Math.cos(rotB);
    const sC = Math.sin(rotC), cC = Math.cos(rotC);

    // Поворот координат (X -> Y -> Z)
    const y1 = y * cA - z * sA;
    const z1 = y * sA + z * cA;
    const x2 = x * cB + z1 * sB;
    const z2 = -x * sB + z1 * cB;
    const rx = x2 * cC - y1 * sC;
    const ry = x2 * sC + y1 * cC;
    const rz = z2;

    // Поворот нормали для бликов света
    const ny1 = ny * cA - nz * sA;
    const nz1 = ny * sA + nz * cA;
    const nx2 = nx * cB + nz1 * sB;
    const nz2 = -nx * sB + nz1 * cB;
    const rnx = nx2 * cC - ny1 * sC;
    const rny = nx2 * sC + ny1 * cC;
    const rnz = nz2;

    const ooz = 1 / (rz + 7.2); // Перспектива (1 / Z)
    const xp = (COLS / 2 + 52 * ooz * rx) | 0;
    const yp = (ROWS / 2 - 28 * ooz * ry) | 0;

    if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) return;
    const idx = xp + yp * COLS;

    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      // Источник света сверху-спереди-слева
      const lum = Math.max(0, (rnx * -0.35 + rny * 0.65 - rnz * 0.68 + 1) * 0.5);
      // Легкая гамма-коррекция (lum^0.85), чтобы было больше ярко-белых символов
      const boosted = Math.pow(lum, 0.85);
      const cIdx = Math.min(palette.length - 1, (boosted * palette.length) | 0);
      charBuffer[idx] = palette[cIdx];
    }
  }

  function render() {
    zBuffer.fill(0);
    charBuffer.fill(' ');


    
    // ─── 3. ВОЛНОВОЙ СУПЕРЧЕТЫРЕХУГОЛЬНИК (СУПЕРЭЛЛИПСОИД / АСТРОИДА) ───
    // Параметрическая кривая |x|^p + |y|^p = R^p с бегущей синусоидальной волной
    const superR = 3.25;
    const p = 0.65; // Показатель < 1 дает вогнутую четырехлучевую супер-рамку, > 2 — скругленный квадрат
    const corners = 4;

    for (let s = 0; s < Math.PI * 2; s += 0.015) {
      const cs = Math.cos(s), ss = Math.sin(s);
      // Обобщенная формула суперчетырехугольника со сглаженными углами
      const sx = Math.sign(cs) * Math.pow(Math.abs(cs), p) * superR;
      const sy = Math.sign(ss) * Math.pow(Math.abs(ss), p) * superR;

      // Волновое искажение ребер в 3D
      const waveZ = 0.55 * Math.sin(corners * s * 2 - t * 3.5);
      const waveR = 1 + 0.08 * Math.cos(8 * s + t * 2.5);

      // Делаем ребра объемными (тонкая трубка вдоль контура)
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
          QUAD_CHARS,
          A * 0.45, -B * 0.65, C * 0.9
        );
      }
    }

    // Вывод буфера в <pre>
    let out = '';
    for (let r = 0; r < ROWS; r++) {
      out += charBuffer.slice(r * COLS, (r + 1) * COLS).join('') + '\n';
    }
    pre.textContent = out;

    // Шаги анимации
    A += 0.018;
    B += 0.013;
    C += 0.009;
    t += 0.04;

    requestAnimationFrame(render);
  }

  render();
})();