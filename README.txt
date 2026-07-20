基于用户提供的 RESUME_DATA 修改：

1. 保留 profile / summary / experience / education 原文。
2. 将原 projects[0] 的 AI 项目移出，改为独立 aiProject。
3. 页面顺序：个人总结 → AI 项目经历 → 工作经历 → 项目经历 → 教育经历。
4. projects 中删除 AI 项目，避免重复。
5. 修复两个下载按钮：
   - index.html 只保留 1 个下载 + 1 个打印
   - app.js 不再创建任何下载按钮，只绑定 #printButton
6. 打印继续使用独立 iframe，两页 A4。

建议同时覆盖：
- index.html
- resume-data.js
- app.js
- style.css

特别注意：
如果只替换 resume-data.js，而保留旧 app.js，两个下载按钮问题仍可能存在。
