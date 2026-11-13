// Shared between index.html and whiteboard.html (inlined by scripts/build.mjs, after figs.js)
window.SIPE = (function () {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const no = n => String(n).padStart(2, '0');
  const table = t => `<div class="tw"><table><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<td><b>${esc(c)}</b></td>`).join('')}</tr>`).join('')}</table></div>`;
  function chapterHTML(c, B, links) {
    const b = c.brief || {};
    return `<div class="k">CH ${no(c.n)} · ${esc(c.title_en)}</div>
  <h2>${esc(c.title_tw)}</h2>
  <div class="lead">${esc(c.one_liner)}</div>
  <figure class="figbox">${FIGS.svg(c.n)}<figcaption>${esc(FIGS.caption(c.n))}</figcaption></figure>
  ${b.analogy ? `<div class="ana"><span>比喻</span><b>${esc(b.analogy_title)}</b><p>${esc(b.analogy)}</p></div>` : ''}
  ${b.takeaways ? `<h4>三個重點</h4><ol class="take">${b.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}
  ${b.table ? `<h4>${esc(b.table.caption)}</h4>${table(b.table)}` : ''}
  ${FIGS.svg2(c.n) ? `<figure class="figbox" style="margin-top:18px">${FIGS.svg2(c.n)}<figcaption>${esc(FIGS.caption2(c.n))}</figcaption></figure>` : ''}
  ${(c.sections || []).length ? `<h4>這一章的路線</h4><ol class="route">${c.sections.map(x => `<li>${esc(x.heading)}</li>`).join('')}</ol>` : ''}
  ${c.formulas?.length ? `<h4>公式</h4><div class="fxg">${c.formulas.map(f => `<div class="fx"><b>${esc(f.name)}</b><code>${esc(f.expr)}</code></div>`).join('')}</div>` : ''}
  ${c.concepts?.length ? `<h4>關鍵術語</h4><div class="tw"><table><tr><th>中文</th><th>English</th><th>白話</th></tr>${c.concepts.slice(0, 5).map(k => `<tr><td><b>${esc(k.tw)}</b></td><td>${esc(k.en)}</td><td>${esc(k.note)}</td></tr>`).join('')}</table></div>` : ''}
  ${c.pitfalls?.length ? `<h4>常見誤解</h4><ul class="warn">${c.pitfalls.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
  ${c.clinical ? `<div class="ana clin"><span>臨床</span><p>${esc(c.clinical)}</p></div>` : ''}
  ${c.quiz?.length ? `<h4>自我檢核</h4>${c.quiz.map(z => `<details><summary>${esc(z.q)}</summary><p>${esc(z.a)}</p></details>`).join('')}` : ''}
  <h4>想看更多</h4>
  ${c.concepts?.length > 5 ? `<details><summary>其餘 ${c.concepts.length - 5} 個術語</summary><div class="tw" style="margin-top:10px"><table><tr><th>中文</th><th>English</th><th>白話</th></tr>${c.concepts.slice(5).map(k => `<tr><td><b>${esc(k.tw)}</b></td><td>${esc(k.en)}</td><td>${esc(k.note)}</td></tr>`).join('')}</table></div></details>` : ''}
  ${c.example ? `<details><summary>書中例子:${esc(c.example.title)}</summary><p>${esc(c.example.takeaway)}</p></details>` : ''}
  ${c.apa ? `<details><summary>怎麼寫進論文</summary><p>${esc(c.apa)}</p></details>` : ''}
  ${(c.sections || []).length ? `<details><summary>完整筆記(逐節)</summary>${c.sections.map(s => `<p><b>${esc(s.heading)}</b></p><ul>${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}</details>` : ''}
  <div class="chips">${links || ''}</div>`;
  }
  const detailCSS = `
.k{font-size:12px;color:var(--muted);letter-spacing:.08em}
.dz h2{font-size:28px;font-weight:500;letter-spacing:-.02em;line-height:1.15;margin:4px 0 12px;text-wrap:balance}
.dz .sub{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5}
.dz h4{font-size:13px;font-weight:600;letter-spacing:.06em;margin:24px 0 10px;display:flex;align-items:center;gap:8px}
.dz h4::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--green-d);flex:none}
.dz p,.dz li{font-size:14.5px;line-height:1.7}
.dz ul{padding-left:1.2em}
.lead{background:var(--blue);border-radius:18px;padding:14px 16px;font-size:16px;line-height:1.55;font-weight:500}
.figbox{margin:14px 0 0;border:1px solid var(--line);border-radius:18px;padding:12px 12px 10px;background:#fcfcfa}
.figbox svg,.fig{display:block;width:100%;height:auto}
.figbox figcaption{font-size:13px;color:var(--muted);line-height:1.5;margin-top:6px;text-align:center}
.ana{background:var(--yellow);border-radius:18px;padding:14px 16px;margin-top:12px;position:relative}
.ana span{font-size:11px;font-weight:600;letter-spacing:.08em;background:#fff;border-radius:999px;padding:2px 9px;margin-right:8px}
.ana b{font-size:15px;font-weight:600}
.ana p{margin-top:6px;font-size:14.5px;line-height:1.65}
.ana.clin{background:var(--lilac);margin-top:14px}
.ana.clin p{display:inline;margin:0}
.take{list-style:none;padding:0;display:grid;gap:8px;counter-reset:t}
.take li{counter-increment:t;display:flex;gap:12px;align-items:center;background:#f6f6f4;border-radius:14px;padding:10px 14px;font-size:14.5px;line-height:1.5}
.take li::before{content:counter(t);flex:none;width:26px;height:26px;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:600}
.route{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px;counter-reset:r}
.route li{counter-increment:r;position:relative;background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px 12px 8px 36px;font-size:13.5px;line-height:1.4;flex:1 1 200px}
.route li::before{content:counter(r);position:absolute;left:8px;top:8px;width:20px;height:20px;border-radius:50%;background:var(--green);font-size:12px;font-weight:600;display:grid;place-items:center}
.tw{overflow-x:auto;border-radius:14px;border:1px solid var(--line)}
.dz table{border-collapse:collapse;width:100%;font-size:13.5px;line-height:1.5}
.dz th,.dz td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.dz th{font-size:12px;font-weight:600;color:var(--muted);background:#fafaf9;white-space:nowrap}
.dz tr:last-child td{border-bottom:0}
.dz td.diff{background:#fff7d6}
.fxg{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}
.fx{background:#f6f6f4;border-radius:14px;padding:10px 14px}
.fx b{font-size:12px;font-weight:600;color:var(--muted)}
.fx code{display:block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;margin-top:3px;overflow-x:auto;white-space:pre-wrap;word-break:break-word}
.dz ul.warn{list-style:none;padding:0;display:grid;gap:6px}
.dz ul.warn li{background:#fff1f3;border-radius:12px;padding:8px 12px 8px 34px;position:relative;font-size:14px;line-height:1.55}
.dz ul.warn li::before{content:"!";position:absolute;left:10px;top:9px;width:17px;height:17px;border-radius:50%;background:#e5484d;color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center}
.dz details{border:1px solid var(--line);border-radius:14px;padding:10px 14px;margin-bottom:8px}
.dz summary{cursor:pointer;font-size:14.5px;font-weight:500;line-height:1.5}
.dz details p{margin-top:8px;color:#333}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.chips a{font-size:13px;padding:9px 14px;border-radius:999px;background:var(--ink);color:#fff}
.chips a.alt{background:var(--green);color:#111}
.srcnote{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.6}`;
  return { esc, no, chapterHTML, detailCSS, table };
})();
