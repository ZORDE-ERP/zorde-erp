import {
  A11yModule,
  FocusTrapFactory,
  InteractivityChecker
} from "./chunk-SAEZOEBE.js";
import {
  provideCustomClassSettableExisting,
  provideExposesStateProviderExisting
} from "./chunk-JSMUAVCP.js";
import {
  takeUntilDestroyed
} from "./chunk-X63WADNM.js";
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  OverlayConfig,
  OverlayContainer,
  OverlayModule,
  OverlayOutsideClickDispatcher,
  OverlayPositionBuilder,
  OverlayRef,
  PortalModule,
  ScrollStrategyOptions,
  TemplatePortal,
  createBlockScrollStrategy,
  createGlobalPositionStrategy,
  createOverlayRef
} from "./chunk-HLMENBHP.js";
import {
  Directionality
} from "./chunk-V2WFEFZN.js";
import {
  FocusMonitor
} from "./chunk-6BG3TH7B.js";
import {
  ESCAPE,
  Platform,
  _IdGenerator,
  _getFocusedElementPierceShadowDom,
  coerceNumberProperty,
  hasModifierKey
} from "./chunk-IN3NR6ZM.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Injectable,
  Input,
  NgModule,
  Output,
  Renderer2,
  RendererFactory2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  input,
  numberAttribute,
  output,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdomProperty,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵqueryRefresh,
  ɵɵtemplate,
  ɵɵviewQuery
} from "./chunk-W526TPSI.js";
import {
  DOCUMENT,
  DestroyRef,
  EventEmitter,
  InjectionToken,
  Injector,
  NgZone,
  computed,
  effect,
  inject,
  linkedSignal,
  runInInjectionContext,
  signal,
  untracked,
  ɵɵdefineInjectable,
  ɵɵdefineInjector
} from "./chunk-XA7UITTG.js";
import {
  defer,
  merge
} from "./chunk-MZDWGNJP.js";
import {
  Subject,
  filter,
  startWith,
  take,
  takeUntil
} from "./chunk-RVPSNENR.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// ../../../node_modules/@angular/cdk/fesm2022/dialog.mjs
function CdkDialogContainer_ng_template_0_Template(rf, ctx) {
}
var DialogConfig = class {
  viewContainerRef;
  injector;
  id;
  role = "dialog";
  panelClass = "";
  hasBackdrop = true;
  backdropClass = "";
  disableClose = false;
  closePredicate;
  width = "";
  height = "";
  minWidth;
  minHeight;
  maxWidth;
  maxHeight;
  positionStrategy;
  data = null;
  direction;
  ariaDescribedBy = null;
  ariaLabelledBy = null;
  ariaLabel = null;
  ariaModal = false;
  autoFocus = "first-tabbable";
  restoreFocus = true;
  scrollStrategy;
  closeOnNavigation = true;
  closeOnDestroy = true;
  closeOnOverlayDetachments = true;
  disableAnimations = false;
  providers;
  container;
  templateContext;
};
function throwDialogContentAlreadyAttachedError() {
  throw Error("Attempting to attach dialog content after content is already attached");
}
var CdkDialogContainer = class _CdkDialogContainer extends BasePortalOutlet {
  _elementRef = inject(ElementRef);
  _focusTrapFactory = inject(FocusTrapFactory);
  _config;
  _interactivityChecker = inject(InteractivityChecker);
  _ngZone = inject(NgZone);
  _focusMonitor = inject(FocusMonitor);
  _renderer = inject(Renderer2);
  _changeDetectorRef = inject(ChangeDetectorRef);
  _injector = inject(Injector);
  _platform = inject(Platform);
  _document = inject(DOCUMENT);
  _portalOutlet;
  _focusTrapped = new Subject();
  _focusTrap = null;
  _elementFocusedBeforeDialogWasOpened = null;
  _closeInteractionType = null;
  _ariaLabelledByQueue = [];
  _isDestroyed = false;
  constructor() {
    super();
    this._config = inject(DialogConfig, {
      optional: true
    }) || new DialogConfig();
    if (this._config.ariaLabelledBy) {
      this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);
    }
  }
  _addAriaLabelledBy(id) {
    this._ariaLabelledByQueue.push(id);
    this._changeDetectorRef.markForCheck();
  }
  _removeAriaLabelledBy(id) {
    const index = this._ariaLabelledByQueue.indexOf(id);
    if (index > -1) {
      this._ariaLabelledByQueue.splice(index, 1);
      this._changeDetectorRef.markForCheck();
    }
  }
  _contentAttached() {
    this._initializeFocusTrap();
    this._captureInitialFocus();
  }
  _captureInitialFocus() {
    this._trapFocus();
  }
  ngOnDestroy() {
    this._focusTrapped.complete();
    this._isDestroyed = true;
    this._restoreFocus();
  }
  attachComponentPortal(portal) {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }
    const result = this._portalOutlet.attachComponentPortal(portal);
    this._contentAttached();
    return result;
  }
  attachTemplatePortal(portal) {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }
    const result = this._portalOutlet.attachTemplatePortal(portal);
    this._contentAttached();
    return result;
  }
  attachDomPortal = (portal) => {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }
    const result = this._portalOutlet.attachDomPortal(portal);
    this._contentAttached();
    return result;
  };
  _recaptureFocus() {
    if (!this._containsFocus()) {
      this._trapFocus();
    }
  }
  _forceFocus(element, options) {
    if (!this._interactivityChecker.isFocusable(element)) {
      element.tabIndex = -1;
      this._ngZone.runOutsideAngular(() => {
        const callback = () => {
          deregisterBlur();
          deregisterMousedown();
          element.removeAttribute("tabindex");
        };
        const deregisterBlur = this._renderer.listen(element, "blur", callback);
        const deregisterMousedown = this._renderer.listen(element, "mousedown", callback);
      });
    }
    element.focus(options);
  }
  _focusByCssSelector(selector, options) {
    let elementToFocus = this._elementRef.nativeElement.querySelector(selector);
    if (elementToFocus) {
      this._forceFocus(elementToFocus, options);
    }
  }
  _trapFocus(options) {
    if (this._isDestroyed) {
      return;
    }
    afterNextRender(() => {
      const element = this._elementRef.nativeElement;
      switch (this._config.autoFocus) {
        case false:
        case "dialog":
          if (!this._containsFocus()) {
            element.focus(options);
          }
          break;
        case true:
        case "first-tabbable":
          const focusedSuccessfully = this._focusTrap?.focusInitialElement(options);
          if (!focusedSuccessfully) {
            this._focusDialogContainer(options);
          }
          break;
        case "first-heading":
          this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]', options);
          break;
        default:
          this._focusByCssSelector(this._config.autoFocus, options);
          break;
      }
      this._focusTrapped.next();
    }, {
      injector: this._injector
    });
  }
  _restoreFocus() {
    const focusConfig = this._config.restoreFocus;
    let focusTargetElement = null;
    if (typeof focusConfig === "string") {
      focusTargetElement = this._document.querySelector(focusConfig);
    } else if (typeof focusConfig === "boolean") {
      focusTargetElement = focusConfig ? this._elementFocusedBeforeDialogWasOpened : null;
    } else if (focusConfig) {
      focusTargetElement = focusConfig;
    }
    if (this._config.restoreFocus && focusTargetElement && typeof focusTargetElement.focus === "function") {
      const activeElement = _getFocusedElementPierceShadowDom();
      const element = this._elementRef.nativeElement;
      if (!activeElement || activeElement === this._document.body || activeElement === element || element.contains(activeElement)) {
        if (this._focusMonitor) {
          this._focusMonitor.focusVia(focusTargetElement, this._closeInteractionType);
          this._closeInteractionType = null;
        } else {
          focusTargetElement.focus();
        }
      }
    }
    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }
  _focusDialogContainer(options) {
    this._elementRef.nativeElement.focus?.(options);
  }
  _containsFocus() {
    const element = this._elementRef.nativeElement;
    const activeElement = _getFocusedElementPierceShadowDom();
    return element === activeElement || element.contains(activeElement);
  }
  _initializeFocusTrap() {
    if (this._platform.isBrowser) {
      this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
      if (this._document) {
        this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
      }
    }
  }
  static ɵfac = function CdkDialogContainer_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDialogContainer)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _CdkDialogContainer,
    selectors: [["cdk-dialog-container"]],
    viewQuery: function CdkDialogContainer_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(CdkPortalOutlet, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._portalOutlet = _t.first);
      }
    },
    hostAttrs: ["tabindex", "-1", 1, "cdk-dialog-container"],
    hostVars: 6,
    hostBindings: function CdkDialogContainer_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("id", ctx._config.id || null)("role", ctx._config.role)("aria-modal", ctx._config.ariaModal)("aria-labelledby", ctx._config.ariaLabel ? null : ctx._ariaLabelledByQueue[0])("aria-label", ctx._config.ariaLabel)("aria-describedby", ctx._config.ariaDescribedBy || null);
      }
    },
    features: [ɵɵInheritDefinitionFeature],
    decls: 1,
    vars: 0,
    consts: [["cdkPortalOutlet", ""]],
    template: function CdkDialogContainer_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, CdkDialogContainer_ng_template_0_Template, 0, 0, "ng-template", 0);
      }
    },
    dependencies: [CdkPortalOutlet],
    styles: [".cdk-dialog-container {\n  display: block;\n  width: 100%;\n  height: 100%;\n  min-height: inherit;\n  max-height: inherit;\n}\n"],
    encapsulation: 2
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDialogContainer, [{
    type: Component,
    args: [{
      selector: "cdk-dialog-container",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.Default,
      imports: [CdkPortalOutlet],
      host: {
        "class": "cdk-dialog-container",
        "tabindex": "-1",
        "[attr.id]": "_config.id || null",
        "[attr.role]": "_config.role",
        "[attr.aria-modal]": "_config.ariaModal",
        "[attr.aria-labelledby]": "_config.ariaLabel ? null : _ariaLabelledByQueue[0]",
        "[attr.aria-label]": "_config.ariaLabel",
        "[attr.aria-describedby]": "_config.ariaDescribedBy || null"
      },
      template: "<ng-template cdkPortalOutlet />\n",
      styles: [".cdk-dialog-container {\n  display: block;\n  width: 100%;\n  height: 100%;\n  min-height: inherit;\n  max-height: inherit;\n}\n"]
    }]
  }], () => [], {
    _portalOutlet: [{
      type: ViewChild,
      args: [CdkPortalOutlet, {
        static: true
      }]
    }]
  });
})();
var DialogRef = class {
  overlayRef;
  config;
  componentInstance = null;
  componentRef = null;
  containerInstance;
  disableClose;
  closed = new Subject();
  backdropClick;
  keydownEvents;
  outsidePointerEvents;
  id;
  _detachSubscription;
  constructor(overlayRef, config) {
    this.overlayRef = overlayRef;
    this.config = config;
    this.disableClose = config.disableClose;
    this.backdropClick = overlayRef.backdropClick();
    this.keydownEvents = overlayRef.keydownEvents();
    this.outsidePointerEvents = overlayRef.outsidePointerEvents();
    this.id = config.id;
    this.keydownEvents.subscribe((event) => {
      if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
        event.preventDefault();
        this.close(void 0, {
          focusOrigin: "keyboard"
        });
      }
    });
    this.backdropClick.subscribe(() => {
      if (!this.disableClose && this._canClose()) {
        this.close(void 0, {
          focusOrigin: "mouse"
        });
      } else {
        this.containerInstance._recaptureFocus?.();
      }
    });
    this._detachSubscription = overlayRef.detachments().subscribe(() => {
      if (config.closeOnOverlayDetachments !== false) {
        this.close();
      }
    });
  }
  close(result, options) {
    if (this._canClose(result)) {
      const closedSubject = this.closed;
      this.containerInstance._closeInteractionType = options?.focusOrigin || "program";
      this._detachSubscription.unsubscribe();
      this.overlayRef.dispose();
      closedSubject.next(result);
      closedSubject.complete();
      this.componentInstance = this.containerInstance = null;
    }
  }
  updatePosition() {
    this.overlayRef.updatePosition();
    return this;
  }
  updateSize(width = "", height = "") {
    this.overlayRef.updateSize({
      width,
      height
    });
    return this;
  }
  addPanelClass(classes) {
    this.overlayRef.addPanelClass(classes);
    return this;
  }
  removePanelClass(classes) {
    this.overlayRef.removePanelClass(classes);
    return this;
  }
  _canClose(result) {
    const config = this.config;
    return !!this.containerInstance && (!config.closePredicate || config.closePredicate(result, config, this.componentInstance));
  }
};
var DIALOG_SCROLL_STRATEGY = new InjectionToken("DialogScrollStrategy", {
  providedIn: "root",
  factory: () => {
    const injector = inject(Injector);
    return () => createBlockScrollStrategy(injector);
  }
});
var DIALOG_DATA = new InjectionToken("DialogData");
var DEFAULT_DIALOG_CONFIG = new InjectionToken("DefaultDialogConfig");
function getDirectionality(value) {
  const valueSignal = signal(value, ...ngDevMode ? [{
    debugName: "valueSignal"
  }] : []);
  const change = new EventEmitter();
  return {
    valueSignal,
    get value() {
      return valueSignal();
    },
    change,
    ngOnDestroy() {
      change.complete();
    }
  };
}
var Dialog = class _Dialog {
  _injector = inject(Injector);
  _defaultOptions = inject(DEFAULT_DIALOG_CONFIG, {
    optional: true
  });
  _parentDialog = inject(_Dialog, {
    optional: true,
    skipSelf: true
  });
  _overlayContainer = inject(OverlayContainer);
  _idGenerator = inject(_IdGenerator);
  _openDialogsAtThisLevel = [];
  _afterAllClosedAtThisLevel = new Subject();
  _afterOpenedAtThisLevel = new Subject();
  _ariaHiddenElements = /* @__PURE__ */ new Map();
  _scrollStrategy = inject(DIALOG_SCROLL_STRATEGY);
  get openDialogs() {
    return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogsAtThisLevel;
  }
  get afterOpened() {
    return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpenedAtThisLevel;
  }
  afterAllClosed = defer(() => this.openDialogs.length ? this._getAfterAllClosed() : this._getAfterAllClosed().pipe(startWith(void 0)));
  constructor() {
  }
  open(componentOrTemplateRef, config) {
    const defaults = this._defaultOptions || new DialogConfig();
    config = __spreadValues(__spreadValues({}, defaults), config);
    config.id = config.id || this._idGenerator.getId("cdk-dialog-");
    if (config.id && this.getDialogById(config.id) && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }
    const overlayConfig = this._getOverlayConfig(config);
    const overlayRef = createOverlayRef(this._injector, overlayConfig);
    const dialogRef = new DialogRef(overlayRef, config);
    const dialogContainer = this._attachContainer(overlayRef, dialogRef, config);
    dialogRef.containerInstance = dialogContainer;
    if (!this.openDialogs.length) {
      const overlayContainer = this._overlayContainer.getContainerElement();
      if (dialogContainer._focusTrapped) {
        dialogContainer._focusTrapped.pipe(take(1)).subscribe(() => {
          this._hideNonDialogContentFromAssistiveTechnology(overlayContainer);
        });
      } else {
        this._hideNonDialogContentFromAssistiveTechnology(overlayContainer);
      }
    }
    this._attachDialogContent(componentOrTemplateRef, dialogRef, dialogContainer, config);
    this.openDialogs.push(dialogRef);
    dialogRef.closed.subscribe(() => this._removeOpenDialog(dialogRef, true));
    this.afterOpened.next(dialogRef);
    return dialogRef;
  }
  closeAll() {
    reverseForEach(this.openDialogs, (dialog) => dialog.close());
  }
  getDialogById(id) {
    return this.openDialogs.find((dialog) => dialog.id === id);
  }
  ngOnDestroy() {
    reverseForEach(this._openDialogsAtThisLevel, (dialog) => {
      if (dialog.config.closeOnDestroy === false) {
        this._removeOpenDialog(dialog, false);
      }
    });
    reverseForEach(this._openDialogsAtThisLevel, (dialog) => dialog.close());
    this._afterAllClosedAtThisLevel.complete();
    this._afterOpenedAtThisLevel.complete();
    this._openDialogsAtThisLevel = [];
  }
  _getOverlayConfig(config) {
    const state = new OverlayConfig({
      positionStrategy: config.positionStrategy || createGlobalPositionStrategy().centerHorizontally().centerVertically(),
      scrollStrategy: config.scrollStrategy || this._scrollStrategy(),
      panelClass: config.panelClass,
      hasBackdrop: config.hasBackdrop,
      direction: config.direction,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      width: config.width,
      height: config.height,
      disposeOnNavigation: config.closeOnNavigation,
      disableAnimations: config.disableAnimations
    });
    if (config.backdropClass) {
      state.backdropClass = config.backdropClass;
    }
    return state;
  }
  _attachContainer(overlay, dialogRef, config) {
    const userInjector = config.injector || config.viewContainerRef?.injector;
    const providers = [{
      provide: DialogConfig,
      useValue: config
    }, {
      provide: DialogRef,
      useValue: dialogRef
    }, {
      provide: OverlayRef,
      useValue: overlay
    }];
    let containerType;
    if (config.container) {
      if (typeof config.container === "function") {
        containerType = config.container;
      } else {
        containerType = config.container.type;
        providers.push(...config.container.providers(config));
      }
    } else {
      containerType = CdkDialogContainer;
    }
    const containerPortal = new ComponentPortal(containerType, config.viewContainerRef, Injector.create({
      parent: userInjector || this._injector,
      providers
    }));
    const containerRef = overlay.attach(containerPortal);
    return containerRef.instance;
  }
  _attachDialogContent(componentOrTemplateRef, dialogRef, dialogContainer, config) {
    if (componentOrTemplateRef instanceof TemplateRef) {
      const injector = this._createInjector(config, dialogRef, dialogContainer, void 0);
      let context = {
        $implicit: config.data,
        dialogRef
      };
      if (config.templateContext) {
        context = __spreadValues(__spreadValues({}, context), typeof config.templateContext === "function" ? config.templateContext() : config.templateContext);
      }
      dialogContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, null, context, injector));
    } else {
      const injector = this._createInjector(config, dialogRef, dialogContainer, this._injector);
      const contentRef = dialogContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, config.viewContainerRef, injector));
      dialogRef.componentRef = contentRef;
      dialogRef.componentInstance = contentRef.instance;
    }
  }
  _createInjector(config, dialogRef, dialogContainer, fallbackInjector) {
    const userInjector = config.injector || config.viewContainerRef?.injector;
    const providers = [{
      provide: DIALOG_DATA,
      useValue: config.data
    }, {
      provide: DialogRef,
      useValue: dialogRef
    }];
    if (config.providers) {
      if (typeof config.providers === "function") {
        providers.push(...config.providers(dialogRef, config, dialogContainer));
      } else {
        providers.push(...config.providers);
      }
    }
    if (config.direction && (!userInjector || !userInjector.get(Directionality, null, {
      optional: true
    }))) {
      providers.push({
        provide: Directionality,
        useValue: getDirectionality(config.direction)
      });
    }
    return Injector.create({
      parent: userInjector || fallbackInjector,
      providers
    });
  }
  _removeOpenDialog(dialogRef, emitEvent) {
    const index = this.openDialogs.indexOf(dialogRef);
    if (index > -1) {
      this.openDialogs.splice(index, 1);
      if (!this.openDialogs.length) {
        this._ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute("aria-hidden", previousValue);
          } else {
            element.removeAttribute("aria-hidden");
          }
        });
        this._ariaHiddenElements.clear();
        if (emitEvent) {
          this._getAfterAllClosed().next();
        }
      }
    }
  }
  _hideNonDialogContentFromAssistiveTechnology(overlayContainer) {
    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;
      for (let i = siblings.length - 1; i > -1; i--) {
        const sibling = siblings[i];
        if (sibling !== overlayContainer && sibling.nodeName !== "SCRIPT" && sibling.nodeName !== "STYLE" && !sibling.hasAttribute("aria-live") && !sibling.hasAttribute("popover")) {
          this._ariaHiddenElements.set(sibling, sibling.getAttribute("aria-hidden"));
          sibling.setAttribute("aria-hidden", "true");
        }
      }
    }
  }
  _getAfterAllClosed() {
    const parent = this._parentDialog;
    return parent ? parent._getAfterAllClosed() : this._afterAllClosedAtThisLevel;
  }
  static ɵfac = function Dialog_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Dialog)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _Dialog,
    factory: _Dialog.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Dialog, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
function reverseForEach(items, callback) {
  let i = items.length;
  while (i--) {
    callback(items[i]);
  }
}
var DialogModule = class _DialogModule {
  static ɵfac = function DialogModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DialogModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _DialogModule,
    imports: [OverlayModule, PortalModule, A11yModule, CdkDialogContainer],
    exports: [PortalModule, CdkDialogContainer]
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [Dialog],
    imports: [OverlayModule, PortalModule, A11yModule, PortalModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogModule, [{
    type: NgModule,
    args: [{
      imports: [OverlayModule, PortalModule, A11yModule, CdkDialogContainer],
      exports: [PortalModule, CdkDialogContainer],
      providers: [Dialog]
    }]
  }], null, null);
})();

// ../../../node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-dialog.mjs
var defaultOptions = {
  ariaLabel: void 0,
  ariaModal: true,
  attachPositions: [],
  attachTo: null,
  autoFocus: "first-tabbable",
  backdropClass: "",
  closeDelay: 100,
  closeOnBackdropClick: true,
  closeOnOutsidePointerEvents: false,
  disableClose: false,
  hasBackdrop: true,
  panelClass: "",
  positionStrategy: null,
  restoreFocus: true,
  role: "dialog",
  scrollStrategy: null
};
var BRN_DIALOG_DEFAULT_OPTIONS = new InjectionToken("brn-dialog-default-options", {
  providedIn: "root",
  factory: () => defaultOptions
});
function provideBrnDialogDefaultOptions(options) {
  return {
    provide: BRN_DIALOG_DEFAULT_OPTIONS,
    useValue: __spreadValues(__spreadValues({}, defaultOptions), options)
  };
}
function injectBrnDialogDefaultOptions() {
  return inject(BRN_DIALOG_DEFAULT_OPTIONS, {
    optional: true
  }) ?? defaultOptions;
}
var cssClassesToArray = (classes, defaultClass = "") => {
  if (typeof classes === "string") {
    const splitClasses = classes.trim().split(" ");
    if (splitClasses.length === 0) {
      return [defaultClass];
    }
    return splitClasses;
  }
  return classes ?? [];
};
var BrnDialogRef = class {
  _cdkDialogRef;
  _open;
  state;
  dialogId;
  _closing$ = new Subject();
  closing$ = this._closing$.asObservable();
  closed$;
  _previousTimeout;
  get open() {
    return this.state() === "open";
  }
  _options = signal(void 0, ...ngDevMode ? [{
    debugName: "_options"
  }] : []);
  options = this._options.asReadonly();
  constructor(_cdkDialogRef, _open, state, dialogId, _options) {
    this._cdkDialogRef = _cdkDialogRef;
    this._open = _open;
    this.state = state;
    this.dialogId = dialogId;
    if (_options) {
      this._options.set(_options);
    }
    this.closed$ = this._cdkDialogRef.closed.pipe(take(1));
  }
  updateOptions(options) {
    this._options.update((prev) => __spreadValues(__spreadValues({}, prev ?? {}), options));
  }
  close(result, delay = this._options()?.closeDelay ?? 0) {
    if (!this.open || this._options()?.disableClose) return;
    this._closing$.next();
    this._open.set(false);
    if (this._previousTimeout) {
      clearTimeout(this._previousTimeout);
    }
    this._previousTimeout = setTimeout(() => {
      this._cdkDialogRef.close(result);
    }, delay);
  }
  setPanelClass(paneClass) {
    this._cdkDialogRef.config.panelClass = cssClassesToArray(paneClass);
  }
  setOverlayClass(overlayClass) {
    this._cdkDialogRef.config.backdropClass = cssClassesToArray(overlayClass);
  }
  setAriaDescribedBy(ariaDescribedBy) {
    this._cdkDialogRef.config.ariaDescribedBy = ariaDescribedBy;
  }
  setAriaLabelledBy(ariaLabelledBy) {
    this._cdkDialogRef.config.ariaLabelledBy = ariaLabelledBy;
  }
  setAriaLabel(ariaLabel) {
    this._cdkDialogRef.config.ariaLabel = ariaLabel;
  }
  updatePosition() {
    this._cdkDialogRef.overlayRef?.updatePosition();
  }
};
var dialogSequence = 0;
var injectBrnDialogCtx = () => {
  return inject(DIALOG_DATA);
};
var injectBrnDialogContext = (options = {}) => {
  return inject(DIALOG_DATA, options);
};
var BrnDialogService = class _BrnDialogService {
  _overlayCloseDispatcher = inject(OverlayOutsideClickDispatcher);
  _cdkDialog = inject(Dialog);
  _rendererFactory = inject(RendererFactory2);
  _renderer = this._rendererFactory.createRenderer(null, null);
  _positionBuilder = inject(OverlayPositionBuilder);
  _sso = inject(ScrollStrategyOptions);
  _injector = inject(Injector);
  _defaultOptions = injectBrnDialogDefaultOptions();
  open(content, vcr, context, options) {
    if (options?.id && this._cdkDialog.getDialogById(options.id)) {
      throw new Error(`Dialog with ID: ${options.id} already exists`);
    }
    const attachTo = options?.attachTo ?? this._defaultOptions.attachTo;
    const positionStrategy = options?.positionStrategy ?? this._defaultOptions.positionStrategy ?? (attachTo && options?.attachPositions && options?.attachPositions?.length > 0 ? this._positionBuilder?.flexibleConnectedTo(attachTo).withPositions(options.attachPositions ?? []) : this._positionBuilder.global().centerHorizontally().centerVertically());
    let brnDialogRef;
    const effectRefs = [];
    const contextOrData = __spreadProps(__spreadValues({}, context), {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      close: (result = void 0) => brnDialogRef.close(result, options?.closeDelay)
    });
    const destroyed$ = new Subject();
    const optionsChanged$ = new Subject();
    const open = signal(true, ...ngDevMode ? [{
      debugName: "open"
    }] : []);
    const state = computed(() => open() ? "open" : "closed", ...ngDevMode ? [{
      debugName: "state"
    }] : []);
    const dialogId = ++dialogSequence;
    const cdkDialogRef = this._cdkDialog.open(content, {
      id: options?.id ?? `brn-dialog-${dialogId}`,
      role: options?.role ?? this._defaultOptions.role,
      viewContainerRef: vcr,
      templateContext: () => ({
        $implicit: contextOrData
      }),
      data: contextOrData,
      hasBackdrop: options?.hasBackdrop ?? this._defaultOptions.hasBackdrop,
      panelClass: options?.panelClass,
      backdropClass: options?.backdropClass,
      positionStrategy,
      scrollStrategy: options?.scrollStrategy ?? this._defaultOptions.scrollStrategy ?? this._sso?.block(),
      restoreFocus: options?.restoreFocus ?? this._defaultOptions.restoreFocus,
      disableClose: true,
      autoFocus: options?.autoFocus ?? this._defaultOptions.autoFocus,
      ariaDescribedBy: options?.ariaDescribedBy ?? `brn-dialog-description-${dialogId}`,
      ariaLabelledBy: options?.ariaLabelledBy ?? `brn-dialog-title-${dialogId}`,
      ariaLabel: options?.ariaLabel ?? this._defaultOptions.ariaLabel,
      ariaModal: options?.ariaModal ?? this._defaultOptions.ariaModal,
      providers: (cdkDialogRef2) => {
        brnDialogRef = new BrnDialogRef(cdkDialogRef2, open, state, dialogId, options);
        runInInjectionContext(this._injector, () => {
          const ref = effect(() => {
            if (overlay) {
              this._renderer.setAttribute(overlay, "data-state", state());
            }
            if (backdrop) {
              this._renderer.setAttribute(backdrop, "data-state", state());
            }
          }, ...ngDevMode ? [{
            debugName: "ref"
          }] : []);
          effectRefs.push(ref);
        });
        const providers = [{
          provide: BrnDialogRef,
          useValue: brnDialogRef
        }];
        if (options?.providers) {
          if (typeof options.providers === "function") {
            providers.push(...options.providers());
          }
          if (Array.isArray(options.providers)) {
            providers.push(...options.providers);
          }
        }
        return providers;
      }
    });
    const overlay = cdkDialogRef.overlayRef.overlayElement;
    const backdrop = cdkDialogRef.overlayRef.backdropElement;
    runInInjectionContext(this._injector, () => {
      const optionChangeEffect = effect(() => {
        const options2 = brnDialogRef.options();
        optionsChanged$.next();
        const closeOnOutsidePointerEvents = options2?.closeOnOutsidePointerEvents ?? this._defaultOptions.closeOnOutsidePointerEvents;
        if (closeOnOutsidePointerEvents) {
          cdkDialogRef.outsidePointerEvents.pipe(takeUntil(merge(destroyed$, optionsChanged$))).subscribe(() => {
            const overlays = this._overlayCloseDispatcher._attachedOverlays;
            const index = overlays.indexOf(cdkDialogRef.overlayRef);
            if (index === overlays.length - 1 || overlays.length > 1 && !this.isNested(cdkDialogRef.overlayRef, overlays.at(-1))) {
              brnDialogRef.close(void 0, options2?.closeDelay);
            }
          });
        }
        const closeOnBackdropClick = options2?.closeOnBackdropClick ?? this._defaultOptions.closeOnBackdropClick;
        if (closeOnBackdropClick) {
          cdkDialogRef.backdropClick.pipe(takeUntil(merge(destroyed$, optionsChanged$))).subscribe(() => {
            brnDialogRef.close(void 0, options2?.closeDelay);
          });
        }
        const disableClose = options2?.disableClose ?? this._defaultOptions.disableClose;
        if (!disableClose) {
          cdkDialogRef.keydownEvents.pipe(filter((e) => e.key === "Escape"), takeUntil(merge(destroyed$, optionsChanged$))).subscribe(() => {
            brnDialogRef.close(void 0, options2?.closeDelay);
          });
        }
      }, ...ngDevMode ? [{
        debugName: "optionChangeEffect"
      }] : []);
      effectRefs.push(optionChangeEffect);
    });
    cdkDialogRef.closed.pipe(takeUntil(destroyed$)).subscribe(() => {
      effectRefs.forEach((a) => a.destroy());
      destroyed$.next();
      optionsChanged$.next();
    });
    if ("_changeDetectorRef" in cdkDialogRef.containerInstance) {
      const containerInstance = cdkDialogRef.containerInstance;
      containerInstance._changeDetectorRef.detectChanges();
    }
    return brnDialogRef;
  }
  isNested(parent, child) {
    const childOrigin = child.getConfig().positionStrategy._origin;
    if (!childOrigin) {
      return false;
    } else if ("width" in childOrigin && "height" in childOrigin) {
      const rect = parent.hostElement.getBoundingClientRect();
      return childOrigin.x >= rect.left && childOrigin.x <= rect.right && childOrigin.y >= rect.top && childOrigin.y <= rect.bottom;
    } else {
      const element = childOrigin.nativeElement || childOrigin;
      return parent.hostElement.contains(element);
    }
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogService)();
  };
  /** @nocollapse */
  static ɵprov = ɵɵdefineInjectable({
    token: _BrnDialogService,
    factory: _BrnDialogService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var BrnDialog = class _BrnDialog {
  _dialogService = inject(BrnDialogService);
  _destroyRef = inject(DestroyRef);
  _vcr = inject(ViewContainerRef);
  positionBuilder = inject(OverlayPositionBuilder);
  ssos = inject(ScrollStrategyOptions);
  _injector = inject(Injector);
  _defaultOptions = injectBrnDialogDefaultOptions();
  _context = {};
  stateComputed = computed(() => this._dialogRef()?.state() ?? "closed", ...ngDevMode ? [{
    debugName: "stateComputed"
  }] : []);
  _contentTemplate;
  _dialogRef = signal(void 0, ...ngDevMode ? [{
    debugName: "_dialogRef"
  }] : []);
  _dialogStateEffectRefs = [];
  _backdropClass = signal(null, ...ngDevMode ? [{
    debugName: "_backdropClass"
  }] : []);
  _panelClass = signal(null, ...ngDevMode ? [{
    debugName: "_panelClass"
  }] : []);
  closed = output();
  stateChanged = output();
  state = input(null, ...ngDevMode ? [{
    debugName: "state"
  }] : []);
  role = input(this._defaultOptions.role, ...ngDevMode ? [{
    debugName: "role"
  }] : []);
  hasBackdrop = input(this._defaultOptions.hasBackdrop, ...ngDevMode ? [{
    debugName: "hasBackdrop",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  positionStrategy = input(this._defaultOptions.positionStrategy, ...ngDevMode ? [{
    debugName: "positionStrategy"
  }] : []);
  mutablePositionStrategy = linkedSignal(() => this.positionStrategy(), ...ngDevMode ? [{
    debugName: "mutablePositionStrategy"
  }] : []);
  scrollStrategy = input(this._defaultOptions.scrollStrategy, ...ngDevMode ? [{
    debugName: "scrollStrategy"
  }] : []);
  _options = computed(() => {
    const scrollStrategyInput = this.scrollStrategy();
    let scrollStrategy;
    if (scrollStrategyInput === "close") {
      scrollStrategy = this.ssos.close();
    } else if (scrollStrategyInput === "reposition") {
      scrollStrategy = this.ssos.reposition();
    } else {
      scrollStrategy = scrollStrategyInput;
    }
    return {
      role: this.role(),
      hasBackdrop: this.hasBackdrop(),
      positionStrategy: this.mutablePositionStrategy(),
      scrollStrategy,
      restoreFocus: this.restoreFocus(),
      closeOnOutsidePointerEvents: this.mutableCloseOnOutsidePointerEvents(),
      closeOnBackdropClick: this.closeOnBackdropClick(),
      attachTo: this.mutableAttachTo(),
      attachPositions: this.mutableAttachPositions(),
      autoFocus: this.autoFocus(),
      closeDelay: this.closeDelay(),
      disableClose: this.disableClose(),
      backdropClass: cssClassesToArray(this._backdropClass() ?? this._defaultOptions.backdropClass),
      panelClass: cssClassesToArray(this._panelClass() ?? this._defaultOptions.panelClass),
      ariaDescribedBy: this._mutableAriaDescribedBy(),
      ariaLabelledBy: this._mutableAriaLabelledBy(),
      ariaLabel: this._mutableAriaLabel(),
      ariaModal: this._mutableAriaModal()
    };
  }, ...ngDevMode ? [{
    debugName: "_options"
  }] : []);
  constructor() {
    afterNextRender(() => {
      effect(() => {
        const state = this.state();
        if (state === "open") {
          untracked(() => this.open());
        }
        if (state === "closed") {
          untracked(() => this.close());
        }
      }, {
        injector: this._injector
      });
    });
  }
  restoreFocus = input(this._defaultOptions.restoreFocus, ...ngDevMode ? [{
    debugName: "restoreFocus"
  }] : []);
  closeOnOutsidePointerEvents = input(this._defaultOptions.closeOnOutsidePointerEvents, ...ngDevMode ? [{
    debugName: "closeOnOutsidePointerEvents",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  mutableCloseOnOutsidePointerEvents = linkedSignal(() => this.closeOnOutsidePointerEvents(), ...ngDevMode ? [{
    debugName: "mutableCloseOnOutsidePointerEvents"
  }] : []);
  closeOnBackdropClick = input(this._defaultOptions.closeOnBackdropClick, ...ngDevMode ? [{
    debugName: "closeOnBackdropClick",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  attachTo = input(null, ...ngDevMode ? [{
    debugName: "attachTo"
  }] : []);
  mutableAttachTo = linkedSignal(() => this.attachTo(), ...ngDevMode ? [{
    debugName: "mutableAttachTo"
  }] : []);
  attachPositions = input(this._defaultOptions.attachPositions, ...ngDevMode ? [{
    debugName: "attachPositions"
  }] : []);
  mutableAttachPositions = linkedSignal(() => this.attachPositions(), ...ngDevMode ? [{
    debugName: "mutableAttachPositions"
  }] : []);
  autoFocus = input(this._defaultOptions.autoFocus, ...ngDevMode ? [{
    debugName: "autoFocus"
  }] : []);
  closeDelay = input(this._defaultOptions.closeDelay, ...ngDevMode ? [{
    debugName: "closeDelay",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  disableClose = input(this._defaultOptions.disableClose, ...ngDevMode ? [{
    debugName: "disableClose",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  ariaDescribedBy = input(null, ...ngDevMode ? [{
    debugName: "ariaDescribedBy",
    alias: "aria-describedby"
  }] : [{
    alias: "aria-describedby"
  }]);
  _mutableAriaDescribedBy = linkedSignal(() => this.ariaDescribedBy(), ...ngDevMode ? [{
    debugName: "_mutableAriaDescribedBy"
  }] : []);
  ariaLabelledBy = input(null, ...ngDevMode ? [{
    debugName: "ariaLabelledBy",
    alias: "aria-labelledby"
  }] : [{
    alias: "aria-labelledby"
  }]);
  _mutableAriaLabelledBy = linkedSignal(() => this.ariaLabelledBy(), ...ngDevMode ? [{
    debugName: "_mutableAriaLabelledBy"
  }] : []);
  ariaLabel = input(null, ...ngDevMode ? [{
    debugName: "ariaLabel",
    alias: "aria-label"
  }] : [{
    alias: "aria-label"
  }]);
  _mutableAriaLabel = linkedSignal(() => this.ariaLabel(), ...ngDevMode ? [{
    debugName: "_mutableAriaLabel"
  }] : []);
  ariaModal = input(true, ...ngDevMode ? [{
    debugName: "ariaModal",
    alias: "aria-modal",
    transform: booleanAttribute
  }] : [{
    alias: "aria-modal",
    transform: booleanAttribute
  }]);
  _mutableAriaModal = linkedSignal(() => this.ariaModal(), ...ngDevMode ? [{
    debugName: "_mutableAriaModal"
  }] : []);
  open() {
    if (!this._contentTemplate || this._dialogRef()) return;
    this._dialogStateEffectRefs.forEach((ref) => ref.destroy());
    const dialogRef = this._dialogService.open(this._contentTemplate, this._vcr, this._context, this._options());
    this._dialogRef.set(dialogRef);
    runInInjectionContext(this._injector, () => {
      this._dialogStateEffectRefs.push(effect(() => {
        const state = dialogRef.state();
        untracked(() => this.stateChanged.emit(state));
      }), effect(() => dialogRef.updateOptions(this._options())));
    });
    dialogRef.closed$.pipe(take(1), takeUntilDestroyed(this._destroyRef)).subscribe((result) => {
      this._dialogRef.set(void 0);
      this.closed.emit(result);
    });
  }
  close(result, delay) {
    this._dialogRef()?.close(result, delay ?? this._options().closeDelay);
  }
  registerTemplate(template) {
    this._contentTemplate = template;
  }
  setOverlayClass(overlayClass) {
    this._backdropClass.set(overlayClass);
    this._dialogRef()?.setOverlayClass(overlayClass);
  }
  setPanelClass(panelClass) {
    this._panelClass.set(panelClass ?? "");
    this._dialogRef()?.setPanelClass(panelClass);
  }
  setContext(context) {
    this._context = __spreadValues(__spreadValues({}, this._context), context);
  }
  setAriaDescribedBy(ariaDescribedBy) {
    this._mutableAriaDescribedBy.set(ariaDescribedBy);
    this._dialogRef()?.setAriaDescribedBy(ariaDescribedBy);
  }
  setAriaLabelledBy(ariaLabelledBy) {
    this._mutableAriaLabelledBy.set(ariaLabelledBy);
    this._dialogRef()?.setAriaLabelledBy(ariaLabelledBy);
  }
  setAriaLabel(ariaLabel) {
    this._mutableAriaLabel.set(ariaLabel);
    this._dialogRef()?.setAriaLabel(ariaLabel);
  }
  setAriaModal(ariaModal) {
    this._mutableAriaModal.set(ariaModal);
  }
  updatePosition() {
    this._dialogRef()?.updatePosition();
  }
  /** @nocollapse */
  static ɵfac = function BrnDialog_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialog)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialog,
    selectors: [["", "brnDialog", ""], ["brn-dialog"]],
    inputs: {
      state: [1, "state"],
      role: [1, "role"],
      hasBackdrop: [1, "hasBackdrop"],
      positionStrategy: [1, "positionStrategy"],
      scrollStrategy: [1, "scrollStrategy"],
      restoreFocus: [1, "restoreFocus"],
      closeOnOutsidePointerEvents: [1, "closeOnOutsidePointerEvents"],
      closeOnBackdropClick: [1, "closeOnBackdropClick"],
      attachTo: [1, "attachTo"],
      attachPositions: [1, "attachPositions"],
      autoFocus: [1, "autoFocus"],
      closeDelay: [1, "closeDelay"],
      disableClose: [1, "disableClose"],
      ariaDescribedBy: [1, "aria-describedby", "ariaDescribedBy"],
      ariaLabelledBy: [1, "aria-labelledby", "ariaLabelledBy"],
      ariaLabel: [1, "aria-label", "ariaLabel"],
      ariaModal: [1, "aria-modal", "ariaModal"]
    },
    outputs: {
      closed: "closed",
      stateChanged: "stateChanged"
    },
    exportAs: ["brnDialog"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialog, [{
    type: Directive,
    args: [{
      selector: "[brnDialog],brn-dialog",
      exportAs: "brnDialog"
    }]
  }], () => [], {
    closed: [{
      type: Output,
      args: ["closed"]
    }],
    stateChanged: [{
      type: Output,
      args: ["stateChanged"]
    }],
    state: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "state",
        required: false
      }]
    }],
    role: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "role",
        required: false
      }]
    }],
    hasBackdrop: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "hasBackdrop",
        required: false
      }]
    }],
    positionStrategy: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "positionStrategy",
        required: false
      }]
    }],
    scrollStrategy: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "scrollStrategy",
        required: false
      }]
    }],
    restoreFocus: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "restoreFocus",
        required: false
      }]
    }],
    closeOnOutsidePointerEvents: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "closeOnOutsidePointerEvents",
        required: false
      }]
    }],
    closeOnBackdropClick: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "closeOnBackdropClick",
        required: false
      }]
    }],
    attachTo: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "attachTo",
        required: false
      }]
    }],
    attachPositions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "attachPositions",
        required: false
      }]
    }],
    autoFocus: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "autoFocus",
        required: false
      }]
    }],
    closeDelay: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "closeDelay",
        required: false
      }]
    }],
    disableClose: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "disableClose",
        required: false
      }]
    }],
    ariaDescribedBy: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-describedby",
        required: false
      }]
    }],
    ariaLabelledBy: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-labelledby",
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
    ariaModal: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "aria-modal",
        required: false
      }]
    }]
  });
})();
var BrnDialogClose = class _BrnDialogClose {
  _brnDialogRef = inject(BrnDialogRef);
  delay = input(void 0, ...ngDevMode ? [{
    debugName: "delay",
    transform: coerceNumberProperty
  }] : [{
    transform: coerceNumberProperty
  }]);
  close() {
    this._brnDialogRef.close(void 0, this.delay());
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogClose_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogClose)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogClose,
    selectors: [["button", "brnDialogClose", ""]],
    hostBindings: function BrnDialogClose_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("click", function BrnDialogClose_click_HostBindingHandler() {
          return ctx.close();
        });
      }
    },
    inputs: {
      delay: [1, "delay"]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogClose, [{
    type: Directive,
    args: [{
      selector: "button[brnDialogClose]",
      host: {
        "(click)": "close()"
      }
    }]
  }], null, {
    delay: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "delay",
        required: false
      }]
    }]
  });
})();
var BrnDialogContent = class _BrnDialogContent {
  _brnDialog = inject(BrnDialog, {
    optional: true
  });
  _brnDialogRef = inject(BrnDialogRef, {
    optional: true
  });
  _template = inject(TemplateRef);
  state = computed(() => this._brnDialog?.stateComputed() ?? this._brnDialogRef?.state() ?? "closed", ...ngDevMode ? [{
    debugName: "state"
  }] : []);
  className = input(void 0, ...ngDevMode ? [{
    debugName: "className",
    alias: "class"
  }] : [{
    alias: "class"
  }]);
  context = input(void 0, ...ngDevMode ? [{
    debugName: "context"
  }] : []);
  constructor() {
    if (!this._brnDialog) return;
    this._brnDialog.registerTemplate(this._template);
    effect(() => {
      const context = this.context();
      if (!this._brnDialog || !context) return;
      untracked(() => this._brnDialog?.setContext(context));
    });
    effect(() => {
      if (!this._brnDialog) return;
      const newClass = this.className();
      untracked(() => this._brnDialog?.setPanelClass(newClass));
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogContent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogContent)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogContent,
    selectors: [["", "brnDialogContent", ""]],
    inputs: {
      className: [1, "class", "className"],
      context: [1, "context"]
    },
    features: [ɵɵProvidersFeature([provideExposesStateProviderExisting(() => _BrnDialogContent)])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogContent, [{
    type: Directive,
    args: [{
      selector: "[brnDialogContent]",
      providers: [provideExposesStateProviderExisting(() => BrnDialogContent)]
    }]
  }], () => [], {
    className: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "class",
        required: false
      }]
    }],
    context: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "context",
        required: false
      }]
    }]
  });
})();
var BrnDialogDescription = class _BrnDialogDescription {
  _brnDialogRef = inject(BrnDialogRef);
  _id = signal(`brn-dialog-description-${this._brnDialogRef?.dialogId}`, ...ngDevMode ? [{
    debugName: "_id"
  }] : []);
  constructor() {
    effect(() => {
      this._brnDialogRef.setAriaDescribedBy(this._id());
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogDescription_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogDescription)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogDescription,
    selectors: [["", "brnDialogDescription", ""]],
    hostVars: 1,
    hostBindings: function BrnDialogDescription_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵdomProperty("id", ctx._id());
      }
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogDescription, [{
    type: Directive,
    args: [{
      selector: "[brnDialogDescription]",
      host: {
        "[id]": "_id()"
      }
    }]
  }], () => [], null);
})();
var BrnDialogOverlay = class _BrnDialogOverlay {
  _brnDialog = inject(BrnDialog);
  className = input(void 0, ...ngDevMode ? [{
    debugName: "className",
    alias: "class"
  }] : [{
    alias: "class"
  }]);
  constructor() {
    effect(() => {
      if (!this._brnDialog) return;
      const newClass = this.className();
      untracked(() => this._brnDialog.setOverlayClass(newClass));
    });
  }
  setClassToCustomElement(newClass) {
    this._brnDialog.setOverlayClass(newClass);
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogOverlay_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogOverlay)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogOverlay,
    selectors: [["", "brnDialogOverlay", ""], ["brn-dialog-overlay"]],
    inputs: {
      className: [1, "class", "className"]
    },
    features: [ɵɵProvidersFeature([provideCustomClassSettableExisting(() => _BrnDialogOverlay)])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogOverlay, [{
    type: Directive,
    args: [{
      selector: "[brnDialogOverlay],brn-dialog-overlay",
      providers: [provideCustomClassSettableExisting(() => BrnDialogOverlay)]
    }]
  }], () => [], {
    className: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "class",
        required: false
      }]
    }]
  });
})();
var BrnDialogTitle = class _BrnDialogTitle {
  _brnDialogRef = inject(BrnDialogRef);
  _id = signal(`brn-dialog-title-${this._brnDialogRef?.dialogId}`, ...ngDevMode ? [{
    debugName: "_id"
  }] : []);
  constructor() {
    effect(() => {
      this._brnDialogRef.setAriaLabelledBy(this._id());
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogTitle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogTitle)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogTitle,
    selectors: [["", "brnDialogTitle", ""]],
    hostVars: 1,
    hostBindings: function BrnDialogTitle_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵdomProperty("id", ctx._id());
      }
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogTitle, [{
    type: Directive,
    args: [{
      selector: "[brnDialogTitle]",
      host: {
        "[id]": "_id()"
      }
    }]
  }], () => [], null);
})();
var idSequence = 0;
var BrnDialogTrigger = class _BrnDialogTrigger {
  _brnDialog = inject(BrnDialog, {
    optional: true
  });
  _brnDialogRef = inject(BrnDialogRef, {
    optional: true
  });
  id = input(`brn-dialog-trigger-${++idSequence}`, ...ngDevMode ? [{
    debugName: "id"
  }] : []);
  type = input("button", ...ngDevMode ? [{
    debugName: "type"
  }] : []);
  state = computed(() => {
    const dialogFromInput = this.brnDialogTriggerForState();
    if (dialogFromInput) {
      return dialogFromInput.stateComputed();
    }
    if (this._brnDialog) {
      return this._brnDialog.stateComputed();
    }
    if (this._brnDialogRef) {
      return this._brnDialogRef.state();
    }
    return "closed";
  }, ...ngDevMode ? [{
    debugName: "state"
  }] : []);
  dialogId = `brn-dialog-${this._brnDialogRef?.dialogId ?? ++idSequence}`;
  brnDialogTriggerFor = input(void 0, ...ngDevMode ? [{
    debugName: "brnDialogTriggerFor",
    alias: "brnDialogTriggerFor"
  }] : [{
    alias: "brnDialogTriggerFor"
  }]);
  mutableBrnDialogTriggerFor = computed(() => signal(this.brnDialogTriggerFor()), ...ngDevMode ? [{
    debugName: "mutableBrnDialogTriggerFor"
  }] : []);
  brnDialogTriggerForState = computed(() => this.mutableBrnDialogTriggerFor()(), ...ngDevMode ? [{
    debugName: "brnDialogTriggerForState"
  }] : []);
  constructor() {
    effect(() => {
      const brnDialog = this.brnDialogTriggerForState();
      if (!brnDialog) return;
      this._brnDialog = brnDialog;
    });
  }
  open() {
    this._brnDialog?.open();
  }
  /** @nocollapse */
  static ɵfac = function BrnDialogTrigger_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnDialogTrigger)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnDialogTrigger,
    selectors: [["button", "brnDialogTrigger", ""], ["button", "brnDialogTriggerFor", ""]],
    hostAttrs: ["aria-haspopup", "dialog"],
    hostVars: 5,
    hostBindings: function BrnDialogTrigger_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("click", function BrnDialogTrigger_click_HostBindingHandler() {
          return ctx.open();
        });
      }
      if (rf & 2) {
        ɵɵdomProperty("id", ctx.id())("type", ctx.type());
        ɵɵattribute("aria-expanded", ctx.state() === "open" ? "true" : "false")("data-state", ctx.state())("aria-controls", ctx.dialogId);
      }
    },
    inputs: {
      id: [1, "id"],
      type: [1, "type"],
      brnDialogTriggerFor: [1, "brnDialogTriggerFor"]
    },
    exportAs: ["brnDialogTrigger"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnDialogTrigger, [{
    type: Directive,
    args: [{
      selector: "button[brnDialogTrigger],button[brnDialogTriggerFor]",
      exportAs: "brnDialogTrigger",
      host: {
        "[id]": "id()",
        "(click)": "open()",
        "aria-haspopup": "dialog",
        "[attr.aria-expanded]": "state() === 'open' ? 'true': 'false'",
        "[attr.data-state]": "state()",
        "[attr.aria-controls]": "dialogId",
        "[type]": "type()"
      }
    }]
  }], () => [], {
    id: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "id",
        required: false
      }]
    }],
    type: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "type",
        required: false
      }]
    }],
    brnDialogTriggerFor: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "brnDialogTriggerFor",
        required: false
      }]
    }]
  });
})();
var BrnDialogImports = [BrnDialog, BrnDialogOverlay, BrnDialogTrigger, BrnDialogClose, BrnDialogContent, BrnDialogTitle, BrnDialogDescription];

export {
  defaultOptions,
  provideBrnDialogDefaultOptions,
  injectBrnDialogDefaultOptions,
  cssClassesToArray,
  BrnDialogRef,
  injectBrnDialogCtx,
  injectBrnDialogContext,
  BrnDialogService,
  BrnDialog,
  BrnDialogClose,
  BrnDialogContent,
  BrnDialogDescription,
  BrnDialogOverlay,
  BrnDialogTitle,
  BrnDialogTrigger,
  BrnDialogImports
};
//# sourceMappingURL=chunk-L3XMOPD4.js.map
