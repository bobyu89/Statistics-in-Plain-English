#!/usr/bin/env node
// Build: content/*.json  ->  index.html, whiteboard.html, slides.html, heptabase/*.md, heptabase-cards.zip
// Usage: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const R = (...p) => path.join(root, ...p);
const read = p => fs.readFileSync(R(p), 'utf8');
const json = p => JSON.parse(read(p));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const no = n => String(n).padStart(2, '0');

// ---------------------------------------------------------------- data
const B = json('content/base.json');
const twTitle = Object.fromEntries(B.compare.chapterMap.filter(m => m.cn_n).map(m => [m.cn_n, m.site || m.tw]));
B.chapters = fs.readdirSync(R('content/chapters')).filter(f => /^ch\d+\.json$/.test(f)).sort()
  .map(f => json('content/chapters/' + f)).map(c => ({ ...c, title_tw: twTitle[c.n] || c.title_cn }));
const has = new Set(B.chapters.map(c => c.n));
B.edges = B.edges.filter(e => has.has(e.from) && has.has(e.to));
for (const f of ['front', 'back']) if (fs.existsSync(R(`content/chapters/${f}.json`))) B[f] = json(`content/chapters/${f}.json`);

// aggregated glossary (dedupe by English term, keep first chapter)
const seen = new Map();
for (const c of B.chapters) for (const t of [...(c.terms || []), ...(c.concepts || [])]) {
  const k = (t.en || t.tw || '').toLowerCase().trim(); if (!k) continue;
  if (seen.has(k)) { const e = seen.get(k); if (!e.chs.includes(c.n)) e.chs.push(c.n); continue; }
  seen.set(k, { en: t.en, tw: t.tw, cn: t.cn, diff: !!t.diff, chs: [c.n] });
}
B.compare.terms = [...seen.values()].map(t => ({ ...t, ch: t.chs.join(', ') }))
  .sort((a, b) => (b.diff - a.diff) || a.chs[0] - b.chs[0]);

// whiteboard memos
const D = B.decision;
B.wb.memos = [
  { title: '怎麼用這張白板', tone: '', html: '<ul><li>每個色塊是一個學習階段,箭頭是「先懂 A 才好懂 B」。</li><li>大卡=一章;小卡=關鍵術語(黃標是簡體譯名);虛線卡=公式。</li><li>卡片可以拖;拖色塊標題會整組一起動。位置會記在這台瀏覽器。</li><li>點任何卡片,右側打開整章筆記。</li></ul>' },
  { title: '版本差異速記', tone: 'b', html: `<table><tr><th></th><th>簡體版</th><th>台灣三版</th></tr><tr><td>原文</td><td>3E</td><td>5E 架構</td></tr><tr><td>章數</td><td>15</td><td>16</td></tr><tr><td>附錄</td><td>5</td><td>8</td></tr><tr><td>相關</td><td>第 8 章</td><td>第 12 章</td></tr><tr><td>第 14 章</td><td>卡方</td><td>無母數統計</td></tr></table>`,
    long: `<div class="lead">${esc(B.compare.headline)}</div><h4>主要差異</h4><ul>${B.compare.keyDiffs.map(d => `<li><b>${esc(d.t)}</b>:${esc(d.d)}</li>`).join('')}</ul><div class="chips"><a href="index.html#compare">打開完整對照表</a></div>` },
  { title: '該用哪個檢定?', tone: 'g', html: `<table>${D.slice(0, 6).map(d => `<tr><td>${esc(d.q)}</td><td><b>${esc(d.test)}</b></td></tr>`).join('')}</table><p style="margin-top:6px;opacity:.7">點開看完整 ${D.length} 列</p>`,
    long: `<div class="tw"><table><tr><th>你的問題</th><th>方法</th><th>章</th></tr>${D.map(d => `<tr><td>${esc(d.q)}</td><td><b>${esc(d.test)}</b></td><td>CH ${no(d.ch)}</td></tr>`).join('')}</table></div>` },
  ...(B.front ? [{ title: '每章固定三段', tone: 'l', html: `<p>${esc(B.front.chapter_structure)}</p>`, long: `<div class="lead">${esc(B.front.chapter_structure)}</div><h4>前言在說什麼</h4><p>${esc(B.front.preface_summary)}</p><h4>作者建議的讀法</h4><ul>${B.front.how_to_use.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h4>第三版新增</h4><ul>${B.front.new_in_3e.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` }] : []),
];

// ---------------------------------------------------------------- pages that inline the data
const shared = read('src/shared.js');
const detailCSS = shared.match(/const detailCSS = `([\s\S]*?)`;/)[1];
const dataJS = JSON.stringify(B).replace(/</g, '\\u003c');
for (const page of ['index.html', 'whiteboard.html']) {
  const out = read('src/' + page).replace('/*__BOOK__*/null', () => dataJS).replace('/*__SHARED__*/', () => shared).replace('/*__DETAILCSS__*/', () => detailCSS);
  fs.writeFileSync(R(page), out);
}

// ---------------------------------------------------------------- slides (BlockFrame)
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+TC:wght@500;700;900&display=swap');";
const css = read('src/blockframe.css')
  .replace(/@import url\([^)]*\);/, FONT_IMPORT)
  .replaceAll("'Inter', sans-serif", "'Inter', 'Noto Sans TC', sans-serif")
  .replaceAll("'Space Grotesk', monospace", "'Space Grotesk', 'Noto Sans TC', monospace")
  + '\n' + read('src/slides.extra.css');

const brackets = '<div class="corner-bracket tl"></div><div class="corner-bracket tr"></div><div class="corner-bracket bl"></div><div class="corner-bracket br"></div>';
const partOf = n => B.parts.find(p => p.chapters.includes(n));
const BG = ['bg-blue', 'bg-cream', 'bg-green', 'bg-pink', 'bg-yellow'];
const LBL = ['nb-label-blue', 'nb-label-pink', 'nb-label-green', 'nb-label-yellow', 'nb-label-cream'];
const big = s => { const l = [...String(s)].length; return l <= 5 ? 84 : l <= 9 ? 60 : l <= 14 ? 42 : l <= 22 ? 30 : 24; };
const pagesOf = c => { const m = String(c.pages).match(/(\d+)\D+(\d+)/); return m ? +m[2] - +m[1] + 1 : 0; };
const E = B.compare.editions, cnE = E[0], twE = E[3];
const S = [];

S.push(`<section class="slide slide-1 active">
  <div class="deco-dots"></div>
  <div class="hero-frame">${brackets}
    <div class="nb-label hero-label">學習簡報 · ${B.chapters.length} 章全解</div>
    <h1 class="nb-heading-xl hero-title">白話<br>統計學</h1>
    <p class="hero-subtitle">Statistics in Plain English — 把簡體第 3 版逐章讀完,改寫成台灣用語的重點筆記,並對照台灣雙葉版的差異。</p>
    <div class="deco-pink-rect"></div><div class="deco-green-circle"></div><div class="deco-yellow-bar">Timothy C. Urdan</div>
  </div></section>`);

if (B.front) S.push(`<section class="slide slide-2">
  <div class="col-left">
    <div class="nb-label nb-label-yellow">這本書怎麼讀</div>
    <h2 class="nb-heading-lg">不用<br>從頭讀到尾</h2>
    <p class="nb-body" style="max-width:480px;">${esc(B.front.chapter_structure)}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;"><span class="stat-pill">${B.chapters.length} 章</span><span class="stat-pill">${B.compare.appendices.filter(a => a.cn !== '—').length} 張附錄表</span><span class="stat-pill">內文 230 頁</span></div>
  </div>
  <div class="col-right">${B.front.how_to_use.slice(0, 3).map((t, i) => `<div class="intro-card"><h3>讀法 ${no(i + 1)}</h3><p>${esc(t)}</p></div>`).join('')}</div>
</section>`);

S.push(`<section class="slide slide-cmp">
  <div class="slide-header"><div class="nb-label nb-label-pink">版本比對</div><h2 class="nb-heading-lg" style="margin-top:16px;">簡體版 ≠ 台灣版</h2></div>
  <table class="cmp"><thead><tr><th></th><th>簡體版(你手上的)</th><th>台灣一版</th><th>台灣三版(最新)</th></tr></thead><tbody>
  ${[['出版社', 'publisher'], ['譯者', 'translator'], ['出版', 'date'], ['對應原文', 'source'], ['章數', 'chapters'], ['附錄', 'appendices']].map(([k, f]) =>
    `<tr><th>${k}</th><td>${esc(cnE[f])}</td><td>${esc(E[1][f])}</td><td class="${['source', 'chapters', 'appendices'].includes(f) ? 'hl' : ''}">${esc(twE[f])}</td></tr>`).join('')}
  </tbody></table></section>`);

S.push(`<section class="slide slide-8">
  <div class="slide-header"><div class="nb-label nb-label-green">差在哪</div><h2 class="nb-heading-lg" style="margin-top:16px;">四個數字看差異</h2></div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-deco" style="background:var(--pink);"></div><div class="stat-number">3E→5E</div><div class="stat-label">原文差兩版</div><div class="stat-sub">簡體版 2013;台灣三版 2025</div></div>
    <div class="stat-card"><div class="stat-deco" style="background:var(--blue);"></div><div class="stat-number">15→16</div><div class="stat-label">章數</div><div class="stat-sub">新增「個人中心取向的分析」</div></div>
    <div class="stat-card"><div class="stat-deco" style="background:var(--green);"></div><div class="stat-number">5→8</div><div class="stat-label">附錄表</div><div class="stat-sub">多 Fisher Z、Mann-Whitney U、Wilcoxon</div></div>
    <div class="stat-card"><div class="stat-deco" style="background:var(--yellow);"></div><div class="stat-number">8→12</div><div class="stat-label">「相關」的章號</div><div class="stat-sub">連帶讓 t 檢定與 ANOVA 各往前一章</div></div>
  </div></section>`);

S.push(`<section class="slide slide-cmp">
  <div class="slide-header"><div class="nb-label nb-label-blue">章節對照</div><h2 class="nb-heading-md" style="margin-top:14px;">簡體版章號 → 台灣三版章號</h2></div>
  <table class="cmp dense"><thead><tr><th>簡體 3E</th><th>簡體章名</th><th>台灣三版</th><th>台灣章名</th></tr></thead><tbody>
  ${B.compare.chapterMap.filter(m => m.note && !/擴寫|假設/.test(m.note)).map(m => `<tr><th>${m.cn_n ? 'CH ' + no(m.cn_n) : '—'}</th><td>${esc(m.cn || '(無)')}</td><td class="hl">CH ${no(m.tw_n)}</td><td>${esc(m.tw)}　<span class="nb-mono">${esc(m.note)}</span></td></tr>`).join('')}
  </tbody></table>
  <p class="nb-mono" style="margin-top:18px;">其餘第 1–7、13、15 章章號相同。</p></section>`);

const diffTerms = B.compare.terms.filter(t => t.diff);
const pick = ['mean', 'variance', 'population', 'confidence interval', 'normal distribution', 'regression'];
const termCards = pick.map(k => diffTerms.find(t => (t.en || '').toLowerCase().startsWith(k))).filter(Boolean);
for (const t of diffTerms) { if (termCards.length >= 6) break; if (!termCards.includes(t)) termCards.push(t); }
if (termCards.length) S.push(`<section class="slide slide-9">
  <div class="slide-header"><div class="nb-label nb-label-pink">譯名差異</div><h2 class="nb-heading-lg" style="margin-top:16px;">同一個字,兩種叫法</h2><p class="nb-mono" style="margin-top:10px;">全書整理出 ${B.compare.terms.length} 組術語,其中 ${diffTerms.length} 組兩岸譯名不同。</p></div>
  <div class="team-grid">${termCards.slice(0, 6).map(t => `<div class="team-card"><div class="team-avatar">${esc([...t.tw][0])}</div><div class="team-name">${esc(t.tw)}</div><div class="team-role">簡體:${esc(t.cn)}</div><div class="team-bio">${esc(t.en)}</div></div>`).join('')}</div></section>`);

S.push(`<section class="slide slide-7">
  <div class="slide-header"><div class="nb-label nb-label-cream">學習地圖</div><h2 class="nb-heading-lg" style="margin-top:16px;">五個階段</h2></div>
  <div class="timeline">${B.parts.map((p, i) => `<div class="timeline-step">${i < B.parts.length - 1 ? '<div class="step-connector"></div>' : ''}<div class="step-num">${no(i + 1)}</div><div class="step-title">${esc(p.title)}</div><div class="step-desc">${esc(p.sub)}<br>第 ${p.chapters.join('、')} 章</div></div>`).join('')}</div></section>`);

// chart: pages per chapter (real data)
{
  const ps = B.chapters.map(c => ({ n: c.n, p: pagesOf(c), part: partOf(c.n) })), max = Math.max(...ps.map(x => x.p), 1);
  const top = Math.ceil(max / 5) * 5, x0 = 60, w = 720 / ps.length, bw = Math.min(34, w - 10), col = { A: '#C0F7FE', B: '#FE90E8', C: '#F7CB46', D: '#99E885', E: '#FFDC8B' };
  const y = v => 280 - v / top * 260, longest = ps.reduce((a, b) => b.p > a.p ? b : a), shortest = ps.reduce((a, b) => b.p < a.p ? b : a);
  S.push(`<section class="slide slide-4">
  <div class="slide-header"><div class="nb-label nb-label-blue">篇幅分布</div></div>
  <div class="chart-frame"><div class="chart-header"><h2 class="nb-heading-md">每一章有幾頁</h2>
    <div class="chart-legend">${B.parts.map(p => `<div class="legend-item"><div class="legend-swatch" style="background:${col[p.id]};"></div>${esc(p.title)}</div>`).join('')}</div></div>
  <div class="chart-body"><svg class="chart-svg" viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
    <line x1="60" y1="20" x2="60" y2="280" stroke="#000" stroke-width="3"/><line x1="60" y1="280" x2="780" y2="280" stroke="#000" stroke-width="3"/>
    ${[1, 2, 3, 4, 5].map(i => top / 5 * i).map(v => `<line x1="60" y1="${y(v)}" x2="780" y2="${y(v)}" stroke="#000" stroke-width="1" stroke-dasharray="4,4" opacity="0.3"/><text x="48" y="${y(v) + 5}" text-anchor="end" font-family="Space Grotesk, monospace" font-size="14" font-weight="600">${v}</text>`).join('')}
    <text x="48" y="285" text-anchor="end" font-family="Space Grotesk, monospace" font-size="14" font-weight="600">0</text>
    ${ps.map((d, i) => `<rect x="${x0 + i * w + (w - bw) / 2}" y="${y(d.p)}" width="${bw}" height="${280 - y(d.p)}" fill="${col[d.part.id]}" stroke="#000" stroke-width="2"/><text x="${x0 + i * w + w / 2}" y="${y(d.p) - 8}" text-anchor="middle" font-family="Space Grotesk, monospace" font-size="14" font-weight="700">${d.p}</text><text x="${x0 + i * w + w / 2}" y="318" text-anchor="middle" font-family="Space Grotesk, monospace" font-size="16" font-weight="700">${d.n}</text>`).join('')}
    <text x="420" y="350" text-anchor="middle" font-family="Space Grotesk, monospace" font-size="13" font-weight="600">章</text>
  </svg>
  <div class="data-column">
    <div class="data-box"><span class="data-num">${ps.reduce((a, b) => a + b.p, 0)}</span><span class="data-label">${ps.length} 章合計頁數</span></div>
    <div class="data-box"><span class="data-num">CH ${no(longest.n)}</span><span class="data-label">最長 · ${longest.p} 頁</span></div>
    <div class="data-box"><span class="data-num">CH ${no(shortest.n)}</span><span class="data-label">最短 · ${shortest.p} 頁</span></div>
  </div></div></div></section>`);
}

// chapters: two slides each
B.chapters.forEach((c, i) => {
  const p = partOf(c.n), sl = c.slide || {}, bg = BG[i % BG.length], lbl = LBL[B.parts.indexOf(p) % LBL.length];
  const stat = sl.stat || { num: 'CH ' + no(c.n), label: c.title_tw };
  S.push(`<section class="slide slide-6" data-ch="${c.n}">
  <div class="split-visual"><div class="ch-no">${no(c.n)}</div>
    <div class="visual-box"><span class="big" style="font-size:${big(stat.num)}px;">${esc(stat.num)}</span><span class="cap">${esc(stat.label)}</span></div>
    <div class="visual-label">CH ${no(c.n)} · p.${esc(c.pages)}</div></div>
  <div class="split-content">
    <div><div class="nb-label keepcase ${lbl}">${esc(p.title)} · ${esc(c.title_tw)}</div></div>
    <h2 class="nb-heading-md keepcase">${esc(sl.headline || c.title_tw)}</h2>
    <ul class="content-list">${(sl.bullets || []).slice(0, 4).map((b, j) => `<li><span class="list-num">${no(j + 1)}</span><span>${esc(b)}</span></li>`).join('')}</ul>
    <div><a class="nb-btn" href="whiteboard.html#ch${c.n}">在白板打開這一章</a></div>
  </div></section>`);
  const f = (c.formulas || [])[0];
  S.push(`<section class="slide slide-2 ${bg}">
  <div class="col-left">
    <div><div class="nb-label nb-label-yellow">CH ${no(c.n)} · 關鍵術語</div></div>
    <h2 class="nb-heading-lg keepcase">${esc(c.title_tw)}</h2>
    <p class="nb-body" style="max-width:480px;">${esc(c.one_liner)}</p>
    ${f ? `<div><span class="stat-pill">${esc(f.name)}:${esc(f.expr)}</span></div>` : ''}
    ${(c.pitfalls || [])[0] ? `<div class="warn"><b>常見誤解</b>${esc(c.pitfalls[0])}</div>` : ''}
  </div>
  <div class="col-right">${(c.concepts || []).slice(0, 3).map(k => `<div class="intro-card"><h3>${esc(k.tw)}<small>${esc(k.en)}${k.diff ? ' · 簡體:' + esc(k.cn) : ''}</small></h3><p>${esc(k.note)}</p></div>`).join('')}</div>
</section>`);
});

S.push(`<section class="slide slide-9">
  <div class="slide-header"><div class="nb-label nb-label-pink">決策表</div><h2 class="nb-heading-lg" style="margin-top:16px;">該用哪個檢定?</h2></div>
  <div class="team-grid g5">${D.map(d => `<div class="team-card"><div class="team-avatar">${no(d.ch)}</div><div class="team-name">${esc(d.test)}</div><div class="team-bio">${esc(d.q)}</div></div>`).join('')}</div></section>`);

S.push(`<section class="slide slide-5">
  <div class="quote-frame"><div class="deco-quote-marks">"</div>${brackets}
    <p class="quote-text">統計量不會說謊,會出錯的是解讀它的人。</p>
    <p class="quote-author">— 本書前言的主張(改寫,非原句)</p></div>
  <div class="deco-stripes"></div></section>`);

S.push(`<section class="slide slide-10">
  <div class="deco-dots-bottom"></div>
  <div class="close-frame"><div class="deco-star"></div>
    <h2 class="close-title">讀完了,<br>去白板連起來</h2>
    <p class="close-subtitle">把 ${B.chapters.length} 章拖成你自己的概念圖,或匯入 Heptabase 繼續長。</p>
    <a class="close-btn" href="whiteboard.html">打開學習白板</a></div></section>`);

const nav = read('src/slides.nav.js');
fs.writeFileSync(R('slides.html'), `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>白話統計學 · 簡報</title>
  <!-- Built by scripts/build.mjs from content/. Template: BlockFrame (github.com/zarazhangrui/beautiful-html-templates, MIT). -->
  <style>
${css}
  </style>
</head>
<body>

  <div class="slide-counter" id="slideCounter">01 / ${no(S.length)}</div>
  <a class="nb-label home-link" href="index.html">← 學習計畫</a>

  <div class="nav-controls">
    <button class="nav-btn" onclick="prevSlide()" aria-label="上一頁">&#8592;</button>
    <button class="nav-btn" onclick="nextSlide()" aria-label="下一頁">&#8594;</button>
  </div>

  <div class="slides-container">

${S.join('\n\n')}

  </div>

  <script>
${nav}
  </script>

</body>
</html>
`);

// ---------------------------------------------------------------- Heptabase markdown cards
const H = R('heptabase'); fs.rmSync(H, { recursive: true, force: true }); fs.mkdirSync(path.join(H, 'concepts'), { recursive: true });
const fname = s => s.replace(/[\\/:*?"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim();
const chName = c => fname(`CH${no(c.n)} ${c.title_tw}`);
const cardNames = new Map(); // tw term -> file name
for (const c of B.chapters) for (const k of c.concepts || []) if (!cardNames.has(k.tw)) cardNames.set(k.tw, { name: fname(k.tw), k, chs: [] });
for (const c of B.chapters) for (const k of c.concepts || []) cardNames.get(k.tw).chs.push(c);
const W = (f, s) => fs.writeFileSync(path.join(H, f), s.replace(/\n{3,}/g, '\n\n').trim() + '\n');

for (const c of B.chapters) {
  const p = partOf(c.n), m = B.compare.chapterMap.find(x => x.cn_n === c.n);
  const prev = B.edges.filter(e => e.to === c.n).map(e => `[[${chName(B.chapters.find(x => x.n === e.from))}]](${e.label})`);
  const next = B.edges.filter(e => e.from === c.n).map(e => `[[${chName(B.chapters.find(x => x.n === e.to))}]](${e.label})`);
  W(chName(c) + '.md', `# CH${no(c.n)} ${c.title_tw}

> ${c.one_liner}

- 英文:${c.title_en}
- 簡體章名:${c.title_cn}(簡體版 p.${c.pages})
- 台灣三版:第 ${m.tw_n} 章${m.note ? `(${m.note})` : ''}
- 階段:${p.title} — ${p.sub}
${prev.length ? `- 先備:${prev.join('、')}\n` : ''}${next.length ? `- 接著讀:${next.join('、')}\n` : ''}
## 本章在說什麼

${c.summary}

${(c.sections || []).map(s => `## ${s.heading}\n\n${s.points.map(x => `- ${x}`).join('\n')}`).join('\n\n')}

## 術語

| 台灣 | 簡體 | English | 白話 |
|---|---|---|---|
${(c.concepts || []).map(k => `| [[${fname(k.tw)}]] | ${k.cn} | ${k.en} | ${k.note} |`).join('\n')}

${(c.formulas || []).length ? `## 公式\n\n${c.formulas.map(f => `- **${f.name}**:\`${f.expr}\`${f.note ? ` — ${f.note}` : ''}`).join('\n')}` : ''}

${c.example ? `## 書中例子\n\n**${c.example.title}**:${c.example.takeaway}` : ''}

${(c.pitfalls || []).length ? `## 常見誤解\n\n${c.pitfalls.map(x => `- ${x}`).join('\n')}` : ''}

${c.apa ? `## 行文表述\n\n${c.apa}` : ''}

${c.clinical ? `## 臨床比喻(延伸,非書中內容)\n\n${c.clinical}` : ''}

${(c.quiz || []).length ? `## 自我檢核\n\n${c.quiz.map(z => `- **Q:${z.q}**\n  - ${z.a}`).join('\n')}` : ''}
`);
}
for (const { name, k, chs } of cardNames.values()) W(`concepts/${name}.md`, `# ${k.tw}

- English:${k.en}
- 簡體譯名:${k.cn}${k.diff ? '(與台灣用語不同)' : ''}
- 出處:${chs.map(c => `[[${chName(c)}]]`).join('、')}

${k.note}
`);
W('00 白話統計學 學習地圖.md', `# 白話統計學 學習地圖

${B.meta.note}

${B.parts.map(p => `## ${p.title} — ${p.sub}\n\n${p.chapters.map(n => B.chapters.find(c => c.n === n)).filter(Boolean).map(c => `- [[${chName(c)}]]:${c.one_liner}`).join('\n')}`).join('\n\n')}

## 工具卡

- [[版本比對 簡體版 vs 台灣版]]
- [[術語譯名對照表]]
- [[該用哪個檢定]]
`);
W('版本比對 簡體版 vs 台灣版.md', `# 版本比對 簡體版 vs 台灣版

> ${B.compare.headline}

## 書目

| | ${E.map(e => e.label).join(' | ')} |
|---|${E.map(() => '---').join('|')}|
${B.compare.editionRows.map(r => `| ${r.k} | ${E.map(e => e[r.f]).join(' | ')} |`).join('\n')}

## 主要差異

${B.compare.keyDiffs.map(d => `- **${d.t}**:${d.d}`).join('\n')}

## 章節對照

| 簡體 3E | 簡體章名 | 台灣三版 | 台灣章名 | 差異 |
|---|---|---|---|---|
${B.compare.chapterMap.map(m => `| ${m.cn_n ? '第 ' + m.cn_n + ' 章' : '—'} | ${m.cn || '—'} | 第 ${m.tw_n} 章 | ${m.tw} | ${m.note} |`).join('\n')}

## 附錄對照

| 內容 | 簡體 3E | 台灣三版 |
|---|---|---|
${B.compare.appendices.map(a => `| ${a.what} | ${a.cn} | ${a.tw} |`).join('\n')}

${B.compare.sourceNote}
`);
W('術語譯名對照表.md', `# 術語譯名對照表

共 ${B.compare.terms.length} 組,其中 ${diffTerms.length} 組兩岸譯名不同(排在前面)。

| English | 台灣 | 簡體 | 不同? | 章 |
|---|---|---|---|---|
${B.compare.terms.map(t => `| ${t.en} | ${t.tw} | ${t.cn} | ${t.diff ? '★' : ''} | ${t.ch} |`).join('\n')}

${B.compare.termNote}
`);
W('該用哪個檢定.md', `# 該用哪個檢定

| 你的問題 | 方法 | 章 |
|---|---|---|
${D.map(d => { const c = B.chapters.find(x => x.n === d.ch); return `| ${d.q} | **${d.test}** | ${c ? `[[${chName(c)}]]` : 'CH' + no(d.ch)} |`; }).join('\n')}
`);
W('README.md', `# Heptabase 卡片包

這個資料夾是給 Heptabase 匯入用的 Markdown 卡片:${B.chapters.length} 張章節卡、${cardNames.size} 張術語卡(\`concepts/\`)、4 張工具卡。卡片之間用 \`[[雙括號]]\` 互相連結。

## 匯入步驟

1. 下載 repo 根目錄的 \`heptabase-cards.zip\` 並解壓縮(或直接使用這個資料夾)。
2. Heptabase 左下角 **Import** → 選 **Markdown / Obsidian**,把整個資料夾拖進去。
3. 匯入後所有卡片會出現在 Card Library;開一張新白板,把「00 白話統計學 學習地圖」拖上去,再依五個階段把章節卡拉進來分區(Section)。
4. 排版可以參考 repo 裡的 \`whiteboard.html\`:五個色塊就是五個 Section,箭頭就是卡片之間的連線。

匯入選單的名稱可能隨 Heptabase 版本調整;若找不到,請在 Heptabase 的說明文件搜尋 "import markdown"。

${B.meta.note}
`);
try { fs.rmSync(R('heptabase-cards.zip'), { force: true }); execFileSync('zip', ['-q', '-r', '-X', 'heptabase-cards.zip', 'heptabase'], { cwd: root }); } catch (e) { console.warn('zip skipped:', e.message); }

console.log(`built: ${B.chapters.length} chapters, ${S.length} slides, ${B.compare.terms.length} terms (${diffTerms.length} differ), ${cardNames.size} concept cards`);
