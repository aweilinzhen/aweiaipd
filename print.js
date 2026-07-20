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

  const fail = (message) => {
    if (root) {
      root.hidden = true;
    }

    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = message;
    }
  };

  /*
    print.html 与主页面同源，
    因此可以安全读取 opener 中已经渲染好的 #resume。

    这样打印内容永远和屏幕当前看到的简历一致，
    不需要再复制一套 RESUME_DATA 渲染逻辑。
  */
  const sourceResume =
    window.opener
      ?.document
      ?.querySelector(
        "#resume"
      );

  if (!sourceResume) {
    fail(
      "无法读取简历内容。请关闭此页面，回到简历主页后重新点击“打印 / 保存 PDF”。"
    );
    return;
  }

  root.innerHTML =
    sourceResume.innerHTML;

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

  const waitForImages = async () => {
    const images =
      Array.from(
        document.images
      );

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
            } catch (_) {
              // 图片已可用时，decode 失败不阻断打印。
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

  const startPrint = async () => {
    try {
      if (
        document.fonts
        &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

      await waitForImages();

      /*
        强制浏览器完成一次布局，
        再等待两帧绘制。
      */
      void document.body.offsetHeight;
      await waitForPaint();

      /*
        给 Chrome 少量稳定时间，
        避免打印预览抓到尚未完成文字绘制的帧。
      */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            180
          )
      );

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
      /*
        打印窗口关闭后自动关闭本打印页。
        若浏览器不允许自动关闭，用户可手动关闭。
      */
      setTimeout(
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
