# 林镇伟简历 GitHub Pages 版本

该版本按原始 A4 PDF 逐页矢量复刻，网页展示与打印均固定为两页，避免因 Windows、macOS、手机字体不同而发生换行和分页变化。

## 文件说明

- `index.html`：GitHub Pages 首页
- `style.css`：屏幕显示、移动端缩放与 A4 打印样式
- `assets/page-1.svg`：简历第 1 页矢量页面
- `assets/page-2.svg`：简历第 2 页矢量页面
- `resume.pdf`：原版两页 PDF，可通过 `https://你的域名/resume.pdf` 直接访问

## 部署到 GitHub Pages

1. 将本目录中的全部文件和 `assets` 文件夹上传到仓库根目录。
2. 打开仓库 `Settings` → `Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. 分支选择 `main`，目录选择 `/ (root)`，点击 `Save`。
5. 等待约 1–3 分钟后访问 GitHub Pages 地址。

## 打印为两页 PDF

在网页中按 `Ctrl + P` 或 `Command + P`：

- 纸张：A4
- 边距：无
- 缩放：100%
- 页眉和页脚：关闭
- 背景图形：开启

页面已通过 CSS 固定为两页，不会生成第三页。
