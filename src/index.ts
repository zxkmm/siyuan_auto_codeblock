import {
  Plugin,
  showMessage,
  Dialog,
  adaptHotkey,
  getFrontend,
  getBackend,
  IModel,
  Protyle,
} from "siyuan";
import "@/index.scss";

import { SettingUtils } from "./libs/setting-utils";

import flourite from "flourite";

const STORAGE_NAME = "menu-config";

// console.log(flourite(lang_test_string));
// var language = flourite(lang_test_string).language;

export default class SiyuanAutoCodeblock extends Plugin {
  customTab: () => IModel;
  private isMobile: boolean;
  private settingUtils: SettingUtils;

  handleLanguage(_code_content_: string) {
    return flourite(_code_content_).language;
  }

  codeLanguageNameToSiyuanStyle(_language_label_: string) {
    if (_language_label_ === "C++") {
      return "cpp";
    } else {
      return _language_label_.toLowerCase();
    }
  }

  fetchShortkeyForRefresh() {
    // const siyuan_settings = window.siyuan;
    // console.log(window.siyuan.config.keymap.editor.general.refresh.custom);
    return window.siyuan.config.keymap.editor.general.refresh.cusom;
  }

  handleSlashEvent() {
    var autoMode = this.settingUtils.get("autoMode");
    this.protyleSlash = [
      {
        filter: ["acb", "autocodeblock"],
        html: this.i18n.acb_html,
        id: "autoCodeBlock",
        callback: (protyle: Protyle) => {
          this.inputDialog({
            title: autoMode
              ? this.i18n.acb_window_title_automode
              : this.i18n.acb_window_title,
            placeholder: autoMode
              ? this.i18n.acb_window_input_placehoder_automode
              : this.i18n.acb_window_input_placehoder,
            width: "50vw",
            height: "50vh",
            confirm: (text: string) => {
              const language = this.handleLanguage(text);
              if (language === "Unknown") {
                showMessage(this.i18n.acb_show_message_language_unknown);
              } else {
                showMessage(this.i18n.acb_show_message_prefix + language);
              }
              const siyuanLanguage =
                this.codeLanguageNameToSiyuanStyle(language);

              // const codeBlockHtml = `<div data-node-id="${Date.now()}" data-node-index="1" data-type="NodeCodeBlock" class="code-block" updated="${Date.now()}"><div class="protyle-action"><span class="protyle-action--first protyle-action__language" contenteditable="false">${siyuanLanguage}</span><span class="fn__flex-1"></span><span class="b3-tooltips__nw b3-tooltips protyle-icon protyle-icon--first protyle-action__copy" aria-label="Copy"><svg><use xlink:href="#iconCopy"></use></svg></span><span class="b3-tooltips__nw b3-tooltips protyle-icon protyle-icon--last protyle-action__menu" aria-label="More"><svg><use xlink:href="#iconMore"></use></svg></span></div><div class="hljs" data-render="true"><div class="fn__none"></div><div contenteditable="true" style="flex: 1 1 0%; white-space: pre; word-break: initial; font-variant-ligatures: none;" spellcheck="false">${text}</div></div><div class="protyle-attr" contenteditable="false">​</div></div>`;
              let md =
                language === "Unknown"
                  ? `\`\`\`
${text}
\`\`\``
                  : `\`\`\`${siyuanLanguage}
${text}
\`\`\``;
              let md1 = md;
              // idk why but this (use let instead of const, and pass the var to another var) is the only way to make var reference works...
              protyle.insert(md1, true, true);
              protyle.reload(true);
              setTimeout(() => protyle.reload(false), 500);
            },
          });
        },
      },
    ];
  }

  inputDialog = (args: {
    title: string;
    placeholder?: string;
    defaultText?: string;
    confirm?: (text: string) => void;
    cancel?: () => void;
    width?: string;
    height?: string;
  }) => {
    const autoMode = this.settingUtils.get("autoMode");
    const dialog = new Dialog({
      title: args.title,
      content: autoMode
        ? `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: 300px;" placeholder=${
        args?.placeholder ?? ""
      }>${args?.defaultText ?? ""}</textarea></div>
  </div>
  <div class="b3-dialog__action">
      <button class="b3-button b3-button--cancel">${
        window.siyuan.languages.cancel
      }</button><div class="fn__space"></div>
  </div>`
        : `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: 300px;" placeholder=${
        args?.placeholder ?? ""
      }>${args?.defaultText ?? ""}</textarea></div>
  </div>
  <div class="b3-dialog__action">
      <button class="b3-button b3-button--cancel">${
        window.siyuan.languages.cancel
      }</button><div class="fn__space"></div>
      <button class="b3-button b3-button--text" id="confirmDialogConfirmBtn">${
        window.siyuan.languages.confirm
      }</button>
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

    if (!autoMode) {
      btnsElement[1].addEventListener("click", () => {
        if (args?.confirm) {
          args.confirm(target.value);
        }
        dialog.destroy();
      });
    } else if (autoMode) {
      target.addEventListener("paste", () => {
        setTimeout(() => {
          if (args?.confirm) {
            args.confirm(target.value);
          }
          dialog.destroy();
        }, 0);
      });
    }

    for (let i = 0; i < 5; i++) {
      //this is for focus dialog inputbox...
      setTimeout(() => {
        target.focus();
      }, 1);
    }
  };

  async onload() {
    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    this.settingUtils = new SettingUtils({
      //TODO: settings
      plugin: this,
      name: STORAGE_NAME,
    });

    this.settingUtils.addItem({
      key: "autoMode",
      value: false,
      type: "checkbox",
      title: this.i18n.autoMode,
      description: this.i18n.autoModeDesc,
    });

    this.settingUtils.addItem({
      key: "Hint",
      value: "",
      type: "hint",
      title: this.i18n.hintTitle,
      description: this.i18n.hintDesc,
    });

    try {
      this.settingUtils.load();
    } catch (error) {
      console.error(
        "Error loading settings storage, probably empty config json:",
        error,
      );
    }
  }

  onLayoutReady() {
    this.handleSlashEvent();
    // this.loadData(STORAGE_NAME);
    this.settingUtils.load();
    // console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  async onunload() {}

  uninstall() {}
}
