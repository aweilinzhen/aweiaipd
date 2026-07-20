(function () {

  /* =========================================================
     获取简历数据
  ========================================================= */

  const data =
    window.RESUME_DATA;

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
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );


  /* =========================================================
     通用列表
  ========================================================= */

  const bulletList = (
    items = []
  ) => `
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
    content
  ) => `

    <section class="resume-section">

      <h2 class="section-title">
        ${esc(title)}
      </h2>

      ${content}

    </section>

  `;


  /* =========================================================
     工作经历
  ========================================================= */

  const experienceHtml =

    data.experience
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
     生成简历页面
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


  resume.innerHTML = `

    <!-- ==================================
         第 1 页
    =================================== -->

    <section
      class="resume-page page-one"
      aria-label="简历第1页"
    >

      <header class="profile-header">

        <div class="profile-main">

          <h1>
            ${
              esc(
                data.profile.name
              )
            }
          </h1>


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


          <p class="status-line">

            <span>
              ${
                esc(
                  data.profile.status
                )
              }
            </span>

            <span>
              ${
                esc(
                  data.profile.targetRole
                )
              }
            </span>

          </p>

        </div>


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


      ${
        section(

          "个人总结",

          bulletList(
            data.summary
          )

        )
      }


      ${
        section(

          "工作经历",

          experienceHtml

        )
      }

    </section>


    <!-- ==================================
         第 2 页
    =================================== -->

    <section
      class="resume-page page-two"
      aria-label="简历第2页"
    >

      ${
        section(

          "项目经历",

          projectsHtml

        )
      }


      ${
        section(

          "教育经历",

          educationHtml

        )
      }

    </section>

  `;


  /* =========================================================
     PC 操作按钮
     下载 + 打印
  ========================================================= */

  let pageActions =
    document.querySelector(
      ".page-actions"
    );


  /*
    index.html 没有 page-actions 时，
    自动创建。

    这样不用强制修改 index.html。
  */

  if (!pageActions) {

    pageActions =
      document.createElement(
        "div"
      );

    pageActions.className =
      "page-actions";

    pageActions.setAttribute(
      "aria-label",
      "简历操作"
    );

    document.body.appendChild(
      pageActions
    );

  }


  /*
    下载按钮
  */

  let downloadButton =
    document.querySelector(
      "#downloadButton"
    );


  if (!downloadButton) {

    downloadButton =
      document.createElement(
        "a"
      );

    downloadButton.id =
      "downloadButton";

    downloadButton.href =
      "resume.pdf";

    downloadButton.download =
      "林镇伟-AI产品经理简历.pdf";

    downloadButton.textContent =
      "下载";

    downloadButton.setAttribute(
      "aria-label",
      "下载简历PDF"
    );

    pageActions.prepend(
      downloadButton
    );

  }


  downloadButton.classList.add(
    "action-button",
    "download-button"
  );


  /*
    打印按钮
  */

  let printButton =
    document.querySelector(
      "#printButton"
    );


  if (!printButton) {

    printButton =
      document.createElement(
        "button"
      );

    printButton.id =
      "printButton";

    printButton.type =
      "button";

    printButton.textContent =
      "打印";

    printButton.setAttribute(
      "aria-label",
      "打印简历"
    );

    pageActions.appendChild(
      printButton
    );

  }


  printButton.classList.add(
    "action-button",
    "print-button"
  );


  /*
    如果 index.html 原本存在旧按钮，
    确保最终顺序始终为：

    下载 ｜ 打印
  */

  pageActions.appendChild(
    downloadButton
  );

  pageActions.appendChild(
    printButton
  );


  /* =========================================================
     打印准备
  ========================================================= */

  /*
    等待两帧浏览器绘制。
  */

  const nextPaint = () =>

    new Promise(
      (resolve) => {

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              resolve
            );

          }
        );

      }
    );


  /*
    打印前等待：

    1. 所有图片加载
    2. 图片完成解码
    3. 字体加载
    4. DOM 布局计算
    5. 浏览器完成绘制

    解决 Chrome 打印预览中：

    - 头像正常
    - 横线正常
    - 列表圆点正常
    - 正文文字消失

    的问题。
  */

  async function waitForPrintReady() {

    /* =========================
       等待图片
    ========================= */

    const images =
      Array.from(
        document.images
      );


    await Promise.all(

      images.map(

        async (
          image
        ) => {

          if (
            !image.complete
          ) {

            await new Promise(

              (
                resolve
              ) => {

                image.addEventListener(
                  "load",
                  resolve,
                  {
                    once: true
                  }
                );


                image.addEventListener(
                  "error",
                  resolve,
                  {
                    once: true
                  }
                );

              }

            );

          }


          /*
            图片虽然 complete，
            也可能尚未真正完成解码。

            decode() 可以让打印更稳定。
          */

          if (
            typeof image.decode
            === "function"
          ) {

            try {

              await image.decode();

            } catch (
              error
            ) {

              /*
                缓存图片或部分浏览器中
                decode() 可能报错。

                不影响后续打印。
              */

            }

          }

        }

      )

    );


    /* =========================
       等待字体
    ========================= */

    if (
      document.fonts
      &&
      document.fonts.ready
    ) {

      try {

        await document.fonts.ready;

      } catch (
        error
      ) {

        /*
          字体加载失败时，
          浏览器会自动回退系统字体。
        */

      }

    }


    /* =========================
       强制计算一次布局
    ========================= */

    void document.body.offsetHeight;


    /* =========================
       等待两帧完整绘制
    ========================= */

    await nextPaint();


    /*
      再留一点稳定时间。

      避免 Chrome 在刚刚完成
      DOM + 字体更新时马上抓取打印快照。
    */

    await new Promise(

      (
        resolve
      ) =>

        setTimeout(
          resolve,
          150
        )

    );

  }


  /* =========================================================
     点击打印
  ========================================================= */

  printButton.addEventListener(

    "click",

    async () => {

      /*
        防止重复点击。
      */

      printButton.disabled =
        true;


      try {

        /*
          等待所有资源准备完成。
        */

        await waitForPrintReady();


        /*
          打开浏览器打印窗口。
        */

        window.print();

      } catch (
        error
      ) {

        console.error(
          "打印准备失败：",
          error
        );


        /*
          即使准备流程出错，
          仍然允许用户打开打印窗口。
        */

        window.print();

      } finally {

        printButton.disabled =
          false;

      }

    }

  );


  /* =========================================================
     打印窗口关闭
  ========================================================= */

  window.addEventListener(

    "afterprint",

    () => {

      printButton.disabled =
        false;

    }

  );

})();
