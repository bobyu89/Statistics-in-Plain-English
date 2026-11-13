# 白話統計學 · 學習站

Timothy C. Urdan《Statistics in Plain English》的讀書筆記站。內容來源是簡體版《白话统计学(第3版)》(中国人民大学出版社,2013),逐章讀完後整理成有圖、有比喻、有對照表的重點講義,並對照台灣雙葉書廊版的版本差異。

> 本 repo 只放自己改寫的學習筆記,不含原書全文、掃描檔或 OCR 文字。

## 打開哪個檔案

| 檔案 | 內容 |
|---|---|
| `index.html` | 首頁「我的學習計畫」:15 章卡片(點開是講義:圖、比喻、三個重點、對照表、公式)、完成進度、搜尋、版本比對、術語表、隨堂小考 |
| `whiteboard.html` | Heptabase 風格學習白板:章節卡、術語卡、公式卡,可拖曳、縮放、連線 |
| `slides.html` | BlockFrame 簡報:版本差異、學習地圖、目錄頁、每章四頁(章首、圖解、比喻與術語、對照表)、檢定決策表。← → 翻頁,↑ ↓ 跳章,右上角「章節」選單可直接跳 |
| `heptabase/`、`heptabase-cards.zip` | 可匯入 Heptabase 的 Markdown 卡片包,匯入步驟見 `heptabase/README.md` |

三個 HTML 都是單一檔案、資料已內嵌,直接用瀏覽器開即可(字體從 Google Fonts 載入)。學習進度與白板排版存在瀏覽器的 localStorage。

## 版本比對結論

- 簡體版(2013,彭志文 譯)對應英文 **3E**:15 章、5 張附錄表。
- 台灣雙葉三版(2025,陳雅琪、陳信木、翁志遠 譯)的章節與附錄和英文 **5E** 相同:16 章、8 張附錄表。
- 「相關」在簡體版是第 8 章,在台灣三版是第 12 章;簡體第 9–12 章 = 台灣三版第 8–11 章。
- 簡體第 14 章只講卡方;台灣三版第 14 章擴大為「無母數統計」,並新增第 16 章「個人中心取向的分析」。

台灣版資料來自書店商品頁(博客來、三民、麗文),沒有取得台灣版內文。

## 修改內容

```
content/base.json          書目、版本比對、學習階段、連線、檢定決策表
content/chapters/chNN.json 每章筆記(摘要、術語、公式、例子、誤解、小考、簡報重點)
content/briefs.json        每章的比喻、三個重點、對照表
src/figs.js                每章一張圖(SVG)
src/                       三個頁面的樣板、共用程式、BlockFrame CSS
scripts/build.mjs          產生 index.html / whiteboard.html / slides.html / heptabase/
```

改完 `content/` 或 `src/` 後重建:

```bash
node scripts/build.mjs
```

## 致謝

簡報樣板是 [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) 的 **BlockFrame**(MIT,© 2026 Zara Zhang)。`src/blockframe.css` 是原樣板的 CSS;為了顯示中文,build 時在字體清單後面加上 Noto Sans TC,並在 `src/slides.extra.css` 補了比較表等幾個原樣板沒有的版型。
