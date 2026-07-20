(function () {
  "use strict";

  const data = window.RESUME_DATA;

  if (!data) {
    console.error(
      "未找到 window.RESUME_DATA，请检查 resume-data.js 是否正确加载。"
    );
    return;
  }

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const bulletList = (items = []) => `
    <ul class="bullet-list">
      ${items.map((item) => `<li>${esc(item)}</li>`).join("")}
    </ul>
  `;

  const entry = (
    { title, period, subtitle, bullets },
    className = "entry"
  ) => `
    <article class="${className}">
      <div class="entry-heading">
        <h3>${esc(title)}</h3>
        <time>${esc(period)}</time>
      </div>

      ${
        subtitle
          ? `<p class="entry-subtitle">${esc(subtitle)}</p>`
          : ""
      }

      ${bulletList(bullets)}
    </article>
  `;

  const section = (
    title,
    content,
    className = ""
  ) => `
    <section class="resume-section ${className}">
      <h2 class="section-title">${esc(title)}</h2>
      ${content}
    </section>
  `;

  const aiProjectHtml = entry(
    {
      title: data.aiProject.name,
      period: data.aiProject.period,
      subtitle: data.aiProject.subtitle,
      bullets: data.aiProject.bullets
    },
    "entry ai-project-entry"
  );

  /*
    打印仍保持两页：
    第1页：个人总结 + AI 项目经历 + 有信云 + 豌豆思维
    第2页：滴普科技 + 道一云 + 项目经历 + 教育经历

    PC 端视觉连续，因此看起来仍是一张长页。
  */

  const firstPageExperienceHtml =
    data.experience
      .slice(0, 2)
      .map((item) =>
        entry(
          {
            title: item.company,
            period: item.period,
            subtitle: item.subtitle,
            bullets: item.bullets
          },
          "entry experience-entry"
        )
      )
      .join("");

  const secondPageExperienceHtml =
    data.experience
      .slice(2)
      .map((item) =>
        entry(
          {
            title: item.company,
            period: item.period,
            subtitle: item.subtitle,
            bullets: item.bullets
          },
          "entry experience-entry"
        )
      )
      .join("");

  const projectsHtml =
    data.projects
      .map((item) =>
        entry(
          {
            title: item.name,
            period: item.period,
            subtitle: item.subtitle,
            bullets: item.bullets
          },
          "entry project-entry"
        )
      )
      .join("");

  const educationHtml =
    data.education
      .map((item) =>
        entry(
          {
            title: `${item.school} ｜ ${item.degree}`,
            period: item.period,
            subtitle: "",
            bullets: item.bullets
          },
          "entry education-entry"
        )
      )
      .join("");

  const resume =
    document.querySelector("#resume");

  if (!resume) {
    console.error("未找到 #resume 容器。");
    return;
  }

  resume.innerHTML = `
    <section
      class="resume-page page-one"
      aria-label="简历第1页"
    >
      <header class="profile-header">

        <div class="profile-main">

          <h1>
            ${esc(data.profile.name)}
          </h1>

          <p class="contact-line">
            <span>${esc(data.profile.phone)}</span>
            <span>${esc(data.profile.email)}</span>
          </p>

          <p class="status-line">
            <span>${esc(data.profile.targetRole)}</span>
          </p>

        </div>

        <img
          class="profile-photo"
          src="${esc(data.profile.avatar)}"
          alt="个人证件照"
        />

      </header>

      ${section(
        "个人总结",
        bulletList(data.summary)
      )}

      ${section(
        "AI 项目经历",
        aiProjectHtml,
        "ai-project-section"
      )}

      ${section(
        "工作经历",
        firstPageExperienceHtml
      )}

    </section>

    <section
      class="resume-page page-two"
      aria-label="简历第2页"
    >

      ${section(
        "工作经历（续）",
        secondPageExperienceHtml,
        "continuation-section"
      )}

      ${section(
        "项目经历",
        projectsHtml
      )}

      ${section(
        "教育经历",
        educationHtml
      )}

    </section>
  `;

  /*
    PC 连续长页浏览时，
    隐藏“工作经历（续）”标题，
    视觉上让工作经历连续。

    打印 iframe 中会恢复显示。
  */
  const continuationTitle =
    document.querySelector(
      ".continuation-section .section-title"
    );

  if (continuationTitle) {
    continuationTitle.classList.add(
      "screen-only-hidden-title"
    );
  }

  /* =========================================================
     独立 iframe 打印
  ========================================================= */

  const PRINT_CSS = `
    @page {
      size: A4 portrait;
      margin: 0;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;

      background: #ffffff;
      color: #151515;

      font-family:
        "PingFang SC",
        "Microsoft YaHei",
        "Noto Sans CJK SC",
        Arial,
        sans-serif;

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      display: block;
      width: 210mm;

      margin: 0;
      padding: 0;

      background: #ffffff;
    }

    .resume-page {
      display: block;

      width: 210mm;
      height: 296mm;

      margin: 0;

      padding:
        11mm
        15mm
        10mm;

      overflow: hidden;

      background: #ffffff;

      page-break-after: always;
      break-after: page;
    }

    .resume-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .page-one,
    .page-two {
      padding:
        11mm
        15mm
        10mm;
    }

    .profile-header {
      min-height: 28mm;

      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      gap: 18px;

      margin-bottom: 3mm;
    }

    .profile-main {
      min-width: 0;
      padding-top: 0.5mm;
    }

    .profile-main h1 {
      margin: 0 0 1.3mm;

      font-size: 24px;
      line-height: 1.1;

      font-weight: 700;
    }

    .contact-line,
    .status-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      margin: 0;

      font-size: 11.1px;
      line-height: 1.5;

      color: #222222;
    }

    .contact-line span + span::before {
      content: " 丨 ";
      color: #555555;
    }

    .profile-photo {
      width: 21mm;
      height: 27mm;

      object-fit: cover;
      object-position: center 20%;

      flex: 0 0 auto;
    }

    .resume-section + .resume-section {
      margin-top: 3.2mm;
    }

    .section-title {
      margin: 0 0 2mm;
      padding: 0 0 1.1mm;

      border-bottom:
        1.6px solid
        #262626;

      font-size: 19px;
      line-height: 1.05;

      font-weight: 700;
    }

    .bullet-list {
      margin: 0;
      padding-left: 5.1mm;

      font-size: 10.9px;
      line-height: 1.45;
    }

    .bullet-list li {
      margin: 0 0 0.8mm;
      padding-left: 0.5mm;
    }

    .bullet-list li:last-child {
      margin-bottom: 0;
    }

    .entry {
      margin: 0 0 2.2mm;

      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .entry-heading {
      display: grid;

      grid-template-columns:
        minmax(0, 1fr)
        auto;

      align-items: baseline;

      gap: 10mm;

      margin-bottom: 0.5mm;
    }

    .entry-heading h3 {
      margin: 0;

      font-size: 13.8px;
      line-height: 1.3;

      font-weight: 700;
    }

    .entry-heading time {
      white-space: nowrap;

      font-size: 10.8px;
      line-height: 1.3;

      color: #3f3f3f;
    }

    .entry-subtitle {
      margin: 0 0 0.7mm;

      font-size: 10.8px;
      line-height: 1.4;

      color: #333333;
    }

    .entry .bullet-list {
      font-size: 10.7px;
      line-height: 1.42;
    }

    .entry .bullet-list li {
      margin-bottom: 0.55mm;
    }

    .screen-only-hidden-title {
      display: block !important;
    }
  `;

  async function waitForImages(doc) {
    const images =
      Array.from(doc.images);

    await Promise.all(
      images.map(
        async (image) => {

          if (!image.complete) {
            await new Promise(
              (resolve) => {
                image.addEventListener(
                  "load",
                  resolve,
                  { once: true }
                );

                image.addEventListener(
                  "error",
                  resolve,
                  { once: true }
                );
              }
            );
          }

          if (
            typeof image.decode
            === "function"
          ) {
            try {
              await image.decode();
            } catch (_) {}
          }
        }
      )
    );
  }

  async function printResume() {

    const iframe =
      document.createElement(
        "iframe"
      );

    iframe.setAttribute(
      "aria-hidden",
      "true"
    );

    iframe.style.position =
      "fixed";

    iframe.style.right =
      "0";

    iframe.style.bottom =
      "0";

    iframe.style.width =
      "1px";

    iframe.style.height =
      "1px";

    iframe.style.border =
      "0";

    iframe.style.opacity =
      "0";

    iframe.style.pointerEvents =
      "none";

    document.body.appendChild(
      iframe
    );

    const printWindow =
      iframe.contentWindow;

    const printDocument =
      iframe.contentDocument
      ||
      printWindow.document;

    printDocument.open();

    printDocument.write(`
      <!doctype html>

      <html lang="zh-CN">

      <head>

        <meta charset="UTF-8" />

        <base
          href="${esc(document.baseURI)}"
        />

        <title>
          林镇伟｜AI产品经理简历
        </title>

        <style>
          ${PRINT_CSS}
        </style>

      </head>

      <body>

        <main class="resume">
          ${resume.innerHTML}
        </main>

      </body>

      </html>
    `);

    printDocument.close();

    try {
      if (
        printDocument.fonts
        &&
        printDocument.fonts.ready
      ) {
        await printDocument.fonts.ready;
      }
    } catch (_) {}

    await waitForImages(
      printDocument
    );

    void printDocument.body.offsetHeight;

    await new Promise(
      (resolve) =>
        printWindow.requestAnimationFrame(
          () =>
            printWindow.requestAnimationFrame(
              resolve
            )
        )
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100
        )
    );

    printWindow.focus();
    printWindow.print();

    const cleanup = () => {
      setTimeout(
        () => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(
              iframe
            );
          }
        },
        500
      );
    };

    printWindow.addEventListener(
      "afterprint",
      cleanup,
      {
        once: true
      }
    );

    setTimeout(
      cleanup,
      60000
    );
  }

  /*
    重要：
    app.js 只监听已有 #printButton，
    不创建下载按钮。
    因此不会再出现两个“下载”。
  */

  const printButton =
    document.querySelector(
      "#printButton"
    );

  if (printButton) {

    printButton.addEventListener(
      "click",
      async () => {

        if (
          printButton.disabled
        ) {
          return;
        }

        printButton.disabled =
          true;

        try {

          await printResume();

        } catch (error) {

          console.error(
            "打印失败：",
            error
          );

          alert(
            "打印初始化失败，请刷新页面后重试。"
          );

        } finally {

          printButton.disabled =
            false;

        }
      }
    );
  }
})();
