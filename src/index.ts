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

  detectLanguageAndTransferToMarkdownCodeFormat = (_input_text_: string) => {
    //TODO: paste handler unit test
    console.log(_input_text_);
    ///v edge case handler
    //TODO: check other clipboard content e.g. files and link etc, make suer bypass all of them.
    ///
    ///v edge case 1: if it has md format already and also if it has md format with languagee already. TODO check what for vscode.
    if (_input_text_.startsWith("```") && _input_text_.endsWith("```")) {
      console.log(
        "edge case 1: paste md code block format content, paste as is",
      );
      const firstLineEnd = _input_text_.indexOf("\n");
      const firstLine = _input_text_.substring(0, firstLineEnd).trim();

      if (firstLine === "```") {
        //has md format already BUT no language
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NEVER FORGET!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.log("ent2");
        _input_text_ = _input_text_
          .substring(4, _input_text_.length - 3)
          .trim();
      } else if (firstLine.startsWith("```")) {
        //has md format with languagee already
        console.log("ent3");
        return _input_text_;
      }
    }
    ///^ edge case1: if it has md format already and also if it has md format with languagee already.
    ///

    ///v handle content from siyuan itself //TODO: it seems _input_test_ didn't gave html things, only plain text, but somwhow still not working.
    // if (
    //   _input_text_.startsWith("<p id=") &&
    //   _input_text_.includes("updated=")
    // ) {
    //   console.log("ent222");
    //   const parser = new DOMParser();
    //   const doc = parser.parseFromString(_input_text_, "text/html");
    //   const pElement = doc.querySelector("p");
    //   if (pElement) {
    //     _input_text_ = pElement.textContent
    //       .replace(/&gt;/g, ">")
    //       .replace(/&lt;/g, "<")
    //       .replace(/&quot;/g, '"');
    //   }
    // }
    ///^ handle content from siyuan itself

    ///v edge case2: single line, link, to prevent it reginganze as YAML.
    if (/^https?:\/\/\S+$/.test(_input_text_)) {
      console.log("edge case 2: single line http/https link, paste as is");
      return _input_text_;
    }
    ///^ edge case2

    ///^ edge case handler

    const originalLanguage = this.handleLanguage(_input_text_); //better looking so this is necessary
    const language = this.codeLanguageNameToSiyuanStyle(originalLanguage);

    if (originalLanguage === "Unknown") {
      // showMessage(this.i18n.acb_show_message_language_unknown);
      return _input_text_;
    } else {
      showMessage(
        this.i18n.full_auto_paste_message.replace(
          "^&*^&*@@@^&*^&*^&*",
          originalLanguage,
        ),
      );
      return `\`\`\`${language}
${_input_text_}
\`\`\``;
    }
  };

  handlePasteEvent = (_event_: any) => {
    console.log("paste handler");
    _event_.preventDefault();
    const originalText = _event_.detail.textPlain.trim();
    const processedText =
      this.detectLanguageAndTransferToMarkdownCodeFormat(originalText);
    _event_.detail.resolve({
      textPlain: processedText,
      textHTML: "<!--StartFragment--><!--EndFragment-->", //this is for take care of the situation of SiYuan's pre-process logic for text/html, by @frostime (https://github.com/frostime/sy-f-misc/blob/63b35c92f2e0a7cb451f6f99500f0bc3dbd46c04/src/func/zotero/index.ts#L16), thanks!!!!!
    });
  };

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
    // showMessage(this.isMobile ? "Mobile" : "Desktop");
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
            placeholder: this.isMobile
              ? ""
              : autoMode
                ? this.i18n.acb_window_input_placehoder_automode
                : this.i18n.acb_window_input_placehoder,
            width: this.isMobile ? "95vw" : "70vw",
            height: this.isMobile ? "95vw" : "30vw",
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
    const inputBoxHeight = this.isMobile ? "65vw" : "22vw";
    const dialog = new Dialog({
      title: args.title,
      content: autoMode
        ? `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: ${inputBoxHeight};" placeholder=${
        args?.placeholder ?? ""
      }>${args?.defaultText ?? ""}</textarea></div>
  </div>
  <div class="b3-dialog__action">
      <button class="b3-button b3-button--cancel">${
        window.siyuan.languages.cancel
      }</button><div class="fn__space"></div>
  </div>`
        : `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: ${inputBoxHeight};" placeholder=${
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
      plugin: this,
      name: STORAGE_NAME,
    });

    this.settingUtils.addItem({
      key: "autoMode",
      value: true,
      type: "checkbox",
      title: this.i18n.autoMode,
      description: this.i18n.autoModeDesc,
    });

    this.settingUtils.addItem({
      key: "pasteAutoMode",
      value: true,
      type: "checkbox",
      title: this.i18n.pasteAutoMode,
      description: this.i18n.pasteAutoModeDesc,
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
    if (this.settingUtils.get("pasteAutoMode")) {
      this.eventBus.on("paste", this.handlePasteEvent);
    }
    // this.loadData(STORAGE_NAME);
    this.settingUtils.load();
    // console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  async onunload() {}

  uninstall() {}
}
