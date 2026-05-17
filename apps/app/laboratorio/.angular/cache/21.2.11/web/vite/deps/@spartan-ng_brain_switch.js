import "./chunk-VUYQY2KA.js";
import "./chunk-SAEZOEBE.js";
import {
  BrnFieldControl,
  provideBrnLabelable
} from "./chunk-QKBZBKPB.js";
import {
  takeUntilDestroyed
} from "./chunk-X63WADNM.js";
import "./chunk-ENBPEZ4V.js";
import {
  FocusMonitor
} from "./chunk-6BG3TH7B.js";
import "./chunk-IN3NR6ZM.js";
import {
  NG_VALUE_ACCESSOR
} from "./chunk-XAJF2PT3.js";
import "./chunk-XKJIVAKI.js";
import "./chunk-YYOWHT3L.js";
import "./chunk-HIIRNIIQ.js";
import {
  isPlatformBrowser
} from "./chunk-EWFU7DX6.js";
import "./chunk-RKNROUCE.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Output,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  afterRenderEffect,
  booleanAttribute,
  input,
  model,
  numberAttribute,
  output,
  setClassMetadata,
  viewChild,
  ɵɵHostDirectivesFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵpureFunction0,
  ɵɵqueryAdvance,
  ɵɵstyleMap,
  ɵɵviewQuerySignal
} from "./chunk-W526TPSI.js";
import {
  DOCUMENT,
  DestroyRef,
  computed,
  forwardRef,
  inject,
  linkedSignal,
  signal,
  ɵɵresetView,
  ɵɵrestoreView
} from "./chunk-XA7UITTG.js";
import "./chunk-IAIGU7F2.js";
import "./chunk-MZDWGNJP.js";
import "./chunk-RVPSNENR.js";
import "./chunk-GOMI4DH3.js";

// ../../../node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-switch.mjs
var _c0 = ["switch"];
var _c1 = () => ({
  display: "contents"
});
var _c2 = [[["brn-switch-thumb"]]];
var _c3 = ["brn-switch-thumb"];
var BRN_SWITCH_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BrnSwitch),
  multi: true
};
var CONTAINER_POST_FIX = "-switch";
var uniqueIdCounter = 0;
var BrnSwitch = class _BrnSwitch {
  _destroyRef = inject(DestroyRef);
  _renderer = inject(Renderer2);
  _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  _elementRef = inject(ElementRef);
  _focusMonitor = inject(FocusMonitor);
  _cdr = inject(ChangeDetectorRef);
  _document = inject(DOCUMENT);
  _fieldControl = inject(BrnFieldControl, {
    optional: true
  });
  _focusVisible = signal(false, ...ngDevMode ? [{
    debugName: "_focusVisible"
  }] : []);
  _focused = signal(false, ...ngDevMode ? [{
    debugName: "_focused"
  }] : []);
  /**
   * Whether switch is checked/toggled on.
   * Can be bound with [(checked)] for two-way binding.
   */
  checked = model(false, ...ngDevMode ? [{
    debugName: "checked"
  }] : []);
  /** Emits when checked state changes. */
  checkedChange = output();
  /**
   * Unique identifier for switch component.
   * When provided, inner button gets ID without '-switch' suffix.
   * Auto-generates ID if not provided.
   */
  id = input(++uniqueIdCounter + "", ...ngDevMode ? [{
    debugName: "id"
  }] : []);
  /**
   * Form control name for switch.
   * When provided, inner button gets name without '-switch' suffix.
   */
  name = input(null, ...ngDevMode ? [{
    debugName: "name"
  }] : []);
  /**
   * CSS classes applied to inner button element.
   */
  class = input(null, ...ngDevMode ? [{
    debugName: "class"
  }] : []);
  /**
   * Accessibility label for screen readers.
   * Use when no visible label exists.
   */
  ariaLabel = input(null, ...ngDevMode ? [{
    debugName: "ariaLabel",
    alias: "aria-label"
  }] : [{
    alias: "aria-label"
  }]);
  /**
   * ID of element that labels this switch for accessibility.
   * Auto-set when switch is inside label element.
   */
  ariaLabelledby = input(null, ...ngDevMode ? [{
    debugName: "ariaLabelledby",
    alias: "aria-labelledby"
  }] : [{
    alias: "aria-labelledby"
  }]);
  mutableAriaLabelledby = linkedSignal(() => this.ariaLabelledby(), ...ngDevMode ? [{
    debugName: "mutableAriaLabelledby"
  }] : []);
  /**
   * ID of element that describes this switch for accessibility.
   */
  ariaDescribedby = input(null, ...ngDevMode ? [{
    debugName: "ariaDescribedby",
    alias: "aria-describedby"
  }] : [{
    alias: "aria-describedby"
  }]);
  /**
   * Whether switch is required in a form.
   */
  required = input(false, ...ngDevMode ? [{
    debugName: "required",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  /**
   * Whether switch is disabled.
   * Disabled switches cannot be toggled and indicate disabled state with data attribute.
   */
  disabled = input(false, ...ngDevMode ? [{
    debugName: "disabled",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  /**
   * Keyboard tab order for switch.
   * @default 0
   */
  tabIndex = input(0, ...ngDevMode ? [{
    debugName: "tabIndex",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  /**
   * Event emitted when switch is blurred (loses focus).
   * Used for form validation.
   */
  touched = output();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onChange = () => {
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onTouched = () => {
  };
  switch = viewChild.required("switch");
  _state = computed(() => {
    const name = this.name();
    const id = this.id();
    return {
      disabled: signal(this.disabled()),
      name: name ? name + CONTAINER_POST_FIX : null,
      id: id ? id + CONTAINER_POST_FIX : null
    };
  }, ...ngDevMode ? [{
    debugName: "_state"
  }] : []);
  controlState = this._fieldControl?.controlState;
  _invalid = this._fieldControl?.invalid;
  _touched = this._fieldControl?.touched;
  _dirty = this._fieldControl?.dirty;
  _spartanInvalid = this._fieldControl?.spartanInvalid;
  labelableId = computed(() => this.getSwitchButtonId(this._state().id), ...ngDevMode ? [{
    debugName: "labelableId"
  }] : []);
  constructor() {
    afterRenderEffect(() => {
      const state = this._state();
      const isDisabled = state.disabled();
      if (!this._elementRef.nativeElement || !this._isBrowser) return;
      const newLabelId = state.id + "-label";
      const switchButtonId = this.getSwitchButtonId(state.id);
      const labelElement = this._elementRef.nativeElement.closest("label") ?? this._document.querySelector(`label[for="${switchButtonId}"]`);
      if (!labelElement) return;
      const existingLabelId = labelElement.id;
      this._renderer.setAttribute(labelElement, "data-disabled", isDisabled ? "true" : "false");
      this.mutableAriaLabelledby.set(existingLabelId || newLabelId);
      if (!existingLabelId || existingLabelId.length === 0) {
        this._renderer.setAttribute(labelElement, "id", newLabelId);
      }
    });
  }
  /**
   * Toggles switch between checked/unchecked states.
   * Does nothing if switch is disabled.
   */
  toggle() {
    if (this._state().disabled()) return;
    this._onTouched();
    this.touched.emit();
    this.checked.update((checked) => !checked);
    this._onChange(this.checked());
    this.checkedChange.emit(this.checked());
  }
  ngAfterContentInit() {
    this._focusMonitor.monitor(this._elementRef, true).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((focusOrigin) => {
      if (focusOrigin) this._focused.set(true);
      if (focusOrigin === "keyboard" || focusOrigin === "program") {
        this._focusVisible.set(true);
        this._cdr.markForCheck();
      }
      if (!focusOrigin) {
        Promise.resolve().then(() => {
          this._focusVisible.set(false);
          this._focused.set(false);
          this._onTouched();
          this.touched.emit();
          this._cdr.markForCheck();
        });
      }
    });
    if (!this.switch()) return;
    this.switch().nativeElement.value = this.checked() ? "on" : "off";
    this.switch().nativeElement.dispatchEvent(new Event("change"));
  }
  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }
  /**
   * Gets proper ID for inner button element.
   * Removes '-switch' suffix if present in container ID.
   *
   * @param idPassedToContainer - ID applied to container element
   * @returns ID to use for inner button or null
   */
  getSwitchButtonId(idPassedToContainer) {
    return idPassedToContainer ? idPassedToContainer.replace(new RegExp(CONTAINER_POST_FIX + "$"), "") : null;
  }
  /**
   * Updates internal state when control value changes from outside.
   * Part of ControlValueAccessor interface.
   *
   * @param value - New checked state
   */
  writeValue(value) {
    this.checked.set(Boolean(value));
  }
  /**
   * Registers callback for value changes.
   * Part of ControlValueAccessor interface.
   *
   * @param fn - Function to call when value changes
   */
  registerOnChange(fn) {
    this._onChange = fn;
  }
  /**
   * Registers callback for touched events.
   * Part of ControlValueAccessor interface.
   *
   * @param fn - Function to call when control is touched
   */
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  /**
   * Updates disabled state from form control.
   * Part of ControlValueAccessor interface.
   *
   * @param isDisabled - Whether switch should be disabled
   */
  setDisabledState(isDisabled) {
    this._state().disabled.set(isDisabled);
    this._cdr.markForCheck();
  }
  /** @nocollapse */
  static ɵfac = function BrnSwitch_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnSwitch)();
  };
  /** @nocollapse */
  static ɵcmp = ɵɵdefineComponent({
    type: _BrnSwitch,
    selectors: [["brn-switch"]],
    viewQuery: function BrnSwitch_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuerySignal(ctx.switch, _c0, 5);
      }
      if (rf & 2) {
        ɵɵqueryAdvance();
      }
    },
    hostVars: 16,
    hostBindings: function BrnSwitch_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("id", ctx._state().id)("name", ctx._state().name)("aria-labelledby", null)("aria-label", null)("aria-describedby", null)("aria-invalid", (ctx._invalid == null ? null : ctx._invalid()) ? "true" : null)("data-dirty", (ctx._dirty == null ? null : ctx._dirty()) ? "true" : null)("data-touched", (ctx._touched == null ? null : ctx._touched()) ? "true" : null)("data-matches-spartan-invalid", (ctx._spartanInvalid == null ? null : ctx._spartanInvalid()) ? "true" : null)("data-state", ctx.checked() ? "checked" : "unchecked")("data-focus-visible", ctx._focusVisible())("data-focus", ctx._focused())("data-disabled", ctx._state().disabled());
        ɵɵstyleMap(ɵɵpureFunction0(15, _c1));
      }
    },
    inputs: {
      checked: [1, "checked"],
      id: [1, "id"],
      name: [1, "name"],
      class: [1, "class"],
      ariaLabel: [1, "aria-label", "ariaLabel"],
      ariaLabelledby: [1, "aria-labelledby", "ariaLabelledby"],
      ariaDescribedby: [1, "aria-describedby", "ariaDescribedby"],
      required: [1, "required"],
      disabled: [1, "disabled"],
      tabIndex: [1, "tabIndex"]
    },
    outputs: {
      checked: "checkedChange",
      checkedChange: "checkedChange",
      touched: "touched"
    },
    features: [ɵɵProvidersFeature([BRN_SWITCH_VALUE_ACCESSOR, provideBrnLabelable(_BrnSwitch)]), ɵɵHostDirectivesFeature([BrnFieldControl])],
    ngContentSelectors: _c3,
    decls: 3,
    vars: 19,
    consts: [["switch", ""], ["role", "switch", "type", "button", 3, "click", "id", "name", "value", "disabled", "tabIndex"]],
    template: function BrnSwitch_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = ɵɵgetCurrentView();
        ɵɵprojectionDef(_c2);
        ɵɵdomElementStart(0, "button", 1, 0);
        ɵɵdomListener("click", function BrnSwitch_Template_button_click_0_listener($event) {
          ɵɵrestoreView(_r1);
          $event.preventDefault();
          return ɵɵresetView(ctx.toggle());
        });
        ɵɵprojection(2);
        ɵɵdomElementEnd();
      }
      if (rf & 2) {
        ɵɵclassMap(ctx.class());
        ɵɵdomProperty("id", ctx.getSwitchButtonId(ctx._state().id) ?? "")("name", ctx.getSwitchButtonId(ctx._state().name) ?? "")("value", ctx.checked() ? "on" : "off")("disabled", ctx._state().disabled())("tabIndex", ctx.tabIndex());
        ɵɵattribute("aria-checked", ctx.checked())("aria-label", ctx.ariaLabel() || null)("aria-labelledby", ctx.mutableAriaLabelledby() || null)("aria-describedby", ctx.ariaDescribedby() || null)("aria-invalid", (ctx._invalid == null ? null : ctx._invalid()) ? "true" : null)("data-dirty", (ctx._dirty == null ? null : ctx._dirty()) ? "true" : null)("data-touched", (ctx._touched == null ? null : ctx._touched()) ? "true" : null)("data-matches-spartan-invalid", (ctx._spartanInvalid == null ? null : ctx._spartanInvalid()) ? "true" : null)("data-state", ctx.checked() ? "checked" : "unchecked")("data-focus-visible", ctx._focusVisible())("data-focus", ctx._focused())("data-disabled", ctx._state().disabled());
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnSwitch, [{
    type: Component,
    args: [{
      selector: "brn-switch",
      providers: [BRN_SWITCH_VALUE_ACCESSOR, provideBrnLabelable(BrnSwitch)],
      changeDetection: ChangeDetectionStrategy.OnPush,
      hostDirectives: [BrnFieldControl],
      host: {
        "[style]": '{display: "contents"}',
        "[attr.id]": "_state().id",
        "[attr.name]": "_state().name",
        "[attr.aria-labelledby]": "null",
        "[attr.aria-label]": "null",
        "[attr.aria-describedby]": "null",
        "[attr.aria-invalid]": '_invalid?.() ? "true" : null',
        "[attr.data-dirty]": '_dirty?.() ? "true": null',
        "[attr.data-touched]": '_touched?.() ? "true" : null',
        "[attr.data-matches-spartan-invalid]": '_spartanInvalid?.() ? "true" : null',
        "[attr.data-state]": 'checked() ? "checked" : "unchecked"',
        "[attr.data-focus-visible]": "_focusVisible()",
        "[attr.data-focus]": "_focused()",
        "[attr.data-disabled]": "_state().disabled()"
      },
      template: `
		<button
			#switch
			role="switch"
			type="button"
			[class]="class()"
			[id]="getSwitchButtonId(_state().id) ?? ''"
			[name]="getSwitchButtonId(_state().name) ?? ''"
			[value]="checked() ? 'on' : 'off'"
			[attr.aria-checked]="checked()"
			[attr.aria-label]="ariaLabel() || null"
			[attr.aria-labelledby]="mutableAriaLabelledby() || null"
			[attr.aria-describedby]="ariaDescribedby() || null"
			[attr.aria-invalid]="_invalid?.() ? 'true' : null"
			[attr.data-dirty]="_dirty?.() ? 'true' : null"
			[attr.data-touched]="_touched?.() ? 'true' : null"
			[attr.data-matches-spartan-invalid]="_spartanInvalid?.() ? 'true' : null"
			[attr.data-state]="checked() ? 'checked' : 'unchecked'"
			[attr.data-focus-visible]="_focusVisible()"
			[attr.data-focus]="_focused()"
			[attr.data-disabled]="_state().disabled()"
			[disabled]="_state().disabled()"
			[tabIndex]="tabIndex()"
			(click)="$event.preventDefault(); toggle()"
		>
			<ng-content select="brn-switch-thumb" />
		</button>
	`
    }]
  }], () => [], {
    checked: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "checked",
        required: false
      }]
    }, {
      type: Output,
      args: ["checkedChange"]
    }],
    checkedChange: [{
      type: Output,
      args: ["checkedChange"]
    }],
    id: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "id",
        required: false
      }]
    }],
    name: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "name",
        required: false
      }]
    }],
    class: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "class",
        required: false
      }]
    }],
    ariaLabel: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-label",
        required: false
      }]
    }],
    ariaLabelledby: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-labelledby",
        required: false
      }]
    }],
    ariaDescribedby: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-describedby",
        required: false
      }]
    }],
    required: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "required",
        required: false
      }]
    }],
    disabled: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "disabled",
        required: false
      }]
    }],
    tabIndex: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "tabIndex",
        required: false
      }]
    }],
    touched: [{
      type: Output,
      args: ["touched"]
    }],
    switch: [{
      type: ViewChild,
      args: ["switch", {
        isSignal: true
      }]
    }]
  });
})();
var BrnSwitchThumb = class _BrnSwitchThumb {
  /** @nocollapse */
  static ɵfac = function BrnSwitchThumb_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnSwitchThumb)();
  };
  /** @nocollapse */
  static ɵcmp = ɵɵdefineComponent({
    type: _BrnSwitchThumb,
    selectors: [["brn-switch-thumb"]],
    hostAttrs: ["role", "presentation"],
    hostBindings: function BrnSwitchThumb_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("click", function BrnSwitchThumb_click_HostBindingHandler($event) {
          return $event.preventDefault();
        });
      }
    },
    decls: 0,
    vars: 0,
    template: function BrnSwitchThumb_Template(rf, ctx) {
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnSwitchThumb, [{
    type: Component,
    args: [{
      selector: "brn-switch-thumb",
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        role: "presentation",
        "(click)": "$event.preventDefault()"
      },
      template: ""
    }]
  }], null, null);
})();
var BrnSwitchImports = [BrnSwitch, BrnSwitchThumb];
export {
  BRN_SWITCH_VALUE_ACCESSOR,
  BrnSwitch,
  BrnSwitchImports,
  BrnSwitchThumb
};
//# sourceMappingURL=@spartan-ng_brain_switch.js.map
