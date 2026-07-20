(function () {
  "use strict";

  const sourceRoot =
    document.querySelector(
      "#captureSource"
    );

  const printOutput =
    document.querySelector(
      "#printOutput"
    );

  const statusBox =
    document.querySelector(
      "#printStatus"
    );

  const errorBox =
    document.querySelector(
      "#printError"
    );

  const PRINT_STORAGE_PREFIX =
    "resume-print-snapshot:";

  const CANVAS_SCALE = 3;

  const generatedObjectUrls = [];

  const setStatus = (message) => {
    if (statusBox) {
      statusBox.hidden = false;
      statusBox.textContent = message;
    }
  };

  const fail = (message, error) => {
    if (error) {
      console.error(
        message,
        error
      );
    }

    if (sourceRoot) {
      sourceRoot.hidden = true;
    }

    if (printOutput) {
      printOutput.hidden = true;
    }

    if (statusBox) {
      statusBox.hidden = true;
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
      首选：读取主页在点击打印时保存的临时快照。
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
      localStorage 不可用时，使用同源 opener 兜底。
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

  const waitForWindowLoad = () => {
    if (
      document.readyState ===
      "complete"
    ) {
      return Promise.resolve();
    }

    return new Promise(
      (resolve) => {
        window.addEventListener(
          "load",
          resolve,
          { once: true }
        );
      }
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

  const waitForImages = async (
    container
  ) => {
    const images =
      Array.from(
        container.querySelectorAll(
          "img"
        )
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
            typeof image.decode ===
              "function"
          ) {
            try {
              await image.decode();
            } catch (_) {
              // decode 失败不阻断后续处理。
            }
          }
        }
      )
    );
  };

  /*
    主 CDN 如果加载失败，再尝试备用 CDN。
    这样不会因为单个 CDN 异常导致打印完全不可用。
  */
  const ensureHtml2Canvas = async () => {
    if (
      typeof window.html2canvas ===
      "function"
    ) {
      return window.html2canvas;
    }

    const fallbackUrls = [
      "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    ];

    for (
      const url of fallbackUrls
    ) {
      try {
        await new Promise(
          (resolve, reject) => {
            const script =
              document.createElement(
                "script"
              );

            script.src = url;
            script.async = true;

            script.addEventListener(
              "load",
              resolve,
              { once: true }
            );

            script.addEventListener(
              "error",
              () =>
                reject(
                  new Error(
                    `加载失败：${url}`
                  )
                ),
              { once: true }
            );

            document.head.appendChild(
              script
            );
          }
        );

        if (
          typeof window.html2canvas ===
          "function"
        ) {
          return window.html2canvas;
        }
      } catch (error) {
        console.warn(
          "html2canvas 备用地址加载失败：",
          error
        );
      }
    }

    throw new Error(
      "html2canvas 加载失败。请检查网络连接，或将 html2canvas.min.js 改为本地文件。"
    );
  };

  const canvasToBlob = (
    canvas
  ) =>
    new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Canvas 转换图片失败。"
                )
              );
              return;
            }

            resolve(blob);
          },
          "image/png"
        );
      }
    );

  const createPrintableImage = async (
    canvas,
    pageNumber
  ) => {
    const blob =
      await canvasToBlob(
        canvas
      );

    const objectUrl =
      URL.createObjectURL(
        blob
      );

    generatedObjectUrls.push(
      objectUrl
    );

    const page =
      document.createElement(
        "section"
      );

    page.className =
      "print-image-page";

    page.setAttribute(
      "aria-label",
      `简历第${pageNumber}页`
    );

    const image =
      document.createElement(
        "img"
      );

    image.src = objectUrl;
    image.alt =
      `简历第${pageNumber}页`;

    page.appendChild(
      image
    );

    printOutput.appendChild(
      page
    );

    if (
      typeof image.decode ===
      "function"
    ) {
      try {
        await image.decode();
      } catch (_) {
        // decode 失败时，complete/load 仍可继续。
      }
    }

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
  };

  const renderPagesToImages = async () => {
    const html2canvas =
      await ensureHtml2Canvas();

    const pages =
      Array.from(
        sourceRoot.querySelectorAll(
          ".resume-page"
        )
      );

    if (!pages.length) {
      throw new Error(
        "没有找到 .resume-page，无法生成打印页。"
      );
    }

    printOutput.innerHTML = "";

    for (
      let index = 0;
      index < pages.length;
      index += 1
    ) {
      const page = pages[index];

      setStatus(
        `正在生成高清打印页 ${index + 1}/${pages.length}…`
      );

      /*
        scale: 3

        A4 在浏览器中约为 794 × 1123 CSS px。
        3 倍后约为 2380 × 3370 px，
        保存成 PDF 或普通 A4 打印都足够清晰。
      */
      const canvas =
        await html2canvas(
          page,
          {
            scale: CANVAS_SCALE,
            backgroundColor:
              "#ffffff",
            useCORS: true,
            allowTaint: false,
            logging: false,
            imageTimeout: 15000,

            scrollX: 0,
            scrollY: 0,

            width:
              page.offsetWidth,
            height:
              page.offsetHeight,

            windowWidth:
              Math.max(
                document.documentElement
                  .clientWidth,
                page.scrollWidth
              ),
            windowHeight:
              Math.max(
                document.documentElement
                  .clientHeight,
                page.scrollHeight
              )
          }
        );

      await createPrintableImage(
        canvas,
        index + 1
      );

      /*
        释放当前 Canvas 的像素内存引用。
      */
      canvas.width = 1;
      canvas.height = 1;
    }
  };

  const cleanupObjectUrls = () => {
    generatedObjectUrls.forEach(
      (url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {
          // 忽略清理异常。
        }
      }
    );

    generatedObjectUrls.length = 0;
  };

  const start = async () => {
    if (
      !sourceRoot ||
      !printOutput
    ) {
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

    sourceRoot.innerHTML =
      snapshotHtml;

    /*
      PC 长页模式隐藏的“工作经历（续）”，
      在打印源中恢复。
    */
    sourceRoot
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

    try {
      setStatus(
        "正在准备字体和图片…"
      );

      await waitForWindowLoad();

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

      await waitForImages(
        sourceRoot
      );

      void sourceRoot.offsetHeight;
      await waitForPaint();

      await renderPagesToImages();

      /*
        最终打印前，彻底隐藏 DOM 源。
        Chrome 打印预览只会看到两张 A4 图片。
      */
      sourceRoot.hidden = true;
      printOutput.hidden = false;

      if (statusBox) {
        statusBox.hidden = true;
      }

      void printOutput.offsetHeight;
      await waitForPaint();

      /*
        给 Blob 图片和 Chrome 合成器少量稳定时间。
      */
      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            350
          )
      );

      window.focus();
      window.print();
    } catch (error) {
      fail(
        "高清打印页生成失败。请刷新主页后重新点击打印；如果仍失败，请检查浏览器是否能访问 html2canvas CDN。",
        error
      );
    }
  };

  window.addEventListener(
    "afterprint",
    () => {
      cleanupObjectUrls();

      window.setTimeout(
        () => {
          window.close();
        },
        150
      );
    },
    { once: true }
  );

  window.addEventListener(
    "beforeunload",
    cleanupObjectUrls,
    { once: true }
  );

  start();
})();
