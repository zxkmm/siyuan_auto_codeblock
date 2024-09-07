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

const lang_test_string = `

  #include "usb_serial_asyncmsg.hpp"

  /// value
  // to_string_bin/ to_string_decimal/ to_string_hex/ to_string_hex_array/ to_string_dec_uint/ to_string_dec_int etc seems usellss so i didn't add them here
  // usage:     UsbSerialAsyncmsg::asyncmsg(num);

  template <>
  void UsbSerialAsyncmsg::asyncmsg<int64_t>(const int64_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<int32_t>(const int32_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<int16_t>(const int16_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<int8_t>(const int8_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<uint8_t>(const uint8_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<uint16_t>(const uint16_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<uint32_t>(const uint32_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<uint64_t>(const uint64_t& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_dec_int(data).c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<float>(const float& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", to_string_decimal(data, 7).c_str());
  }

  /// fs things

  template <>
  // usage:     UsbSerialAsyncmsg::asyncmsg(path);
  void UsbSerialAsyncmsg::asyncmsg<std::filesystem::path>(const std::filesystem::path& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      std::string path_str = data.string();
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", path_str.c_str());
  }

  template <>
  void UsbSerialAsyncmsg::asyncmsg<std::filesystem::path::string_type>(const std::filesystem::path::string_type& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      std::string str_data(data.begin(), data.end());
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", str_data.c_str());
  }

  /// string

  // string obj
  template <>
  // usage:     UsbSerialAsyncmsg::asyncmsg(str);
  void UsbSerialAsyncmsg::asyncmsg<std::string>(const std::string& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", data.c_str());
  }

  // string literal AKA char[]
  // usage: UsbSerialAsyncmsg::asyncmsg("abc");
  void UsbSerialAsyncmsg::asyncmsg(const char* data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", data);
  }

  /// bool
  template <>
  // usage:     UsbSerialAsyncmsg::asyncmsg(true);
  void UsbSerialAsyncmsg::asyncmsg<bool>(const bool& data) {
      if (!portapack::async_tx_enabled) {
          return;
      }
      chprintf((BaseSequentialStream*)&SUSBD1, "%s\r\n", data ? "true" : "false");
  }


  `;

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

  handleSlashEvent() {
    this.protyleSlash = [
      {
        filter: ["acb", "autocodeblock"],
        html: this.i18n.acb_html,
        id: "autoCodeBlock",
        callback: (protyle: Protyle) => {
          this.inputDialog({
            title: this.i18n.acb_window_title,
            placeholder: this.i18n.acb_window_input_placehoder,
            width: "50vw",
            height: "50vh",
            confirm: (text: string) => {
              const language = this.handleLanguage(text);
              showMessage(this.i18n.acb_show_message_prefix + language);
              const siyuanLanguage =
                this.codeLanguageNameToSiyuanStyle(language);
              // console.log("language:", language);
              // console.log("siyuanLanguage:", siyuanLanguage);
              // console.log("text:", text);
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
              // console.log(md1);
              protyle.insert(md1, true, true); //TODO: this works but need to figure out what's the 3rd one is
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
    const dialog = new Dialog({
      title: args.title,
      content: `<div class="b3-dialog__content">
      <div class="ft__breakword"><textarea class="b3-text-field fn__block" style="height: 100%;" placeholder=${
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
    btnsElement[1].addEventListener("click", () => {
      if (args?.confirm) {
        args.confirm(target.value);
      }
      dialog.destroy();
    });
  };

  async onload() {
    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
    // 图标的制作参见帮助文档
    //     this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
    // <path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
    // </symbol>
    // <symbol id="iconSaving" viewBox="0 0 32 32">
    // <path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
    // </symbol>`);

    // const topBarElement = this.addTopBar({ //TODO; one click auto language
    //   icon: "iconFace",
    //   title: this.i18n.addTopBarIcon,
    //   position: "right",
    //   callback: () => {
    //     if (this.isMobile) {
    //       this.addMenu();
    //     } else {
    //       let rect = topBarElement.getBoundingClientRect();
    //       // 如果被隐藏，则使用更多按钮
    //       if (rect.width === 0) {
    //         rect = document.querySelector("#barMore").getBoundingClientRect();
    //       }
    //       if (rect.width === 0) {
    //         rect = document
    //           .querySelector("#barPlugins")
    //           .getBoundingClientRect();
    //       }
    //       this.addMenu(rect);
    //     }
    //   },
    // });

    this.settingUtils = new SettingUtils({ //TODO: settings
      plugin: this,
      name: STORAGE_NAME,
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
    this.handleSlashEvent();
    // this.loadData(STORAGE_NAME);
    this.settingUtils.load();
    // console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  async onunload() {}

  uninstall() {}
}
