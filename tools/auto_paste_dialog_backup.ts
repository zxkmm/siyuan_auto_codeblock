inputDialog = (args: {
  title: string;
  placeholder?: string;
  defaultText?: string;
  confirm?: (text: string) => void;
  cancel?: () => void;
  width?: string;
  height?: string;
}) => {
  const dialog = new Dialog({
    title: args.title,
    content: `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: 300px;" placeholder=${
        args?.placeholder ?? ""
      }>${args?.defaultText ?? ""}</textarea></div>
  </div>
  <div class="b3-dialog__action">
      <button class="b3-button b3-button--cancel">${
        window.siyuan.languages.cancel
      }</button><div class="fn__space"></div>
  </div>`,
    width: args.width ?? "520px",
    height: args.height,
  });
  const target: HTMLTextAreaElement = dialog.element.querySelector(
    ".b3-dialog__content>div.ft__breakword>textarea",
  );
  const btnsElement = dialog.element.querySelectorAll(".b3-button");
  btnsElement[0].addEventListener("click", () => {
    if (args?.cancel) {
      args.cancel();
    }
    dialog.destroy();
  });
  target.addEventListener("paste", () => {
    setTimeout(() => {
      if (args?.confirm) {
        args.confirm(target.value);
      }
      dialog.destroy();
    }, 0);
  });
  for (let i = 0; i < 5; i++) {
    //this is for focus dialog inputbox...
    setTimeout(() => {
      target.focus();
    }, 1);
  }
};
