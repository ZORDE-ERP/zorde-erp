import {
  BrnDialog,
  BrnDialogContent,
  BrnDialogDescription,
  BrnDialogOverlay,
  BrnDialogTitle,
  BrnDialogTrigger,
  provideBrnDialogDefaultOptions
} from "./chunk-L3XMOPD4.js";
import "./chunk-2CJQKESI.js";
import "./chunk-SAEZOEBE.js";
import {
  provideCustomClassSettableExisting,
  provideExposesStateProviderExisting
} from "./chunk-JSMUAVCP.js";
import "./chunk-X63WADNM.js";
import "./chunk-HLMENBHP.js";
import "./chunk-V2WFEFZN.js";
import "./chunk-6BG3TH7B.js";
import "./chunk-IN3NR6ZM.js";
import "./chunk-XKJIVAKI.js";
import "./chunk-YYOWHT3L.js";
import "./chunk-HIIRNIIQ.js";
import "./chunk-EWFU7DX6.js";
import "./chunk-RKNROUCE.js";
import {
  Directive,
  Input,
  input,
  setClassMetadata,
  ɵɵHostDirectivesFeature,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵdefineDirective,
  ɵɵdomProperty,
  ɵɵgetInheritedFactory
} from "./chunk-W526TPSI.js";
import {
  effect,
  forwardRef,
  untracked
} from "./chunk-XA7UITTG.js";
import "./chunk-IAIGU7F2.js";
import "./chunk-MZDWGNJP.js";
import "./chunk-RVPSNENR.js";
import "./chunk-GOMI4DH3.js";

// ../../../node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-alert-dialog.mjs
var BRN_ALERT_DIALOG_DEFAULT_OPTIONS = {
  closeOnBackdropClick: false,
  closeOnOutsidePointerEvents: false,
  role: "alertdialog"
};
var BrnAlertDialog = class _BrnAlertDialog extends BrnDialog {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialog_BaseFactory;
    return function BrnAlertDialog_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialog_BaseFactory || (ɵBrnAlertDialog_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialog)))(__ngFactoryType__ || _BrnAlertDialog);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialog,
    selectors: [["", "brnAlertDialog", ""], ["brn-alert-dialog"]],
    exportAs: ["brnAlertDialog"],
    features: [ɵɵProvidersFeature([{
      provide: BrnDialog,
      useExisting: forwardRef(() => _BrnAlertDialog)
    }, provideBrnDialogDefaultOptions(BRN_ALERT_DIALOG_DEFAULT_OPTIONS)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialog, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialog],brn-alert-dialog",
      exportAs: "brnAlertDialog",
      providers: [{
        provide: BrnDialog,
        useExisting: forwardRef(() => BrnAlertDialog)
      }, provideBrnDialogDefaultOptions(BRN_ALERT_DIALOG_DEFAULT_OPTIONS)]
    }]
  }], null, null);
})();
var BrnAlertDialogContent = class _BrnAlertDialogContent extends BrnDialogContent {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogContent_BaseFactory;
    return function BrnAlertDialogContent_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogContent_BaseFactory || (ɵBrnAlertDialogContent_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogContent)))(__ngFactoryType__ || _BrnAlertDialogContent);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogContent,
    selectors: [["", "brnAlertDialogContent", ""]],
    features: [ɵɵProvidersFeature([provideExposesStateProviderExisting(() => _BrnAlertDialogContent)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogContent, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogContent]",
      providers: [provideExposesStateProviderExisting(() => BrnAlertDialogContent)]
    }]
  }], null, null);
})();
var BrnAlertDialogDescription = class _BrnAlertDialogDescription {
  /** @nocollapse */
  static ɵfac = function BrnAlertDialogDescription_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnAlertDialogDescription)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogDescription,
    selectors: [["", "brnAlertDialogDescription", ""]],
    features: [ɵɵHostDirectivesFeature([BrnDialogDescription])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogDescription, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogDescription]",
      hostDirectives: [BrnDialogDescription]
    }]
  }], null, null);
})();
var BrnAlertDialogOverlay = class _BrnAlertDialogOverlay extends BrnDialogOverlay {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogOverlay_BaseFactory;
    return function BrnAlertDialogOverlay_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogOverlay_BaseFactory || (ɵBrnAlertDialogOverlay_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogOverlay)))(__ngFactoryType__ || _BrnAlertDialogOverlay);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogOverlay,
    selectors: [["", "brnAlertDialogOverlay", ""], ["brn-alert-dialog-overlay"]],
    features: [ɵɵProvidersFeature([provideCustomClassSettableExisting(() => _BrnAlertDialogOverlay)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogOverlay, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogOverlay],brn-alert-dialog-overlay",
      providers: [provideCustomClassSettableExisting(() => BrnAlertDialogOverlay)]
    }]
  }], null, null);
})();
var BrnAlertDialogTitle = class _BrnAlertDialogTitle {
  /** @nocollapse */
  static ɵfac = function BrnAlertDialogTitle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnAlertDialogTitle)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogTitle,
    selectors: [["", "brnAlertDialogTitle", ""]],
    features: [ɵɵHostDirectivesFeature([BrnDialogTitle])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogTitle, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogTitle]",
      hostDirectives: [BrnDialogTitle]
    }]
  }], null, null);
})();
var BrnAlertDialogTrigger = class _BrnAlertDialogTrigger extends BrnDialogTrigger {
  brnAlertDialogTriggerFor = input(...ngDevMode ? [void 0, {
    debugName: "brnAlertDialogTriggerFor"
  }] : []);
  constructor() {
    super();
    effect(() => {
      const brnDialog = this.brnAlertDialogTriggerFor();
      untracked(() => {
        if (brnDialog) {
          this.mutableBrnDialogTriggerFor().set(brnDialog);
        }
      });
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnAlertDialogTrigger_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnAlertDialogTrigger)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogTrigger,
    selectors: [["button", "brnAlertDialogTrigger", ""], ["button", "brnAlertDialogTriggerFor", ""]],
    hostAttrs: ["aria-haspopup", "dialog"],
    hostVars: 5,
    hostBindings: function BrnAlertDialogTrigger_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵdomProperty("id", ctx.id())("type", ctx.type());
        ɵɵattribute("aria-expanded", ctx.state() === "open" ? "true" : "false")("data-state", ctx.state())("aria-controls", ctx.dialogId);
      }
    },
    inputs: {
      brnAlertDialogTriggerFor: [1, "brnAlertDialogTriggerFor"]
    },
    features: [ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogTrigger, [{
    type: Directive,
    args: [{
      selector: "button[brnAlertDialogTrigger],button[brnAlertDialogTriggerFor]",
      host: {
        "[id]": "id()",
        "aria-haspopup": "dialog",
        "[attr.aria-expanded]": "state() === 'open' ? 'true': 'false'",
        "[attr.data-state]": "state()",
        "[attr.aria-controls]": "dialogId",
        "[type]": "type()"
      }
    }]
  }], () => [], {
    brnAlertDialogTriggerFor: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "brnAlertDialogTriggerFor",
        required: false
      }]
    }]
  });
})();
var BrnAlertDialogImports = [BrnAlertDialog, BrnAlertDialogOverlay, BrnAlertDialogTrigger, BrnAlertDialogContent, BrnAlertDialogTitle, BrnAlertDialogDescription];
export {
  BRN_ALERT_DIALOG_DEFAULT_OPTIONS,
  BrnAlertDialog,
  BrnAlertDialogContent,
  BrnAlertDialogDescription,
  BrnAlertDialogImports,
  BrnAlertDialogOverlay,
  BrnAlertDialogTitle,
  BrnAlertDialogTrigger
};
//# sourceMappingURL=@spartan-ng_brain_alert-dialog.js.map
