(function () {
    // ─────────── НАСТРОЙКИ ───────────
    const TARGET_FPS  = 60;
    const CELL_W      = 8.4;
    const CELL_H      = 14;

    const ONE_PROB    = 0.5;       
    const MIN_SPEED   = 0.25;
    const MAX_SPEED   = 1.0;
    const MIN_TRAIL   = 6;
    const MAX_TRAIL   = 16;
    const RESTART_GAP = 0.3;
    // ─────────────────────────────────

    const bg       = document.getElementById('bg');
    const FRAME_MS = 1000 / TARGET_FPS;
    const decoder  = new TextDecoder();

    let W = 0, H = 0, STRIDE = 0;
    let buf, headY, speed, trail, patterns;

    function resize() {
        W = Math.max(20, Math.floor(window.innerWidth  / CELL_W));
        H = Math.max(20, Math.floor(window.innerHeight / CELL_H));
        STRIDE = W + 1;

        buf      = new Uint8Array(STRIDE * H).fill(32);   
        headY    = new Float32Array(W);
        speed    = new Float32Array(W);
        trail    = new Uint8Array(W);
        patterns = new Uint8Array(W * MAX_TRAIL);         

        for (let y = 0; y < H; y++) buf[y * STRIDE + W] = 10;
        for (let c = 0; c < W; c++) reset(c, true);
    }

    function reset(c, initial) {
        headY[c] = initial
            ? Math.random() * H
            : -Math.random() * H * RESTART_GAP;
        speed[c] = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
        trail[c] = MIN_TRAIL + ((Math.random() * (MAX_TRAIL - MIN_TRAIL)) | 0);

        // Узор 0/1 — генерим ОДИН раз, при перезапуске потока
        const base = c * MAX_TRAIL;
        const tlen = trail[c];
        for (let i = 0; i < tlen; i++) {
            patterns[base + i] = Math.random() < ONE_PROB ? 49 : 48;
        }
    }

    let last = -Infinity;
    function frame(now) {
        requestAnimationFrame(frame);
        if (now - last < FRAME_MS) return;
        last = now;

        buf.fill(32);
        for (let i = W; i < buf.length; i += STRIDE) buf[i] = 10;

        for (let c = 0; c < W; c++) {
            headY[c] += speed[c];
            const head  = headY[c] | 0;
            const tlen  = trail[c];
            const start = head - tlen;
            const base  = c * MAX_TRAIL;

            const lo = start < 0 ? 0 : start;
            const hi = head  > H ? H : head;

            for (let y = lo; y < hi; y++) {
                buf[y * STRIDE + c] = patterns[base + (head - 1 - y)];
            }

            if (start > H) reset(c, false);
        }

        bg.textContent = decoder.decode(buf);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
})();