// Shared between index.html and whiteboard.html (inlined by scripts/build.mjs)
window.SIPE = (function () {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const no = n => String(n).padStart(2, '0');
  function chapterHTML(c, B, links) {
    const m = B.compare.chapterMap.find(x => x.cn_n === c.n) || {};
    return `<div class="k">CH ${no(c.n)} · 簡體版 p.${esc(c.pages)}</div>
  <h2>${esc(c.title_tw)}</h2>
  <div class="sub">${esc(c.title_en)} · 簡體章名「${esc(c.title_cn)}」${m.tw_n ? ` · 台灣三版第 ${m.tw_n} 章` : ''}</div>
  <div class="lead">${esc(c.one_liner)}</div>
  <h4>本章在說什麼</h4><p>${esc(c.summary)}</p>
  ${(c.sections || []).map(s => `<h4>${esc(s.heading)}</h4><ul>${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}
  ${c.concepts?.length ? `<h4>術語對照(台灣／簡體／English)</h4><div class="tw"><table><tr><th>台灣</th><th>簡體</th><th>English</th><th>白話</th></tr>${c.concepts.map(k => `<tr><td><b>${esc(k.tw)}</b></td><td class="${k.diff ? 'diff' : ''}">${esc(k.cn)}</td><td>${esc(k.en)}</td><td>${esc(k.note)}</td></tr>`).join('')}</table></div>` : ''}
  ${c.formulas?.length ? `<h4>公式</h4>${c.formulas.map(f => `<div class="fx"><b>${esc(f.name)}</b><code>${esc(f.expr)}</code><span>${esc(f.note || '')}</span></div>`).join('')}` : ''}
  ${c.example ? `<h4>書中例子</h4><p><b>${esc(c.example.title)}</b>　${esc(c.example.takeaway)}</p>` : ''}
  ${c.pitfalls?.length ? `<h4>常見誤解</h4><ul>${c.pitfalls.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
  ${c.apa ? `<h4>行文表述(怎麼寫進論文)</h4><p>${esc(c.apa)}</p>` : ''}
  ${c.clinical ? `<h4>臨床比喻<span class="tag">延伸,非書中內容</span></h4><p>${esc(c.clinical)}</p>` : ''}
  ${c.quiz?.length ? `<h4>自我檢核</h4>${c.quiz.map(z => `<details><summary>${esc(z.q)}</summary><p>${esc(z.a)}</p></details>`).join('')}` : ''}
  ${c.symbols?.length ? `<h4>本章符號</h4><div class="tw"><table>${c.symbols.map(y => `<tr><td><b>${esc(y.sym)}</b></td><td>${esc(y.meaning)}</td></tr>`).join('')}</table></div>` : ''}
  ${c.ocr_notes?.length ? `<h4>請對原書核對<span class="tag">OCR 不確定</span></h4><ul>${c.ocr_notes.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
  <div class="chips">${links || ''}</div>`;
  }
  const detailCSS = `
.k{font-size:12px;color:var(--muted);letter-spacing:.08em}
.dz h2{font-size:28px;font-weight:500;letter-spacing:-.02em;line-height:1.15;margin:4px 0 4px;text-wrap:balance}
.dz .sub{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5}
.dz h4{font-size:13px;font-weight:600;letter-spacing:.06em;margin:24px 0 10px;display:flex;align-items:center;gap:8px}
.dz h4::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--green-d);flex:none}
.dz p,.dz li{font-size:14.5px;line-height:1.7}
.dz ul{padding-left:1.2em}
.lead{background:var(--blue);border-radius:18px;padding:14px 16px;font-size:15px;line-height:1.6}
.tw{overflow-x:auto;border-radius:14px;border:1px solid var(--line)}
.dz table{border-collapse:collapse;width:100%;font-size:13.5px;line-height:1.5}
.dz th,.dz td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.dz th{font-size:12px;font-weight:600;color:var(--muted);background:#fafaf9;white-space:nowrap}
.dz tr:last-child td{border-bottom:0}
.dz td.diff{background:#fff7d6}
.fx{background:#f6f6f4;border-radius:14px;padding:12px 14px;margin-bottom:8px}
.fx b{font-size:13px;font-weight:600}
.fx code{display:block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;margin:4px 0;overflow-x:auto;white-space:pre-wrap}
.fx span{font-size:13px;color:var(--muted)}
.dz details{border:1px solid var(--line);border-radius:14px;padding:10px 14px;margin-bottom:8px}
.dz summary{cursor:pointer;font-size:14.5px;font-weight:500;line-height:1.5}
.dz details p{margin-top:8px;color:#333}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.chips a{font-size:13px;padding:9px 14px;border-radius:999px;background:var(--ink);color:#fff}
.chips a.alt{background:var(--green);color:#111}
.tag{display:inline-block;font-size:11px;font-weight:400;letter-spacing:0;padding:2px 8px;border-radius:999px;background:var(--yellow);margin-left:6px;white-space:nowrap}
.srcnote{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.6}`;
  return { esc, no, chapterHTML, detailCSS };
})();
