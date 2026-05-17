import {
  BrnDialog,
  BrnDialogContent,
  BrnDialogTrigger,
  provideBrnDialogDefaultOptions
} from "./chunk-L3XMOPD4.js";
import {
  provideExposesStateProviderExisting
} from "./chunk-JSMUAVCP.js";
import {
  Directive,
  ElementRef,
  Input,
  input,
  numberAttribute,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵdefineDirective,
  ɵɵdomProperty,
  ɵɵgetInheritedFactory
} from "./chunk-W526TPSI.js";
import {
  InjectionToken,
  effect,
  forwardRef,
  inject,
  untracked
} from "./chunk-XA7UITTG.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// ../../../node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-popover.mjs
var defaultConfig = {
  align: "center",
  sideOffset: 0,
  offsetX: 0
};
var BrnPopoverConfigToken = new InjectionToken("BrnPopoverConfig");
function provideBrnPopoverConfig(config) {
  return {
    provide: BrnPopoverConfigToken,
    useValue: __spreadValues(__spreadValues({}, defaultConfig), config)
  };
}
function injectBrnPopoverConfig() {
  return inject(BrnPopoverConfigToken, {
    optional: true
  }) ?? defaultConfig;
}
var BRN_POPOVER_DIALOG_DEFAULT_OPTIONS = {
  hasBackdrop: false,
  scrollStrategy: "reposition"
};
var BrnPopover = class _BrnPopover extends BrnDialog {
  _config = injectBrnPopoverConfig();
  align = input(this._config.align, ...ngDevMode ? [{
    debugName: "align"
  }] : []);
  sideOffset = input(this._config.sideOffset, ...ngDevMode ? [{
    debugName: "sideOffset",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  offsetX = input(this._config.offsetX, ...ngDevMode ? [{
    debugName: "offsetX",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  _positionStrategy;
  constructor() {
    super();
    this.setAriaDescribedBy("");
    this.setAriaLabelledBy("");
    effect(() => {
      const align = this.align();
      untracked(() => {
        this.mutableAttachPositions.set([{
          originX: align,
          originY: "bottom",
          overlayX: align,
          overlayY: "top"
        }, {
          originX: align,
          originY: "top",
          overlayX: align,
          overlayY: "bottom"
        }]);
      });
      untracked(() => {
        this.applySideOffset(this.sideOffset());
      });
    });
    effect(() => {
      const sideOffset = this.sideOffset();
      untracked(() => {
        this.applySideOffset(sideOffset);
      });
    });
    effect(() => {
      const offsetX = this.offsetX();
      untracked(() => {
        this.applyOffsetX(offsetX);
      });
    });
    effect(() => {
      const attachTo = this.mutableAttachTo();
      const positions = this.mutableAttachPositions();
      if (!attachTo || !positions || positions.length === 0) return;
      untracked(() => {
        if (!this._positionStrategy) {
          this._positionStrategy = this.positionBuilder.flexibleConnectedTo(attachTo).withPush(false);
        } else {
          this._positionStrategy.setOrigin(attachTo);
        }
        this._positionStrategy.withPositions(positions);
        this.mutablePositionStrategy.set(this._positionStrategy);
      });
    });
  }
  applySideOffset(sideOffset) {
    this.mutableAttachPositions.update((positions) => positions.map((position) => __spreadProps(__spreadValues({}, position), {
      offsetY: position.originY === "top" ? -sideOffset : sideOffset
    })));
  }
  applyOffsetX(offsetX) {
    this.mutableAttachPositions.update((positions) => positions.map((position) => __spreadProps(__spreadValues({}, position), {
      offsetX
    })));
  }
  /** @nocollapse */
  static ɵfac = function BrnPopover_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnPopover)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnPopover,
    selectors: [["", "brnPopover", ""], ["brn-popover"]],
    inputs: {
      align: [1, "align"],
      sideOffset: [1, "sideOffset"],
      offsetX: [1, "offsetX"]
    },
    exportAs: ["brnPopover"],
    features: [ɵɵProvidersFeature([{
      provide: BrnDialog,
      useExisting: forwardRef(() => _BrnPopover)
    }, provideBrnDialogDefaultOptions(BRN_POPOVER_DIALOG_DEFAULT_OPTIONS)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnPopover, [{
    type: Directive,
    args: [{
      selector: "[brnPopover],brn-popover",
      exportAs: "brnPopover",
      providers: [{
        provide: BrnDialog,
        useExisting: forwardRef(() => BrnPopover)
      }, provideBrnDialogDefaultOptions(BRN_POPOVER_DIALOG_DEFAULT_OPTIONS)]
    }]
  }], () => [], {
    align: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "align",
        required: false
      }]
    }],
    sideOffset: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "sideOffset",
        required: false
      }]
    }],
    offsetX: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "offsetX",
        required: false
      }]
    }]
  });
})();
var BrnPopoverContent = class _BrnPopoverContent extends BrnDialogContent {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnPopoverContent_BaseFactory;
    return function BrnPopoverContent_Factory(__ngFactoryType__) {
      return (ɵBrnPopoverContent_BaseFactory || (ɵBrnPopoverContent_BaseFactory = ɵɵgetInheritedFactory(_BrnPopoverContent)))(__ngFactoryType__ || _BrnPopoverContent);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnPopoverContent,
    selectors: [["", "brnPopoverContent", ""]],
    features: [ɵɵProvidersFeature([provideExposesStateProviderExisting(() => _BrnPopoverContent)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnPopoverContent, [{
    type: Directive,
    args: [{
      selector: "[brnPopoverContent]",
      providers: [provideExposesStateProviderExisting(() => BrnPopoverContent)]
    }]
  }], null, null);
})();
var BrnPopoverTrigger = class _BrnPopoverTrigger extends BrnDialogTrigger {
  _host = inject(ElementRef, {
    host: true
  });
  brnPopoverTriggerFor = input(void 0, ...ngDevMode ? [{
    debugName: "brnPopoverTriggerFor",
    alias: "brnPopoverTriggerFor"
  }] : [{
    alias: "brnPopoverTriggerFor"
  }]);
  constructor() {
    super();
    effect(() => {
      const brnDialog = this.brnPopoverTriggerFor();
      untracked(() => {
        if (!brnDialog) return;
        brnDialog.mutableAttachTo.set(this._host.nativeElement);
        brnDialog.mutableCloseOnOutsidePointerEvents.set(true);
        this.mutableBrnDialogTriggerFor().set(brnDialog);
      });
    });
    if (!this._brnDialog) return;
    this._brnDialog.mutableAttachTo.set(this._host.nativeElement);
    this._brnDialog.mutableCloseOnOutsidePointerEvents.set(true);
  }
  /** @nocollapse */
  static ɵfac = function BrnPopoverTrigger_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnPopoverTrigger)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnPopoverTrigger,
    selectors: [["button", "brnPopoverTrigger", ""], ["button", "brnPopoverTriggerFor", ""]],
    hostAttrs: ["aria-haspopup", "dialog"],
    hostVars: 5,
    hostBindings: function BrnPopoverTrigger_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵdomProperty("id", ctx.id())("type", ctx.type());
        ɵɵattribute("aria-expanded", ctx.state() === "open" ? "true" : "false")("data-state", ctx.state())("aria-controls", ctx.dialogId);
      }
    },
    inputs: {
      brnPopoverTriggerFor: [1, "brnPopoverTriggerFor"]
    },
    features: [ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnPopoverTrigger, [{
    type: Directive,
    args: [{
      selector: "button[brnPopoverTrigger],button[brnPopoverTriggerFor]",
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
    brnPopoverTriggerFor: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "brnPopoverTriggerFor",
        required: false
      }]
    }]
  });
})();
var BrnPopoverImports = [BrnPopover, BrnPopoverTrigger, BrnPopoverContent];

export {
  provideBrnPopoverConfig,
  injectBrnPopoverConfig,
  BRN_POPOVER_DIALOG_DEFAULT_OPTIONS,
  BrnPopover,
  BrnPopoverContent,
  BrnPopoverTrigger,
  BrnPopoverImports
};
//# sourceMappingURL=chunk-2FUFJQD6.js.map
