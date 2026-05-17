import {
  BrnField
} from "./chunk-QKBZBKPB.js";
import "./chunk-XAJF2PT3.js";
import "./chunk-EWFU7DX6.js";
import "./chunk-RKNROUCE.js";
import {
  Directive,
  Input,
  input,
  setClassMetadata,
  ɵɵattribute,
  ɵɵdefineDirective,
  ɵɵdomProperty
} from "./chunk-W526TPSI.js";
import {
  computed,
  inject
} from "./chunk-XA7UITTG.js";
import "./chunk-IAIGU7F2.js";
import "./chunk-MZDWGNJP.js";
import "./chunk-RVPSNENR.js";
import "./chunk-GOMI4DH3.js";

// ../../../node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-label.mjs
var BrnLabel = class _BrnLabel {
  static _id = 0;
  _brnField = inject(BrnField, {
    optional: true
  });
  /** The id of the label. */
  id = input(`brn-label-${++_BrnLabel._id}`, ...ngDevMode ? [{
    debugName: "id"
  }] : []);
  /** The id of the form control this label is associated with. */
  for = input(...ngDevMode ? [void 0, {
    debugName: "for"
  }] : []);
  _for = computed(() => {
    const forValue = this.for();
    if (forValue) return forValue;
    return this._brnField?.labelableId();
  }, ...ngDevMode ? [{
    debugName: "_for"
  }] : []);
  /** @nocollapse */
  static ɵfac = function BrnLabel_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnLabel)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnLabel,
    selectors: [["", "brnLabel", ""]],
    hostVars: 2,
    hostBindings: function BrnLabel_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵdomProperty("id", ctx.id());
        ɵɵattribute("for", ctx._for());
      }
    },
    inputs: {
      id: [1, "id"],
      for: [1, "for"]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnLabel, [{
    type: Directive,
    args: [{
      selector: "[brnLabel]",
      host: {
        "[id]": "id()",
        "[attr.for]": "_for()"
      }
    }]
  }], null, {
    id: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "id",
        required: false
      }]
    }],
    for: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "for",
        required: false
      }]
    }]
  });
})();
var BrnLabelImports = [BrnLabel];
export {
  BrnLabel,
  BrnLabelImports
};
//# sourceMappingURL=@spartan-ng_brain_label.js.map
