# 林镇伟｜AI 产品经理简历

纯静态 GitHub Pages 简历，无框架、无构建依赖。

## 项目结构

```text
.
├── index.html          # 页面入口，不放具体简历文案
├── resume-data.js      # 唯一的简历内容数据源
├── app.js              # 根据 resume-data.js 自动生成两页简历
├── style.css           # 网页与 A4 打印样式
├── assets/
│   ├── profile.jpg
│   ├── favicon-lz-32.png
│   └── favicon-lz-192.png
└── .nojekyll
```

## 修改简历文字

以后只修改：

```text
resume-data.js
```

常见位置：

- `profile`：姓名、电话、邮箱、求职状态
- `summary`：个人总结
- `experience`：工作经历
- `projects`：项目经历
- `education`：教育经历

不要再手工维护 SVG、隐藏 HTML 或重复的源文件。

## 修改样式

只修改：

```text
style.css
```

页面被明确拆成两张 A4：

- 第 1 页：个人信息、个人总结、工作经历
- 第 2 页：项目经历、教育经历

打印时浏览器会强制按两张 A4 分页。

## 本地预览

直接打开 `index.html` 即可，也可以在目录执行：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## GitHub Pages

仓库是纯静态页面，可直接使用 GitHub Pages 部署。修改文件并提交到主分支后，等待 Pages 更新即可。

## 打印 / 保存 PDF

点击页面右上角「打印 / 保存 PDF」，打印设置建议：

- 纸张：A4
- 缩放：100%
- 边距：无
- 页眉和页脚：关闭

打印内容严格分为 2 页。
