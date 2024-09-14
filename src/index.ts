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

// import hljs from "highlight.js";

const STORAGE_NAME = "menu-config";

// console.log(flourite(lang_test_string));
// var language = flourite(lang_test_string).language;

export default class SiyuanAutoCodeblock extends Plugin {
  customTab: () => IModel;
  private isMobile: boolean;
  private settingUtils: SettingUtils;

  convertStringToArray(userInput) {
    if (userInput) {
      var inputArray = userInput.split(/[,，]/);
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i] = inputArray[i].trim();
      }
      return inputArray;
    } else {
      // 处理 undefined
      return [];
    }
  }

  // test() {
  //   const example_code = `void config_mode_blink_until_dfu();

  //   void config_mode_set() {
  //       uint32_t cms = portapack::persistent_memory::config_mode_storage_direct();
  //       if ((cms >= CONFIG_MODE_GUARD_VALUE) && (cms < CONFIG_MODE_LIMIT_VALUE))
  //           cms += 1;
  //       else
  //           cms = CONFIG_MODE_GUARD_VALUE;
  //       portapack::persistent_memory::set_config_mode_storage_direct(cms);
  //   }
    
  //   bool config_mode_should_enter() {
  //       if (portapack::persistent_memory::config_disable_config_mode_direct())
  //           return false;
  //       else
  //           return portapack::persistent_memory::config_mode_storage_direct() == CONFIG_MODE_LIMIT_VALUE;
  //   }
    
  //   void config_mode_clear() {
  //       portapack::persistent_memory::set_config_mode_storage_direct(CONFIG_MODE_NORMAL_VALUE);
  //   }
    
  //   uint32_t blink_patterns[] = {
  //       0x00000000,  // 0 Off
  //       0xFFFFFFFF,  // 1 On
  //       0xF0F0F0F0,  // 2 blink fast
  //       0x00FF00FF,  // 3 blink slow
  //       0xFFF3FFF3   // 4 inverse blink slow
  //   };
    
  //   void config_mode_run() {
  //       configure_pins_portapack();
  //       portapack::gpio_dfu.input();
  //       portapack::persistent_memory::cache::init();
    
  //       if (hackrf_r9) {
  //           // When this runs on the hackrf r9 there likely was a crash during the last boot
  //           // caused by the external tcxo. So we disable it unless the user is intentially
  //           // running the config mode by pressing reset twice followed by pressing DFU.
  //           auto old_disable_external_tcxo = portapack::persistent_memory::config_disable_external_tcxo();
  //           portapack::persistent_memory::set_config_disable_external_tcxo(true);
  //           portapack::persistent_memory::cache::persist();
    
  //           config_mode_blink_until_dfu();
    
  //           portapack::persistent_memory::set_config_disable_external_tcxo(old_disable_external_tcxo);
  //           portapack::persistent_memory::cache::persist();
  //       } else {
  //           config_mode_blink_until_dfu();
  //       }
    
  //       auto last_dfu_btn = portapack::gpio_dfu.read();
    
  //       int32_t counter = 0;
  //       int8_t blink_pattern_value = portapack::persistent_memory::config_cpld() +
  //                                    (portapack::persistent_memory::config_disable_external_tcxo() ? 5 : 0);
    
  //       while (true) {
  //           auto dfu_btn = portapack::gpio_dfu.read();
  //           auto dfu_clicked = last_dfu_btn == true && dfu_btn == false;
  //           last_dfu_btn = dfu_btn;
    
  //           if (dfu_clicked) {
  //               int8_t value = portapack::persistent_memory::config_cpld() +
  //                              (portapack::persistent_memory::config_disable_external_tcxo() ? 5 : 0);
    
  //               blink_pattern_value = value = (value + 1) % 10;
    
  //               portapack::persistent_memory::set_config_cpld(value % 5);
  //               portapack::persistent_memory::set_config_disable_external_tcxo((value / 5) == 1);
    
  //               portapack::persistent_memory::cache::persist();
  //           }
    
  //           auto tx_blink_pattern = blink_patterns[blink_pattern_value % 5];
  //           auto rx_blink_pattern = blink_patterns[blink_pattern_value / 5];
    
  //           auto tx_value = ((tx_blink_pattern >> ((counter >> 0) & 31)) & 0x1) == 0x1;
  //           if (tx_value) {
  //               hackrf::one::led_tx.on();
  //           } else {
  //               hackrf::one::led_tx.off();
  //           }
    
  //           auto rx_value = ((rx_blink_pattern >> ((counter >> 0) & 31)) & 0x1) == 0x1;
  //           if (rx_value) {
  //               hackrf::one::led_rx.on();
  //           } else {
  //               hackrf::one::led_rx.off();
  //           }
    
  //           chThdSleepMilliseconds(100);
  //           counter++;
  //       }
  //   }
    
  //   void config_mode_blink_until_dfu() {
  //       while (true) {
  //           hackrf::one::led_tx.on();
  //           hackrf::one::led_rx.on();
  //           hackrf::one::led_usb.on();
  //           chThdSleepMilliseconds(10);
    
  //           hackrf::one::led_tx.off();
  //           hackrf::one::led_rx.off();
  //           hackrf::one::led_usb.off();
  //           chThdSleepMilliseconds(115);
    
  //           auto dfu_btn = portapack::gpio_dfu.read();
  //           if (dfu_btn)
  //               break;
  //       }
    
  //       while (true) {
  //           chThdSleepMilliseconds(10);
    
  //           auto dfu_btn = portapack::gpio_dfu.read();
  //           if (!dfu_btn)
  //               break;
  //       }
    
  //       chThdSleepMilliseconds(10);
  //   }`;

  // }

  detectLanguageAndTransferToMarkdownCodeFormat = (_input_text_: string) => {
    //TODO: paste handler unit test
    console.log(_input_text_);
    ///v edge case handler
    //TODO: check other clipboard content e.g. files and link etc, make suer bypass all of them.
    ///
    ///v edge case 1: if it has md format already and also if it has md format with languagee already. TODO check what for vscode.
    if (_input_text_.startsWith("```") && _input_text_.endsWith("```")) {
      console.log(
        "edge case 1: paste md code block format content, paste as is"
      );
      const firstLineEnd = _input_text_.indexOf("\n");
      const firstLine = _input_text_.substring(0, firstLineEnd).trim();

      if (firstLine === "```") {
        //has md format already BUT no language
        //WARNING!!!!!!! arg changed in this cond!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NEVER FORGET!
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

    ///v edge case4: something like this: ![Screenshot_20240902_123819](assets/Screenshot_20240902_123819-20240912184853-j4wf3ve.png) should paste as is.
    if (
      _input_text_.startsWith("![") &&
      _input_text_.includes("](assets/") &&
      _input_text_.endsWith(")") &&
      !_input_text_.includes("\n")
    ) {
      console.log("edge case4: image link");
      return _input_text_;
    }

    ///^ edge case4

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
          originalLanguage
        )
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
    const languageBlacklistArr = this.convertStringToArray(this.settingUtils.get("languageBlacklist"));
    const languageSkiplistArr = this.convertStringToArray(this.settingUtils.get("languageSkiplist")); //TODO
    const language = flourite(_code_content_).language;
    const _siyuanStyleLanguage_ = this.codeLanguageNameToSiyuanStyle(language);

    if (languageBlacklistArr.includes(_siyuanStyleLanguage_)) {
      return "Unknown";
    } else {
      return language;
    }
    
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
              // protyle.reload(true);
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
      ".b3-dialog__content>div.ft__breakword>textarea"
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
      key: "languageBlacklist",
      value: "markdown",
      type: "textarea",
      title: this.i18n.languageBlacklist,
      description: this.i18n.languageBlacklistDesc,
    });

    this.settingUtils.addItem({
      key: "languageSkiplist",
      value: "php",
      type: "textarea",
      title: this.i18n.languageSkiplist,
      description: this.i18n.languageSkiplistDesc,
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
        error
      );
    }
  }

  onLayoutReady() {
    // this.test();
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
