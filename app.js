(function () {
  "use strict";

  /* =========================================================
     读取简历数据
  ========================================================= */

  const data = window.RESUME_DATA;

  if (!data) {
    console.error(
      "未找到 window.RESUME_DATA，请检查 resume-data.js 是否正确加载。"
    );
    return;
  }


  /* =========================================================
     HTML 转义
  ========================================================= */

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");


  /* =========================================================
     列表
  ========================================================= */

  const bulletList = (items = []) => `
    <ul class="bullet-list">
      ${
        items
          .map(
            (item) =>
              `<li>${esc(item)}</li>`
          )
          .join("")
      }
    </ul>
  `;


  /* =========================================================
     通用经历条目
  ========================================================= */

  const entry = (
    {
      title,
      period,
      subtitle,
      bullets
    },
    className = "entry"
  ) => `
    <article class="${className}">

      <div class="entry-heading">

        <h3>
          ${esc(title)}
        </h3>

        <time>
          ${esc(period)}
        </time>

      </div>

      ${
        subtitle
          ? `
            <p class="entry-subtitle">
              ${esc(subtitle)}
            </p>
          `
          : ""
      }

      ${
        bulletList(
          bullets
        )
      }

    </article>
  `;


  /* =========================================================
     通用模块
  ========================================================= */

  const section = (
    title,
    content,
    className = ""
  ) => `
    <section class="resume-section ${className}">

      <h2 class="section-title">
        ${esc(title)}
      </h2>

      ${content}

    </section>
  `;


  /* =========================================================
     AI 项目经历
  ========================================================= */

  const aiProjectHtml = entry(
    {
      title:
        data.aiProject.name,

      period:
        data.aiProject.period,

      subtitle:
        data.aiProject.subtitle,

      bullets:
        data.aiProject.bullets
    },
    "entry ai-project-entry"
  );


  /* =========================================================
     工作经历分页

     第 1 页：
     - 个人总结
     - AI 项目经历
     - 有信云
     - 豌豆思维

     第 2 页：
     - 滴普科技
     - 道一云
     - 项目经历
     - 教育经历

     PC 页面视觉上仍然是一张连续长页。
  ========================================================= */

  const firstPageExperienceHtml =
    data.experience
      .slice(
        0,
        2
      )
      .map(
        (item) =>
          entry(
            {
              title:
                item.company,

              period:
                item.period,

              subtitle:
                item.subtitle,

              bullets:
                item.bullets
            },
            "entry experience-entry"
          )
      )
      .join("");


  const secondPageExperienceHtml =
    data.experience
      .slice(
        2
      )
      .map(
        (item) =>
          entry(
            {
              title:
                item.company,

              period:
                item.period,

              subtitle:
                item.subtitle,

              bullets:
                item.bullets
            },
            "entry experience-entry"
          )
      )
      .join("");


  /* =========================================================
     项目经历
  ========================================================= */

  const projectsHtml =
    data.projects
      .map(
        (item) =>
          entry(
            {
              title:
                item.name,

              period:
                item.period,

              subtitle:
                item.subtitle,

              bullets:
                item.bullets
            },
            "entry project-entry"
          )
      )
      .join("");


  /* =========================================================
     教育经历
  ========================================================= */

  const educationHtml =
    data.education
      .map(
        (item) =>
          entry(
            {
              title:
                `${item.school} ｜ ${item.degree}`,

              period:
                item.period,

              subtitle:
                "",

              bullets:
                item.bullets
            },
            "entry education-entry"
          )
      )
      .join("");


  /* =========================================================
     获取页面容器
  ========================================================= */

  const resume =
    document.querySelector(
      "#resume"
    );

  if (!resume) {
    console.error(
      "未找到 #resume 容器。"
    );
    return;
  }


  /* =========================================================
     渲染简历
  ========================================================= */

  resume.innerHTML = `

    <!-- =====================================================
         第 1 页
    ====================================================== -->

    <section
      class="resume-page page-one"
      aria-label="简历第1页"
    >

      <!-- 顶部个人信息 -->

      <header class="profile-header">

        <div class="profile-main">

          <h1>
            ${
              esc(
                data.profile.name
              )
            }
          </h1>


          <!-- 联系方式 -->

          <p class="contact-line">

            <span>
              ${
                esc(
                  data.profile.phone
                )
              }
            </span>

            <span>
              ${
                esc(
                  data.profile.email
                )
              }
            </span>

          </p>


          <!-- 求职方向 -->

          <p class="status-line">

            <span>
              ${
                esc(
                  data.profile.targetRole
                )
              }
            </span>

          </p>

        </div>


        <!-- 头像 -->

        <img
          class="profile-photo"
          src="${
            esc(
              data.profile.avatar
            )
          }"
          alt="个人证件照"
        />

      </header>


      <!-- 个人总结 -->

      ${
        section(
          "个人总结",

          bulletList(
            data.summary
          )
        )
      }


      <!-- AI 项目经历 -->

      ${
        section(
          "AI 项目经历",

          aiProjectHtml,

          "ai-project-section"
        )
      }


      <!-- 工作经历：前两家公司 -->

      ${
        section(
          "工作经历",

          firstPageExperienceHtml
        )
      }

    </section>


    <!-- =====================================================
         第 2 页
    ====================================================== -->

    <section
      class="resume-page page-two"
      aria-label="简历第2页"
    >

      <!-- 工作经历：后两家公司 -->

      ${
        section(
          "工作经历（续）",

          secondPageExperienceHtml,

          "continuation-section"
        )
      }


      <!-- 项目经历 -->

      ${
        section(
          "项目经历",

          projectsHtml
        )
      }


      <!-- 教育经历 -->

      ${
        section(
          "教育经历",

          educationHtml
        )
      }

    </section>

  `;


  /* =========================================================
     PC 连续长页模式

     PC 浏览时隐藏：
     “工作经历（续）”

     这样页面看起来仍然是：

     工作经历
     有信云
     豌豆思维
     滴普科技
     道一云

     而不是两个工作经历模块。

     打印时 print.js / print.css 会恢复标题。
  ========================================================= */

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
     打印功能

     正确链路：

     点击按钮
     ↓
     打开 print.html
     ↓
     print.js 从当前主页读取 #resume
     ↓
     复制当前已经渲染好的简历
     ↓
     print.css 负责两页 A4
     ↓
     window.print()

     不再：
     - 直接打印当前 PC 长页
     - 创建隐藏 iframe
  ========================================================= */

  const printButton =
    document.querySelector(
      "#printButton"
    );


  if (!printButton) {
    console.warn(
      "未找到 #printButton，打印按钮无法绑定。"
    );
    return;
  }


  printButton.addEventListener(
    "click",

    () => {

      /*
        防止用户快速连续点击。
      */

      if (
        printButton.disabled
      ) {
        return;
      }


      /*
        这里必须直接在用户 click 事件中调用 window.open。

        不要先 await、setTimeout 或异步处理，
        否则 Chrome / Safari 可能认为这是广告弹窗，
        从而阻止 print.html 打开。
      */

      const printWindow =
        window.open(
          `print.html?v=${Date.now()}`,
          "_blank"
        );


      /*
        如果返回 null，
        说明浏览器拦截了弹窗。
      */

      if (!printWindow) {

        alert(
          "浏览器阻止了打印窗口。\n\n" +
          "请允许 aweilinzhen.github.io 的弹出窗口，" +
          "然后重新点击“打印 / 保存 PDF”。"
        );

        return;
      }


      /*
        让新打开的打印页获得焦点。
      */

      try {

        printWindow.focus();

      } catch (error) {

        console.warn(
          "无法自动聚焦打印窗口：",
          error
        );

      }

    }
  );

})();
