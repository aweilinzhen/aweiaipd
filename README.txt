打印功能最终修复方案

问题原因：
旧方案使用隐藏 iframe（1px、opacity:0）或直接 window.print()。
Chrome/macOS 在这种动态 DOM 打印场景下可能出现：
- 头像显示
- 横线显示
- 列表圆点显示
- 正文文字完全空白

新方案：
1. app.js 点击“打印 / 保存 PDF”时同步打开 print.html（正常顶层页面）。
2. print.html 从 opener 中复制当前已经渲染好的 #resume DOM。
3. 使用独立 print.css，不继承 PC 长页样式。
4. 等待字体、头像和两帧绘制完成后再 window.print()。
5. 打印结束后自动关闭打印页。

需要上传/覆盖：
- app.js（覆盖）
- print.html（新增）
- print.js（新增）
- print.css（新增）

index.html、resume-data.js、style.css 不需要因为本次打印修复而修改。

注意：
浏览器若提示阻止弹出窗口，请允许 aweilinzhen.github.io 的弹出窗口。
