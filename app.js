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
     打印：使用独立顶层页面

     不再使用：
     - window.print() 直接打印当前页
     - 1px / opacity:0 的隐藏 iframe

     原因：
     Chrome 在隐藏 iframe / 动态 DOM 场景下可能出现
     “头像、横线、项目符号正常，但正文文字不绘制”的问题。

     新方案：
     点击打印 → 打开同源 print.html → 复制当前已渲染的简历 DOM
     → 使用独立 A4 CSS → 等待字体/图片 → 调用打印。
  ========================================================= */

  const printButton =
    document.querySelector(
      "#printButton"
    );

  if (printButton) {
    printButton.addEventListener(
      "click",
      () => {
        if (printButton.disabled) {
          return;
        }

        /*
          必须在用户点击事件里同步 window.open，
          否则浏览器可能把它当成弹窗拦截。
        */
        const printWindow =
          window.open(
            `print.html?v=${Date.now()}`,
            "_blank"
          );

        if (!printWindow) {
          alert(
            "浏览器阻止了打印窗口，请允许本站弹出窗口后重试。"
          );
          return;
        }
      }
    );
  }
})();
