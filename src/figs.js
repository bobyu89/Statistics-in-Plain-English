// One explanatory figure per chapter, as inline SVG strings.
// Used in the browser (index / whiteboard) and at build time (slides, node).
const FIGS = (function () {
  const INK = '#111', BLUE = '#bfe6ff', LILAC = '#e8c6ff', YEL = '#ffe08a', GRN = '#b9f0b4', PINK = '#ffc2d6', GREY = '#8d8f94';
  const W = 520, H = 240;
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 13}" font-weight="${o.w || 500}" text-anchor="${o.a || 'middle'}" fill="${o.fill || INK}">${s}</text>`;
  const L = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || INK}" stroke-width="${o.w || 1.6}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ' marker-end="url(#fa)"' : ''}${o.arrow2 ? ' marker-start="url(#fa)" marker-end="url(#fa)"' : ''}/>`;
  const wrap = (body, label) => `<svg class="fig" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" font-family="Outfit,'Noto Sans TC',system-ui,sans-serif"><defs><marker id="fa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${INK}"/></marker></defs>${body}</svg>`;
  const pdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / s;
  // normal curve as an SVG path; x in data units mapped by sx(), peak scaled to `h`
  function bell(m, s, sx, base, h, from, to, close) {
    const pts = [], peak = pdf(m, m, s);
    for (let i = 0; i <= 60; i++) { const x = from + (to - from) * i / 60; pts.push(`${sx(x).toFixed(1)} ${(base - pdf(x, m, s) / peak * h).toFixed(1)}`); }
    return close ? `M${sx(from)} ${base} L${pts.join(' L')} L${sx(to)} ${base} Z` : `M${pts.join(' L')}`;
  }
  // deterministic pseudo-random
  function rng(seed) { let a = seed; return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; }; }
  const gauss = r => (r() + r() + r() + r() - 2) * 1.2;

  const F = {};

  F[1] = () => {
    const r = rng(7); let dots = '';
    for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()); dots += `<circle cx="${(130 + Math.cos(a) * d * 95).toFixed(0)}" cy="${(118 + Math.sin(a) * d * 72).toFixed(0)}" r="3" fill="${INK}" opacity=".35"/>`; }
    let sd = ''; for (let i = 0; i < 12; i++) { const a = r() * 6.283, d = Math.sqrt(r()); sd += `<circle cx="${(400 + Math.cos(a) * d * 40).toFixed(0)}" cy="${(118 + Math.sin(a) * d * 40).toFixed(0)}" r="3" fill="${INK}"/>`; }
    return wrap(`<ellipse cx="130" cy="118" rx="110" ry="86" fill="${BLUE}" stroke="${INK}" stroke-width="1.6"/>${dots}
      <circle cx="400" cy="118" r="54" fill="${YEL}" stroke="${INK}" stroke-width="1.6"/>${sd}
      ${L(246, 96, 340, 96, { arrow: 1 })}${T(293, 86, '隨機抽樣')}${L(340, 142, 246, 142, { arrow: 1, dash: '5 4' })}${T(293, 162, '推論')}
      ${T(130, 22, '母體 N', { w: 700, size: 15 })}${T(130, 226, '母數:μ、σ', { fill: '#444' })}
      ${T(400, 50, '樣本 n', { w: 700, size: 15 })}${T(400, 196, '統計量:X̄、s', { fill: '#444' })}`, '母體與樣本');
  };

  F[2] = () => {
    const sx = x => 40 + x * 44, f = x => x * x * Math.exp(-x), peak = f(2), base = 190;
    let p = `M${sx(0)} ${base}`; for (let i = 0; i <= 80; i++) { const x = 10 * i / 80; p += ` L${sx(x).toFixed(1)} ${(base - f(x) / peak * 140).toFixed(1)}`; }
    const mark = (x, lab, col, dy) => `${L(sx(x), base, sx(x), 34 + dy, { c: INK, dash: '4 3' })}<rect x="${sx(x) - 30}" y="${14 + dy}" width="60" height="22" rx="11" fill="${col}" stroke="${INK}"/>${T(sx(x), 30 + dy, lab, { w: 700 })}`;
    return wrap(`<path d="${p} L${sx(10)} ${base} Z" fill="${BLUE}" stroke="${INK}" stroke-width="1.6"/>${L(30, base, 500, base)}
      ${mark(2, '眾數', GRN, 0)}${mark(2.67, '中位數', YEL, 28)}${mark(3.4, '平均數', PINK, 56)}
      ${L(330, 150, 440, 150, { arrow: 1 })}${T(385, 140, '長尾把平均數拉走')}${T(260, 222, '正偏(右尾長)時:眾數 < 中位數 < 平均數', { fill: '#444' })}`, '偏態分布的三種集中趨勢');
  };

  F[3] = () => {
    const sx = x => 260 + x * 40, base = 190;
    return wrap(`<path d="${bell(0, 2.6, sx, base, 70, -6, 6, 1)}" fill="${PINK}" stroke="${INK}" stroke-width="1.6" opacity=".9"/>
      <path d="${bell(0, 0.8, sx, base, 150, -6, 6, 1)}" fill="${BLUE}" stroke="${INK}" stroke-width="1.6" opacity=".85"/>
      ${L(20, base, 500, base)}${L(260, base, 260, 30, { dash: '4 3' })}${T(260, 22, '同一個平均數', { w: 700 })}
      ${T(360, 70, '標準差小', { w: 700, a: 'start' })}${T(360, 88, '大家都差不多', { a: 'start', fill: '#444' })}
      ${T(60, 150, '標準差大', { w: 700, a: 'start' })}${T(60, 168, '人與人差很多', { a: 'start', fill: '#444' })}
      ${L(sx(-2.6), 208, sx(2.6), 208, { arrow2: 1 })}${T(260, 228, '離平均數的典型距離 = 標準差', { fill: '#444' })}`, '相同平均數、不同標準差');
  };

  F[4] = () => {
    const sx = x => 260 + x * 70, base = 180, band = (k, c) => `<path d="${bell(0, 1, sx, base, 140, -k, k, 1)}" fill="${c}"/>`;
    return wrap(`${band(3.2, BLUE)}${band(2, LILAC)}${band(1, YEL)}<path d="${bell(0, 1, sx, base, 140, -3.2, 3.2)}" fill="none" stroke="${INK}" stroke-width="1.8"/>${L(30, base, 490, base)}
      ${[-3, -2, -1, 0, 1, 2, 3].map(k => L(sx(k), base, sx(k), base + 6) + T(sx(k), base + 22, k === 0 ? '平均數' : (k > 0 ? '+' : '−') + Math.abs(k) + ' SD', { size: 12 })).join('')}
      ${L(sx(-1), 120, sx(1), 120, { arrow2: 1 })}${T(260, 112, '約 68%', { w: 700 })}
      ${L(sx(-2), 150, sx(2), 150, { arrow2: 1 })}${T(260, 144, '約 95%', { w: 700 })}
      ${T(260, 226, '±3 個標準差內約 99.7%;曲線下的面積就是機率', { fill: '#444' })}`, '常態分布的 68–95–99.7');
  };

  F[5] = () => {
    const sx = z => 260 + z * 100, raw = z => 70 + z * 10, y1 = 70, y2 = 160;
    const ticks = [-2, -1, 0, 1, 2];
    return wrap(`${T(20, y1 - 26, '原始分數(平均 70、標準差 10)', { a: 'start', w: 700 })}${L(40, y1, 480, y1, { w: 3 })}
      ${ticks.map(z => L(sx(z), y1 - 7, sx(z), y1 + 7) + T(sx(z), y1 + 24, raw(z))).join('')}
      ${T(20, y2 - 26, 'z 分數(平均 0、標準差 1)', { a: 'start', w: 700 })}${L(40, y2, 480, y2, { w: 3 })}
      ${ticks.map(z => L(sx(z), y2 - 7, sx(z), y2 + 7) + T(sx(z), y2 + 24, (z > 0 ? '+' : '') + z)).join('')}
      <circle cx="${sx(1.5)}" cy="${y1}" r="8" fill="${PINK}" stroke="${INK}" stroke-width="1.6"/><circle cx="${sx(1.5)}" cy="${y2}" r="8" fill="${PINK}" stroke="${INK}" stroke-width="1.6"/>
      ${L(sx(1.5), y1 + 10, sx(1.5), y2 - 12, { arrow: 1, dash: '4 3' })}
      ${T(sx(1.5) + 14, 120, '85 分', { a: 'start', w: 700 })}
      ${T(260, 224, 'z = (85 − 70) ÷ 10 = +1.5:比平均高 1.5 個標準差', { fill: '#444' })}`, '原始分數換算成 z 分數');
  };

  F[6] = () => {
    const sx = x => 260 + x * 56, base = 180;
    return wrap(`<path d="${bell(0, 2.4, sx, base, 46, -4, 4, 1)}" fill="${BLUE}" stroke="${INK}" stroke-width="1.6"/>
      <path d="${bell(0, 0.9, sx, base, 96, -4, 4, 1)}" fill="${YEL}" stroke="${INK}" stroke-width="1.6" opacity=".92"/>
      <path d="${bell(0, 0.4, sx, base, 150, -4, 4, 1)}" fill="${PINK}" stroke="${INK}" stroke-width="1.6" opacity=".92"/>${L(30, base, 490, base)}
      ${T(70, 128, '個別分數', { w: 700 })}${T(70, 145, '(標準差 s)', { size: 12, fill: '#444' })}
      ${T(392, 96, 'n = 25 的樣本平均數', { a: 'start', w: 700 })}${L(388, 100, 300, 124, { c: GREY })}
      ${T(322, 44, 'n = 100 的樣本平均數', { a: 'start', w: 700 })}${L(318, 48, 276, 62, { c: GREY })}
      ${T(260, 204, 'μ', { w: 700 })}${T(260, 228, '樣本越大,樣本平均數越擠在 μ 附近:標準誤 = s ÷ √n', { fill: '#444' })}`, '樣本數與標準誤');
  };

  F[7] = () => {
    const sx = x => 200 + x * 52, base = 130, tail = (a, b) => `<path d="${bell(0, 1, sx, base, 100, a, b, 1)}" fill="${PINK}"/>`;
    return wrap(`<path d="${bell(0, 1, sx, base, 100, -3.3, 3.3, 1)}" fill="${BLUE}"/>${tail(-3.3, -1.96)}${tail(1.96, 3.3)}
      <path d="${bell(0, 1, sx, base, 100, -3.3, 3.3)}" fill="none" stroke="${INK}" stroke-width="1.8"/>${L(20, base, 380, base)}
      ${T(200, 20, '虛無假設為真時的抽樣分布', { w: 700 })}${T(200, 100, '不拒絕', { fill: '#333' })}
      ${T(62, 118, 'α/2', { size: 12 })}${T(358, 118, 'α/2', { size: 12 })}
      ${L(sx(2.5), 60, sx(2.5), base, { w: 2.4 })}<circle cx="${sx(2.5)}" cy="60" r="6" fill="${YEL}" stroke="${INK}" stroke-width="1.6"/>${T(sx(2.5) + 12, 56, '你的樣本', { a: 'start', w: 700 })}${T(sx(2.5) + 12, 73, 'p < α → 顯著', { a: 'start', size: 12, fill: '#444' })}
      ${T(20, 170, '信賴區間', { a: 'start', w: 700 })}${L(150, 186, 400, 186, { w: 3 })}${L(150, 178, 150, 194, { w: 2 })}${L(400, 178, 400, 194, { w: 2 })}<circle cx="275" cy="186" r="7" fill="${GRN}" stroke="${INK}" stroke-width="1.6"/>
      ${T(275, 172, '樣本估計值', { size: 12 })}${T(275, 224, '估計值 ± 臨界值 × 標準誤:區間越窄,估計越精確', { fill: '#444' })}`, '拒絕域與信賴區間');
  };

  F[8] = () => {
    const panel = (ox, rho, title, sub, seed, col) => {
      const r = rng(seed); let d = '';
      for (let i = 0; i < 26; i++) { const x = gauss(r), e = gauss(r), y = rho * x + Math.sqrt(1 - rho * rho) * e; d += `<circle cx="${(ox + 70 + x * 26).toFixed(0)}" cy="${(112 - y * 26).toFixed(0)}" r="4" fill="${col}" stroke="${INK}" stroke-width="1"/>`; }
      return `<rect x="${ox}" y="40" width="140" height="144" rx="12" fill="#fff" stroke="${INK}" stroke-width="1.4"/>${d}${T(ox + 70, 26, title, { w: 700, size: 14 })}${T(ox + 70, 206, sub, { size: 12, fill: '#444' })}`;
    };
    return wrap(`${panel(20, 0.85, '正相關 r ≈ +.8', '一起高、一起低', 3, GRN)}${panel(190, 0, '零相關 r ≈ 0', '看不出直線關係', 11, YEL)}${panel(360, -0.85, '負相關 r ≈ −.8', '一個高、另一個低', 5, PINK)}
      ${T(260, 230, '符號看方向,絕對值看強度;點越貼近一條直線,r 越接近 ±1', { fill: '#444' })}`, '三種相關的散布圖');
  };

  F[9] = () => {
    const sx = x => 260 + x * 46, base = 150;
    return wrap(`<path d="${bell(-1.3, 1.2, sx, base, 110, -5, 5, 1)}" fill="${BLUE}" stroke="${INK}" stroke-width="1.6" opacity=".88"/>
      <path d="${bell(1.3, 1.2, sx, base, 110, -5, 5, 1)}" fill="${PINK}" stroke="${INK}" stroke-width="1.6" opacity=".8"/>${L(20, base, 500, base)}
      ${L(sx(-1.3), base, sx(-1.3), 28, { dash: '4 3' })}${L(sx(1.3), base, sx(1.3), 28, { dash: '4 3' })}
      ${L(sx(-1.3), 28, sx(1.3), 28, { arrow2: 1 })}${T(260, 20, '平均數的差', { w: 700 })}
      ${T(sx(-1.3), 168, '第 1 組 X̄₁')}${T(sx(1.3), 168, '第 2 組 X̄₂')}
      <rect x="110" y="186" width="300" height="40" rx="20" fill="${YEL}" stroke="${INK}" stroke-width="1.6"/>${T(260, 211, 't = 平均數的差 ÷ 差的標準誤', { w: 700, size: 15 })}`, '兩組平均數的差與 t 值');
  };

  F[10] = () => {
    const sx = x => 260 + x * 40, base = 150, ms = [-3.6, 0, 3.6], cs = [BLUE, YEL, PINK];
    return wrap(`${ms.map((m, i) => `<path d="${bell(m, 1, sx, base, 96, m - 3, m + 3, 1)}" fill="${cs[i]}" stroke="${INK}" stroke-width="1.6" opacity=".9"/>`).join('')}${L(20, base, 500, base)}
      ${ms.map((m, i) => L(sx(m), base, sx(m), 40, { dash: '4 3' }) + T(sx(m), 168, `第 ${i + 1} 組`)).join('')}
      ${L(sx(-3.6), 30, sx(3.6), 30, { arrow2: 1 })}${T(260, 22, '組間:各組平均數彼此差多遠', { w: 700 })}
      ${L(sx(-1), 120, sx(1), 120, { arrow2: 1 })}${T(260, 112, '組內', { w: 700, size: 12 })}
      <rect x="120" y="186" width="280" height="40" rx="20" fill="${GRN}" stroke="${INK}" stroke-width="1.6"/>${T(260, 211, 'F = 組間均方 ÷ 組內均方', { w: 700, size: 15 })}`, '組間變異與組內變異');
  };

  F[11] = () => {
    const panel = (ox, title, a, b, sub) => `<rect x="${ox}" y="40" width="220" height="150" rx="12" fill="#fff" stroke="${INK}" stroke-width="1.4"/>${T(ox + 110, 26, title, { w: 700, size: 14 })}
      ${L(ox + 40, a[0], ox + 180, a[1], { w: 2.6, c: '#2a7be4' })}${L(ox + 40, b[0], ox + 180, b[1], { w: 2.6, c: '#d6336c' })}
      ${[[a, '#2a7be4'], [b, '#d6336c']].map(([p, c]) => `<circle cx="${ox + 40}" cy="${p[0]}" r="5" fill="${c}"/><circle cx="${ox + 180}" cy="${p[1]}" r="5" fill="${c}"/>`).join('')}
      ${T(ox + 40, 182, 'A1', { size: 12 })}${T(ox + 180, 182, 'A2', { size: 12 })}${T(ox + 110, 210, sub, { size: 12, fill: '#444' })}`;
    return wrap(`${panel(20, '沒有交互作用', [140, 90], [110, 60], '兩線平行:A 的效果不看 B')}${panel(280, '有交互作用', [140, 70], [80, 130], '兩線不平行:A 的效果要看 B')}
      ${T(260, 232, '藍線 = B1、紅線 = B2;縱軸是依變項的平均數', { size: 12, fill: '#444' })}`, '交互作用圖');
  };

  F[12] = () => {
    const xs = [110, 260, 410], subj = [[150, 120, 96], [132, 112, 80], [118, 96, 72], [104, 86, 52], [166, 140, 112]], mean = [134, 111, 82];
    return wrap(`${xs.map((x, i) => L(x, 40, x, 176, { c: '#ddd' }) + T(x, 198, ['第 1 次', '第 2 次', '第 3 次'][i], { w: 700 })).join('')}
      ${subj.map(s => `<polyline points="${s.map((y, i) => xs[i] + ',' + y).join(' ')}" fill="none" stroke="${GREY}" stroke-width="1.4"/>` + s.map((y, i) => `<circle cx="${xs[i]}" cy="${y}" r="3.5" fill="#fff" stroke="${GREY}"/>`).join('')).join('')}
      <polyline points="${mean.map((y, i) => xs[i] + ',' + y).join(' ')}" fill="none" stroke="${INK}" stroke-width="3.4"/>${mean.map((y, i) => `<circle cx="${xs[i]}" cy="${y}" r="6" fill="${YEL}" stroke="${INK}" stroke-width="1.8"/>`).join('')}
      ${T(440, 76, '平均數', { a: 'start', w: 700 })}${T(60, 100, '同一個人', { size: 12, fill: '#444' })}${T(60, 116, '一條線', { size: 12, fill: '#444' })}
      ${T(260, 228, '每個人自己跟自己比:個別差異不算進誤差,更容易看出時間的效果', { fill: '#444' })}`, '同一批人的重複測量');
  };

  F[13] = () => {
    const r = rng(21), sx = x => 70 + x * 40, sy = y => 190 - y * 18, a = 1.2, b = 0.72; let d = '';
    for (let i = 0; i < 16; i++) { const x = 0.6 + r() * 9, y = a + b * x + gauss(r) * 1.3, yh = a + b * x; d += L(sx(x), sy(y), sx(x), sy(yh), { c: '#d6336c', w: 1.4, dash: '3 2' }) + `<circle cx="${sx(x).toFixed(0)}" cy="${sy(y).toFixed(0)}" r="4.5" fill="${BLUE}" stroke="${INK}"/>`; }
    return wrap(`${L(60, 196, 490, 196)}${L(60, 196, 60, 20)}${T(275, 216, '預測變項 X')}${T(30, 110, 'Y', { w: 700 })}${d}
      ${L(sx(0), sy(a), sx(10), sy(a + b * 10), { w: 2.8 })}${T(sx(10) - 4, sy(a + b * 10) - 10, 'Ŷ = bX + a', { a: 'end', w: 700, size: 15 })}
      ${T(120, 40, '紅色虛線 = 殘差', { a: 'start', fill: '#d6336c', w: 700 })}${T(120, 58, '(實際值 − 預測值)', { a: 'start', size: 12, fill: '#444' })}
      ${T(275, 234, '迴歸線是讓「殘差平方和」最小的那條直線', { fill: '#444' })}`, '迴歸線與殘差');
  };

  F[14] = () => {
    const grid = (ox, title, v, col) => `${T(ox + 95, 34, title, { w: 700, size: 14 })}
      ${[0, 1].map(i => [0, 1].map(j => `<rect x="${ox + 50 + j * 70}" y="${62 + i * 50}" width="70" height="50" fill="${col}" stroke="${INK}" stroke-width="1.4"/>${T(ox + 85 + j * 70, 93 + i * 50, v[i][j], { w: 700, size: 17 })}`).join('')).join('')}
      ${T(ox + 85, 54, '有效', { size: 12 })}${T(ox + 155, 54, '無效', { size: 12 })}${T(ox + 44, 92, 'A 組', { size: 12, a: 'end' })}${T(ox + 44, 142, 'B 組', { size: 12, a: 'end' })}`;
    return wrap(`${grid(10, '觀察次數 O', [[40, 10], [20, 30]], BLUE)}${grid(270, '期望次數 E', [[30, 20], [30, 20]], YEL)}
      ${T(260, 118, 'vs', { w: 700, size: 16 })}${T(260, 190, 'E = 列合計 × 行合計 ÷ 總數(例:50 × 60 ÷ 100 = 30)', { size: 12, fill: '#444' })}
      <rect x="90" y="200" width="340" height="34" rx="17" fill="${PINK}" stroke="${INK}" stroke-width="1.6"/>${T(260, 222, 'χ² = Σ (O − E)² ÷ E = 16.67(示意數字)', { w: 700 })}`, '觀察次數與期望次數');
  };

  F[15] = () => {
    const items = [0, 1, 2, 3, 4, 5].map(i => ({ x: 30 + i * 80, y: 170 })), fx = [150, 370];
    return wrap(`${fx.map((x, i) => `<ellipse cx="${x}" cy="52" rx="86" ry="30" fill="${i ? PINK : BLUE}" stroke="${INK}" stroke-width="1.6"/>${T(x, 57, `因素 ${i + 1}`, { w: 700, size: 15 })}`).join('')}
      ${items.map((p, i) => L(fx[i < 3 ? 0 : 1] + (i % 3 - 1) * 34, 82, p.x + 30, p.y - 2, { arrow: 1, c: '#555' }) + `<rect x="${p.x}" y="${p.y}" width="60" height="34" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.4"/>${T(p.x + 30, p.y + 22, `題 ${i + 1}`)}`).join('')}
      ${T(40, 120, '負荷量', { size: 12, fill: '#444' })}
      ${T(140, 228, '同一因素的題目彼此相關高', { size: 12, fill: '#444' })}${T(390, 228, 'Cronbach\'s α 檢查它們是否一致', { size: 12, fill: '#444' })}`, '題目歸到因素');
  };

  const captions = {
    1: '從母體隨機抽出樣本,再用樣本的統計量推論母體的母數。', 2: '分布偏斜時,三個「中心」會分開,平均數最容易被極端值拉走。',
    3: '平均數一樣,資料的分散程度可以差很多。', 4: '常態分布下,離平均數幾個標準差就對應固定的機率。',
    5: 'z 分數把任何量尺都換成「離平均幾個標準差」。', 6: '樣本越大,樣本平均數的抽樣分布越窄,標準誤越小。',
    7: '樣本落在兩端的拒絕域就算顯著;信賴區間則給出母體數值的可能範圍。', 8: '相關係數描述兩個變項直線關係的方向與強度。',
    9: 't 值是「兩組平均數的差」相對於「這個差的標準誤」有多大。', 10: 'F 值比較組與組之間的差異,和各組內部的差異。',
    11: '兩條線不平行,代表一個因子的效果會隨另一個因子改變。', 12: '同一批人被量多次,比較的是每個人自己的變化。',
    13: '迴歸線讓所有點到線的垂直距離(殘差)平方和最小。', 14: '卡方把每一格「觀察 − 期望」的落差加總。',
    15: '因素分析把相關高的題目歸成同一個因素,信度分析再檢查這組題目是否一致。',
  };
  return { svg: n => (F[n] ? F[n]() : ''), caption: n => captions[n] || '' };
})();
if (typeof window !== 'undefined') window.FIGS = FIGS;
