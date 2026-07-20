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
        3
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
        3
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
          "代表项目",

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

     稳定链路：

     点击按钮
     ↓
     将当前已经渲染好的 #resume 克隆并写入 localStorage
     ↓
     打开 print.html?token=...
     ↓
     print.js 根据 token 读取打印快照
     ↓
     print.html 将两页 DOM 渲染成高清 Canvas 图片
     ↓
     Chrome / Safari 只打印两张 A4 图片
     ↓
     window.print()

     为什么不只依赖 window.opener：
     - 某些浏览器/安全策略会隔离 opener
     - 打印页刷新后 opener 可能不可用
     - localStorage 同源共享，更稳定

     print.js 仍保留 opener 作为兜底。
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

  const PRINT_STORAGE_PREFIX =
    "resume-print-snapshot:";

  const createPrintSnapshot = () => {
    const clonedResume =
      resume.cloneNode(true);

    /*
      把图片地址转换为绝对地址。
      即使以后 print.html 移动目录，头像也不会因为相对路径失效。
    */
    clonedResume
      .querySelectorAll("img[src]")
      .forEach((image) => {
        try {
          image.src = new URL(
            image.getAttribute("src"),
            window.location.href
          ).href;
        } catch (error) {
          console.warn(
            "图片地址转换失败：",
            image.getAttribute("src"),
            error
          );
        }
      });

    return clonedResume.innerHTML;
  };

  printButton.addEventListener(
    "click",
    () => {
      if (printButton.disabled) {
        return;
      }

      printButton.disabled = true;

      const token = [
        Date.now().toString(36),
        Math.random()
          .toString(36)
          .slice(2, 10)
      ].join("-");

      const storageKey =
        `${PRINT_STORAGE_PREFIX}${token}`;

      const payload = {
        html: createPrintSnapshot(),
        title: document.title,
        createdAt: Date.now()
      };

      let snapshotStored = false;

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(payload)
        );
        snapshotStored = true;
      } catch (error) {
        /*
          本地存储不可用时不直接失败。
          print.js 仍会尝试通过同源 window.opener 读取当前简历。
        */
        console.warn(
          "无法写入打印快照，将使用 opener 兜底：",
          error
        );
      }

      /*
        必须仍然在用户 click 事件的同步调用链里执行 window.open，
        避免被浏览器当作广告弹窗拦截。
      */
      const printWindow =
        window.open(
          `print.html?token=${encodeURIComponent(token)}&v=${Date.now()}`,
          "_blank"
        );

      if (!printWindow) {
        if (snapshotStored) {
          localStorage.removeItem(
            storageKey
          );
        }

        printButton.disabled = false;

        alert(
          "浏览器阻止了打印窗口。\n\n" +
          "请允许当前网站打开弹出窗口，然后重新点击“打印 / 保存 PDF”。"
        );
        return;
      }

      try {
        printWindow.focus();
      } catch (error) {
        console.warn(
          "无法自动聚焦打印窗口：",
          error
        );
      }

      /*
        正常情况下 print.js 读取后会立即删除。
        这里再做一次延迟清理，防止用户在打印页加载前就关闭窗口，
        导致临时简历快照残留在 localStorage。
      */
      if (snapshotStored) {
        window.setTimeout(
          () => {
            localStorage.removeItem(
              storageKey
            );
          },
          60 * 1000
        );
      }

      /*
        只做短暂防抖，不等待打印页完成。
        打印页会自行读取并删除快照。
      */
      window.setTimeout(
        () => {
          printButton.disabled = false;
        },
        800
      );
    }
  );

})();
