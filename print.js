(function () {
  "use strict";

  const root =
    document.querySelector(
      "#printResume"
    );

  const errorBox =
    document.querySelector(
      "#printError"
    );

  const PRINT_STORAGE_PREFIX =
    "resume-print-snapshot:";

  const fail = (message) => {
    if (root) {
      root.hidden = true;
    }

    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = message;
    }
  };

  const getSnapshotHtml = () => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get("token");

    /*
      首选：读取主页面在打开打印页前写入的临时快照。
      读取后立即删除，避免简历 HTML 长期留在 localStorage。
    */
    if (token) {
      const storageKey =
        `${PRINT_STORAGE_PREFIX}${token}`;

      try {
        const raw =
          localStorage.getItem(
            storageKey
          );

        if (raw) {
          localStorage.removeItem(
            storageKey
          );

          const payload =
            JSON.parse(raw);

          if (
            payload &&
            typeof payload.html === "string" &&
            payload.html.trim()
          ) {
            return payload.html;
          }
        }
      } catch (error) {
        console.warn(
          "读取打印快照失败，将尝试 opener 兜底：",
          error
        );
      }
    }

    /*
      兜底：同源情况下仍可从 opener 读取当前已渲染 DOM。
      这保证 localStorage 被禁用时还有一次恢复机会。
    */
    try {
      const sourceResume =
        window.opener
          ?.document
          ?.querySelector(
            "#resume"
          );

      if (sourceResume) {
        return sourceResume.innerHTML;
      }
    } catch (error) {
      console.warn(
        "无法从 opener 读取简历：",
        error
      );
    }

    return "";
  };

  if (!root) {
    return;
  }

  const snapshotHtml =
    getSnapshotHtml();

  if (!snapshotHtml) {
    fail(
      "无法读取简历内容。请关闭此页面，回到简历主页后重新点击“打印 / 保存 PDF”。"
    );
    return;
  }

  root.innerHTML =
    snapshotHtml;

  /*
    PC 连续长页模式下隐藏的“工作经历（续）”
    在打印页恢复显示。
  */
  root
    .querySelectorAll(
      ".screen-only-hidden-title"
    )
    .forEach(
      (element) => {
        element.classList.remove(
          "screen-only-hidden-title"
        );
      }
    );

  const waitForWindowLoad = () => {
    if (document.readyState === "complete") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener(
        "load",
        resolve,
        { once: true }
      );
    });
  };

  const waitForImages = async () => {
    const images =
      Array.from(
        root.querySelectorAll("img")
      );

    await Promise.all(
      images.map(
        async (image) => {
          if (!image.complete) {
            await new Promise(
              (resolve) => {
                const done = () =>
                  resolve();

                image.addEventListener(
                  "load",
                  done,
                  { once: true }
                );

                image.addEventListener(
                  "error",
                  done,
                  { once: true }
                );
              }
            );
          }

          if (
            image.complete &&
            image.naturalWidth > 0 &&
            typeof image.decode === "function"
          ) {
            try {
              await image.decode();
            } catch (_) {
              // decode 失败不阻断打印。
            }
          }
        }
      )
    );
  };

  const waitForPaint = () =>
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

  const checkPageOverflow = () => {
    const pages =
      Array.from(
        root.querySelectorAll(
          ".resume-page"
        )
      );

    const overflowPages =
      pages
        .map((page, index) => ({
          page: index + 1,
          overflow:
            page.scrollHeight -
            page.clientHeight
        }))
        .filter(
          (item) =>
            item.overflow > 2
        );

    if (overflowPages.length) {
      console.warn(
        "检测到打印页内容可能溢出：",
        overflowPages
      );
    }
  };

  const verifyPrintableText = () => {
    const sample =
      root.querySelector(
        "h1, .section-title, .entry-heading h3, .bullet-list li"
      );

    if (!sample) {
      return;
    }

    const style =
      window.getComputedStyle(sample);

    console.info(
      "打印文字检查：",
      {
        text: sample.textContent?.trim().slice(0, 30),
        color: style.color,
        visibility: style.visibility,
        opacity: style.opacity
      }
    );
  };

  const startPrint = async () => {
    try {
      await waitForWindowLoad();
      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

      await waitForImages();

      void document.body.offsetHeight;
      await waitForPaint();

      checkPageOverflow();
      verifyPrintableText();

      /*
        新窗口中的 DOM 是运行时写入的。
        Chrome 的打印合成器偶尔会比屏幕绘制更早抓取页面，
        因此在字体、图片和两帧绘制完成后再额外等待一小段稳定时间。
      */
      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            900
          )
      );

      void root.offsetHeight;
      await waitForPaint();

      window.focus();
      window.print();
    } catch (error) {
      console.error(
        "打印准备失败：",
        error
      );

      fail(
        "打印准备失败，请关闭此页面后重试。"
      );
    }
  };

  window.addEventListener(
    "afterprint",
    () => {
      window.setTimeout(
        () => {
          window.close();
        },
        150
      );
    },
    { once: true }
  );

  startPrint();
})();
