(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./views/admin/admin.module": [
		"./src/app/views/admin/admin.module.ts",
		"default~views-admin-admin-module~views-advisor-advisor-module~views-customer-customer-module~views-l~f1bd1502",
		"views-admin-admin-module"
	],
	"./views/advisor/advisor.module": [
		"./src/app/views/advisor/advisor.module.ts",
		"default~views-admin-admin-module~views-advisor-advisor-module~views-customer-customer-module~views-l~f1bd1502",
		"views-advisor-advisor-module"
	],
	"./views/auth/auth.module": [
		"./src/app/views/auth/auth.module.ts",
		"views-auth-auth-module"
	],
	"./views/customer/customer.module": [
		"./src/app/views/customer/customer.module.ts",
		"default~views-admin-admin-module~views-advisor-advisor-module~views-customer-customer-module~views-l~f1bd1502",
		"views-customer-customer-module"
	],
	"./views/landing/landing.module": [
		"./src/app/views/landing/landing.module.ts",
		"default~views-admin-admin-module~views-advisor-advisor-module~views-customer-customer-module~views-l~f1bd1502",
		"views-landing-landing-module"
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids) {
		return Promise.resolve().then(function() {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		var id = ids[0];
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>\r\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _shared_services_route_parts_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shared/services/route-parts.service */ "./src/app/shared/services/route-parts.service.ts");
/* harmony import */ var _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shared/services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var AppComponent = /** @class */ (function () {
    function AppComponent(title, router, activeRoute, routePartsService, themeService, renderer) {
        this.title = title;
        this.router = router;
        this.activeRoute = activeRoute;
        this.routePartsService = routePartsService;
        this.themeService = themeService;
        this.renderer = renderer;
        this.appTitle = 'Egret';
        this.pageTitle = '';
    }
    AppComponent.prototype.ngOnInit = function () {
        this.changePageTitle();
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        this.themeService.applyMatTheme(this.renderer);
    };
    AppComponent.prototype.changePageTitle = function () {
        var _this = this;
        this.router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_2__["NavigationEnd"]; })).subscribe(function (routeChange) {
            var routeParts = _this.routePartsService.generateRouteParts(_this.activeRoute.snapshot);
            if (!routeParts.length)
                return _this.title.setTitle(_this.appTitle);
            // Extract title from parts;
            _this.pageTitle = routeParts
                .reverse()
                .map(function (part) { return part.title; })
                .reduce(function (partA, partI) { return partA + " > " + partI; });
            _this.pageTitle += " | " + _this.appTitle;
            _this.title.setTitle(_this.pageTitle);
        });
    };
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["Title"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
            _shared_services_route_parts_service__WEBPACK_IMPORTED_MODULE_3__["RoutePartsService"],
            _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_4__["ThemeService"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: HttpLoaderFactory, AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpLoaderFactory", function() { return HttpLoaderFactory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ngx-perfect-scrollbar */ "./node_modules/ngx-perfect-scrollbar/dist/ngx-perfect-scrollbar.es5.js");
/* harmony import */ var angular_in_memory_web_api__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! angular-in-memory-web-api */ "./node_modules/angular-in-memory-web-api/index.js");
/* harmony import */ var _shared_inmemory_db_inmemory_db_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./shared/inmemory-db/inmemory-db.service */ "./src/app/shared/inmemory-db/inmemory-db.service.ts");
/* harmony import */ var _app_routing__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./app.routing */ "./src/app/app.routing.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @ngx-translate/http-loader */ "./node_modules/@ngx-translate/http-loader/esm5/ngx-translate-http-loader.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};














// AoT requires an exported function for factories
function HttpLoaderFactory(httpClient) {
    return new _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_13__["TranslateHttpLoader"](httpClient);
}
var DEFAULT_PERFECT_SCROLLBAR_CONFIG = {
    suppressScrollX: true
};
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["BrowserModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__["BrowserAnimationsModule"],
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_9__["SharedModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_11__["HttpClientModule"],
                ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_5__["PerfectScrollbarModule"],
                _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateModule"].forRoot({
                    loader: {
                        provide: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateLoader"],
                        useFactory: HttpLoaderFactory,
                        deps: [_angular_common_http__WEBPACK_IMPORTED_MODULE_11__["HttpClient"]]
                    }
                }),
                angular_in_memory_web_api__WEBPACK_IMPORTED_MODULE_6__["InMemoryWebApiModule"].forRoot(_shared_inmemory_db_inmemory_db_service__WEBPACK_IMPORTED_MODULE_7__["InMemoryDataService"], { passThruUnknownUrl: true }),
                _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(_app_routing__WEBPACK_IMPORTED_MODULE_8__["rootRouterConfig"], { useHash: false })
            ],
            declarations: [_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"]],
            providers: [
                { provide: _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["HAMMER_GESTURE_CONFIG"], useClass: _angular_material__WEBPACK_IMPORTED_MODULE_4__["GestureConfig"] },
                { provide: ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_5__["PERFECT_SCROLLBAR_CONFIG"], useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
            ],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/app.routing.ts":
/*!********************************!*\
  !*** ./src/app/app.routing.ts ***!
  \********************************/
/*! exports provided: rootRouterConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rootRouterConfig", function() { return rootRouterConfig; });
/* harmony import */ var _shared_components_layouts_admin_layout_admin_layout_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared/components/layouts/admin-layout/admin-layout.component */ "./src/app/shared/components/layouts/admin-layout/admin-layout.component.ts");
/* harmony import */ var _shared_components_layouts_advisor_layout_advisor_layout_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared/components/layouts/advisor-layout/advisor-layout.component */ "./src/app/shared/components/layouts/advisor-layout/advisor-layout.component.ts");
/* harmony import */ var _shared_components_layouts_auth_layout_auth_layout_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/components/layouts/auth-layout/auth-layout.component */ "./src/app/shared/components/layouts/auth-layout/auth-layout.component.ts");
/* harmony import */ var _shared_components_layouts_customer_layout_customer_layout_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shared/components/layouts/customer-layout/customer-layout.component */ "./src/app/shared/components/layouts/customer-layout/customer-layout.component.ts");
/* harmony import */ var _shared_components_layouts_landing_layout_landing_layout_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shared/components/layouts/landing-layout/landing-layout.component */ "./src/app/shared/components/layouts/landing-layout/landing-layout.component.ts");
/* harmony import */ var _shared_services_auth_auth_guard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shared/services/auth/auth.guard */ "./src/app/shared/services/auth/auth.guard.ts");






var rootRouterConfig = [
    {
        path: '',
        component: _shared_components_layouts_landing_layout_landing_layout_component__WEBPACK_IMPORTED_MODULE_4__["LandingLayoutComponent"],
        children: [
            {
                path: '',
                loadChildren: './views/landing/landing.module#LandingModule',
                data: { title: 'Landing' }
            }
        ]
    }, {
        path: '',
        component: _shared_components_layouts_auth_layout_auth_layout_component__WEBPACK_IMPORTED_MODULE_2__["AuthLayoutComponent"],
        children: [
            {
                path: 'auth',
                loadChildren: './views/auth/auth.module#AuthModule',
                data: { title: 'Authentication' }
            }
        ]
    }, {
        path: '',
        component: _shared_components_layouts_admin_layout_admin_layout_component__WEBPACK_IMPORTED_MODULE_0__["AdminLayoutComponent"],
        canActivate: [_shared_services_auth_auth_guard__WEBPACK_IMPORTED_MODULE_5__["AuthGuard"]],
        children: [
            {
                path: 'admin',
                loadChildren: './views/admin/admin.module#AdminModule',
                data: { title: 'Others', breadcrumb: 'OTHERS' }
            }
        ]
    }, {
        path: 'customer',
        component: _shared_components_layouts_customer_layout_customer_layout_component__WEBPACK_IMPORTED_MODULE_3__["CustomerLayoutComponent"],
        children: [
            {
                path: '',
                loadChildren: './views/customer/customer.module#CustomerModule',
                data: { title: 'Customer' }
            }
        ]
    }, {
        path: '',
        component: _shared_components_layouts_advisor_layout_advisor_layout_component__WEBPACK_IMPORTED_MODULE_1__["AdvisorLayoutComponent"],
        children: [
            {
                path: 'advisor',
                loadChildren: './views/advisor/advisor.module#AdvisorModule',
                data: { title: 'Customer' }
            }
        ]
    }, {
        path: '**',
        redirectTo: 'auth/404'
    }
];


/***/ }),

/***/ "./src/app/shared/components/advisor-header/advisor-header-top.component.html":
/*!************************************************************************************!*\
  !*** ./src/app/shared/components/advisor-header/advisor-header-top.component.html ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"header-topnav mat-elevation-z2\">\r\n  <div class=\"container\">\r\n    <div class=\"topnav\">\r\n      <!-- App Logo -->\r\n      <div class=\"topbar-branding\">\r\n        <img src=\"assets/images/logo.png\" alt=\"\" class=\"app-logo\">\r\n      </div>\r\n\r\n      <ul class=\"menu\" *ngIf=\"!layoutConf.isMobile\">\r\n        <li *ngFor=\"let item of menuItems; let i = index;\">\r\n          <div *ngIf=\"item.type !== 'separator'\" routerLinkActive=\"open\">\r\n            <a matRipple routerLink=\"/{{item.state}}\" *ngIf=\"item.type === 'link'\">\r\n              <mat-icon>{{item.icon}}</mat-icon>\r\n              {{item.name | translate}}\r\n            </a>\r\n\r\n      \r\n          </div>\r\n        </li>\r\n      </ul>\r\n      <span fxFlex></span>\r\n      <!-- End Navigation -->\r\n\r\n      <!-- Language Switcher -->\r\n      <!-- <mat-select *ngIf=\"!layoutConf.isMobile\" placeholder=\"\" id=\"langToggle\" [style.width]=\"'auto'\" name=\"currentLang\" [(ngModel)]=\"currentLang\"\r\n        (selectionChange)=\"setLang()\" class=\"topbar-button-right\">\r\n        <mat-option *ngFor=\"let lang of availableLangs\" [value]=\"lang.code\" ngDefaultControl>{{ lang.name }}</mat-option>\r\n      </mat-select> -->\r\n      <!-- Theme Switcher -->\r\n      \r\n      <mat-menu #themeMenu=\"matMenu\">\r\n        <mat-grid-list class=\"theme-list\" cols=\"2\" rowHeight=\"48px\">\r\n          <mat-grid-tile *ngFor=\"let theme of egretThemes\" (click)=\"changeTheme(theme)\">\r\n            <div mat-menu-item [title]=\"theme.name\">\r\n              <div [style.background]=\"theme.baseColor\" class=\"egret-swatch\"></div>\r\n              <mat-icon class=\"active-icon\" *ngIf=\"theme.isActive\">check</mat-icon>\r\n            </div>\r\n          </mat-grid-tile>\r\n        </mat-grid-list>\r\n      </mat-menu>\r\n      <!-- Notification toggle button -->\r\n      <button mat-icon-button matTooltip=\"Notifications\" (click)=\"toggleNotific()\" [style.overflow]=\"'visible'\" class=\"topbar-button-right\">\r\n        <mat-icon>notifications</mat-icon>\r\n        <span class=\"notification-number mat-bg-warn\">3</span>\r\n      </button>\r\n      <!-- Top left user menu -->\r\n      <button mat-icon-button [matMenuTriggerFor]=\"accountMenu\" class=\"topbar-button-right mr-1 img-button\">\r\n        <img src=\"assets/images/face-7.jpg\" alt=\"\">\r\n      </button>\r\n      <mat-menu #accountMenu=\"matMenu\">\r\n        <button mat-menu-item [routerLink]=\"['/profile/overview']\">\r\n          <mat-icon>account_box</mat-icon>\r\n          <span>Customer Profile</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/profile/settings']\">\r\n          <mat-icon>settings</mat-icon>\r\n          <span>Customer Account Settings</span>\r\n        </button>\r\n        <button mat-menu-item>\r\n          <mat-icon>notifications_off</mat-icon>\r\n          <span>Customer Disable alerts</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/sessions/signin']\">\r\n          <mat-icon>exit_to_app</mat-icon>\r\n          <span>Customer Sign out</span>\r\n        </button>\r\n      </mat-menu>\r\n      <!-- Mobile screen menu toggle -->\r\n      <button mat-icon-button class=\"mr-1\" (click)=\"toggleSidenav()\" *ngIf=\"layoutConf.isMobile\">\r\n        <mat-icon>menu</mat-icon>\r\n      </button>\r\n\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/advisor-header/advisor-header-top.component.ts":
/*!**********************************************************************************!*\
  !*** ./src/app/shared/components/advisor-header/advisor-header-top.component.ts ***!
  \**********************************************************************************/
/*! exports provided: AdvisorHeaderTopComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdvisorHeaderTopComponent", function() { return AdvisorHeaderTopComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_advisor_nav_links_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/advisor-nav-links.service */ "./src/app/shared/services/advisor-nav-links.service.ts");
/* harmony import */ var _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var AdvisorHeaderTopComponent = /** @class */ (function () {
    function AdvisorHeaderTopComponent(layout, navService, themeService, translate, renderer) {
        this.layout = layout;
        this.navService = navService;
        this.themeService = themeService;
        this.translate = translate;
        this.renderer = renderer;
        this.egretThemes = [];
        this.currentLang = 'en';
        this.availableLangs = [{
                name: 'English',
                code: 'en',
            }, {
                name: 'Spanish',
                code: 'es',
            }];
    }
    AdvisorHeaderTopComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        this.egretThemes = this.themeService.egretThemes;
        this.menuItemSub = this.navService.menuItems$
            .subscribe(function (res) {
            res = res.filter(function (item) { return item.type !== 'icon' && item.type !== 'separator'; });
            var limit = 4;
            var mainItems = res.slice(0, limit);
            if (res.length <= limit) {
                return _this.menuItems = mainItems;
            }
            var subItems = res.slice(limit, res.length - 1);
            mainItems.push({
                name: 'More',
                type: 'dropDown',
                tooltip: 'More',
                icon: 'more_horiz',
                sub: subItems
            });
            _this.menuItems = mainItems;
        });
    };
    AdvisorHeaderTopComponent.prototype.ngOnDestroy = function () {
        this.menuItemSub.unsubscribe();
    };
    AdvisorHeaderTopComponent.prototype.setLang = function () {
        this.translate.use(this.currentLang);
    };
    AdvisorHeaderTopComponent.prototype.changeTheme = function (theme) {
        this.themeService.changeTheme(this.renderer, theme);
    };
    AdvisorHeaderTopComponent.prototype.toggleNotific = function () {
        this.notificPanel.toggle();
    };
    AdvisorHeaderTopComponent.prototype.toggleSidenav = function () {
        if (this.layoutConf.sidebarStyle === 'closed') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            });
        }
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], AdvisorHeaderTopComponent.prototype, "notificPanel", void 0);
    AdvisorHeaderTopComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-advisor-header-top',
            template: __webpack_require__(/*! ./advisor-header-top.component.html */ "./src/app/shared/components/advisor-header/advisor-header-top.component.html")
        }),
        __metadata("design:paramtypes", [_services_layout_service__WEBPACK_IMPORTED_MODULE_4__["LayoutService"],
            _shared_services_advisor_nav_links_service__WEBPACK_IMPORTED_MODULE_1__["AdvisorNavService"],
            _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__["ThemeService"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]])
    ], AdvisorHeaderTopComponent);
    return AdvisorHeaderTopComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/breadcrumb/breadcrumb.component.html":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/breadcrumb/breadcrumb.component.html ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- <div class=\"breadcrumb-bar\" *ngIf=\"layout.layoutConf.useBreadcrumb && layout.layoutConf.breadcrumb === 'simple'\">\r\n  <ul class=\"breadcrumb\">\r\n    <li *ngFor=\"let part of routeParts\"><a routerLink=\"/{{part.url}}\">{{part.breadcrumb | translate}}</a></li>\r\n  </ul>\r\n</div>\r\n\r\n<div class=\"breadcrumb-title\" *ngIf=\"layout.layoutConf.useBreadcrumb && layout.layoutConf.breadcrumb === 'title'\">\r\n  <h1 class=\"bc-title\">{{routeParts[routeParts.length -1]['breadcrumb'] | translate}}</h1>\r\n  <ul class=\"breadcrumb\" *ngIf=\"routeParts.length > 1\">\r\n    <li *ngFor=\"let part of routeParts\"><a routerLink=\"/{{part.url}}\" class=\"text-muted\">{{part.breadcrumb | translate}}</a></li>\r\n  </ul>\r\n</div> -->"

/***/ }),

/***/ "./src/app/shared/components/breadcrumb/breadcrumb.component.scss":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/breadcrumb/breadcrumb.component.scss ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3NoYXJlZC9jb21wb25lbnRzL2JyZWFkY3J1bWIvYnJlYWRjcnVtYi5jb21wb25lbnQuc2NzcyJ9 */"

/***/ }),

/***/ "./src/app/shared/components/breadcrumb/breadcrumb.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/shared/components/breadcrumb/breadcrumb.component.ts ***!
  \**********************************************************************/
/*! exports provided: BreadcrumbComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BreadcrumbComponent", function() { return BreadcrumbComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _shared_services_route_parts_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/services/route-parts.service */ "./src/app/shared/services/route-parts.service.ts");
/* harmony import */ var _shared_services_layout_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var BreadcrumbComponent = /** @class */ (function () {
    // public isEnabled: boolean = true;
    function BreadcrumbComponent(router, routePartsService, activeRoute, layout) {
        var _this = this;
        this.router = router;
        this.routePartsService = routePartsService;
        this.activeRoute = activeRoute;
        this.layout = layout;
        this.routerEventSub = this.router.events
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; }))
            .subscribe(function (routeChange) {
            _this.routeParts = _this.routePartsService.generateRouteParts(_this.activeRoute.snapshot);
            // generate url from parts
            _this.routeParts.reverse().map(function (item, i) {
                item.breadcrumb = _this.parseText(item);
                item.urlSegments.forEach(function (urlSegment, j) {
                    if (j === 0)
                        return item.url = "" + urlSegment.path;
                    item.url += "/" + urlSegment.path;
                });
                if (i === 0) {
                    return item;
                }
                // prepend previous part to current part
                item.url = _this.routeParts[i - 1].url + "/" + item.url;
                return item;
            });
        });
    }
    BreadcrumbComponent.prototype.ngOnInit = function () { };
    BreadcrumbComponent.prototype.ngOnDestroy = function () {
        if (this.routerEventSub) {
            this.routerEventSub.unsubscribe();
        }
    };
    BreadcrumbComponent.prototype.parseText = function (part) {
        part.breadcrumb = part.breadcrumb ? part.breadcrumb.replace(/{{([^{}]*)}}/g, function (a, b) {
            var r = part.params[b];
            return typeof r === 'string' ? r : a;
        }) : '';
        return part.breadcrumb;
    };
    BreadcrumbComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-breadcrumb',
            template: __webpack_require__(/*! ./breadcrumb.component.html */ "./src/app/shared/components/breadcrumb/breadcrumb.component.html"),
            styles: [__webpack_require__(/*! ./breadcrumb.component.scss */ "./src/app/shared/components/breadcrumb/breadcrumb.component.scss")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _shared_services_route_parts_service__WEBPACK_IMPORTED_MODULE_2__["RoutePartsService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _shared_services_layout_service__WEBPACK_IMPORTED_MODULE_3__["LayoutService"]])
    ], BreadcrumbComponent);
    return BreadcrumbComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/customer-header/customer-header-top.component.html":
/*!**************************************************************************************!*\
  !*** ./src/app/shared/components/customer-header/customer-header-top.component.html ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"header-topnav mat-elevation-z2\">\r\n  <div class=\"container\">\r\n    <div class=\"topnav\">\r\n      <!-- App Logo -->\r\n      <div class=\"topbar-branding\">\r\n        <img src=\"assets/images/logo.png\" alt=\"\" class=\"app-logo\">\r\n      </div>\r\n\r\n      <ul class=\"menu\" *ngIf=\"!layoutConf.isMobile\">\r\n        <li *ngFor=\"let item of menuItems; let i = index;\">\r\n          <div *ngIf=\"item.type !== 'separator'\" routerLinkActive=\"open\">\r\n            <a matRipple routerLink=\"/{{item.state}}\" *ngIf=\"item.type === 'link'\">\r\n              <mat-icon>{{item.icon}}</mat-icon>\r\n              {{item.name | translate}}\r\n            </a>\r\n\r\n      \r\n          </div>\r\n        </li>\r\n      </ul>\r\n      <span fxFlex></span>\r\n      <!-- End Navigation -->\r\n\r\n      <!-- Language Switcher -->\r\n      <!-- <mat-select *ngIf=\"!layoutConf.isMobile\" placeholder=\"\" id=\"langToggle\" [style.width]=\"'auto'\" name=\"currentLang\" [(ngModel)]=\"currentLang\"\r\n        (selectionChange)=\"setLang()\" class=\"topbar-button-right\">\r\n        <mat-option *ngFor=\"let lang of availableLangs\" [value]=\"lang.code\" ngDefaultControl>{{ lang.name }}</mat-option>\r\n      </mat-select> -->\r\n      <!-- Theme Switcher -->\r\n      \r\n      <mat-menu #themeMenu=\"matMenu\">\r\n        <mat-grid-list class=\"theme-list\" cols=\"2\" rowHeight=\"48px\">\r\n          <mat-grid-tile *ngFor=\"let theme of egretThemes\" (click)=\"changeTheme(theme)\">\r\n            <div mat-menu-item [title]=\"theme.name\">\r\n              <div [style.background]=\"theme.baseColor\" class=\"egret-swatch\"></div>\r\n              <mat-icon class=\"active-icon\" *ngIf=\"theme.isActive\">check</mat-icon>\r\n            </div>\r\n          </mat-grid-tile>\r\n        </mat-grid-list>\r\n      </mat-menu>\r\n      <!-- Notification toggle button -->\r\n      <button mat-icon-button matTooltip=\"Notifications\" (click)=\"toggleNotific()\" [style.overflow]=\"'visible'\" class=\"topbar-button-right\">\r\n        <mat-icon>notifications</mat-icon>\r\n        <span class=\"notification-number mat-bg-warn\">3</span>\r\n      </button>\r\n      <!-- Top left user menu -->\r\n      <button mat-icon-button [matMenuTriggerFor]=\"accountMenu\" class=\"topbar-button-right mr-1 img-button\">\r\n        <img src=\"assets/images/face-7.jpg\" alt=\"\">\r\n      </button>\r\n      <mat-menu #accountMenu=\"matMenu\">\r\n        <button mat-menu-item [routerLink]=\"['/profile/overview']\">\r\n          <mat-icon>account_box</mat-icon>\r\n          <span>Customer Profile</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/profile/settings']\">\r\n          <mat-icon>settings</mat-icon>\r\n          <span>Customer Account Settings</span>\r\n        </button>\r\n        <button mat-menu-item>\r\n          <mat-icon>notifications_off</mat-icon>\r\n          <span>Customer Disable alerts</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/sessions/signin']\">\r\n          <mat-icon>exit_to_app</mat-icon>\r\n          <span>Customer Sign out</span>\r\n        </button>\r\n      </mat-menu>\r\n      <!-- Mobile screen menu toggle -->\r\n      <button mat-icon-button class=\"mr-1\" (click)=\"toggleSidenav()\" *ngIf=\"layoutConf.isMobile\">\r\n        <mat-icon>menu</mat-icon>\r\n      </button>\r\n\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/customer-header/customer-header-top.component.ts":
/*!************************************************************************************!*\
  !*** ./src/app/shared/components/customer-header/customer-header-top.component.ts ***!
  \************************************************************************************/
/*! exports provided: customerHeaderTopComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "customerHeaderTopComponent", function() { return customerHeaderTopComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_customer_nav_links_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/customer-nav-links.service */ "./src/app/shared/services/customer-nav-links.service.ts");
/* harmony import */ var _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var customerHeaderTopComponent = /** @class */ (function () {
    function customerHeaderTopComponent(layout, navService, themeService, translate, renderer) {
        this.layout = layout;
        this.navService = navService;
        this.themeService = themeService;
        this.translate = translate;
        this.renderer = renderer;
        this.egretThemes = [];
        this.currentLang = 'en';
        this.availableLangs = [{
                name: 'English',
                code: 'en',
            }, {
                name: 'Spanish',
                code: 'es',
            }];
    }
    customerHeaderTopComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        this.egretThemes = this.themeService.egretThemes;
        this.menuItemSub = this.navService.menuItems$
            .subscribe(function (res) {
            res = res.filter(function (item) { return item.type !== 'icon' && item.type !== 'separator'; });
            var limit = 4;
            var mainItems = res.slice(0, limit);
            if (res.length <= limit) {
                return _this.menuItems = mainItems;
            }
            var subItems = res.slice(limit, res.length - 1);
            mainItems.push({
                name: 'More',
                type: 'dropDown',
                tooltip: 'More',
                icon: 'more_horiz',
                sub: subItems
            });
            _this.menuItems = mainItems;
        });
    };
    customerHeaderTopComponent.prototype.ngOnDestroy = function () {
        this.menuItemSub.unsubscribe();
    };
    customerHeaderTopComponent.prototype.setLang = function () {
        this.translate.use(this.currentLang);
    };
    customerHeaderTopComponent.prototype.changeTheme = function (theme) {
        this.themeService.changeTheme(this.renderer, theme);
    };
    customerHeaderTopComponent.prototype.toggleNotific = function () {
        this.notificPanel.toggle();
    };
    customerHeaderTopComponent.prototype.toggleSidenav = function () {
        if (this.layoutConf.sidebarStyle === 'closed') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            });
        }
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], customerHeaderTopComponent.prototype, "notificPanel", void 0);
    customerHeaderTopComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-customer-header-top',
            template: __webpack_require__(/*! ./customer-header-top.component.html */ "./src/app/shared/components/customer-header/customer-header-top.component.html")
        }),
        __metadata("design:paramtypes", [_services_layout_service__WEBPACK_IMPORTED_MODULE_4__["LayoutService"],
            _shared_services_customer_nav_links_service__WEBPACK_IMPORTED_MODULE_1__["CustNavService"],
            _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__["ThemeService"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]])
    ], customerHeaderTopComponent);
    return customerHeaderTopComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/customizer/customizer.component.html":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/customizer/customizer.component.html ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div id=\"app-customizer\">\r\n  <div class=\"handle\" *ngIf=\"!isCustomizerOpen\">\r\n    <button \r\n    mat-fab\r\n    color=\"warn\" \r\n    (click)=\"isCustomizerOpen = true\">\r\n      <mat-icon>settings</mat-icon>\r\n    </button>\r\n  </div>\r\n  <mat-card class=\"p-0\" *ngIf=\"isCustomizerOpen\">\r\n    <mat-card-title class=\"mat-bg-warn\">\r\n      <div class=\"card-title-text\">\r\n        <span>Settings</span>\r\n        <span fxFlex></span>\r\n        <button \r\n        class=\"card-control\" \r\n        mat-icon-button\r\n        (click)=\"isCustomizerOpen = false\">\r\n          <mat-icon>close</mat-icon>\r\n        </button>\r\n      </div>\r\n    </mat-card-title>\r\n    <mat-card-content>\r\n      <div class=\"pb-1\">\r\n        <h5 class=\"mt-0\">Layouts</h5>\r\n        <mat-radio-group fxLayout=\"column\" [(ngModel)]=\"selectedLayout\" (change)=\"changeLayoutStyle($event)\">\r\n            <mat-radio-button [value]=\"'top'\"> Top Navigation </mat-radio-button>\r\n            <mat-radio-button [value]=\"'side'\"> Side Navigation </mat-radio-button>\r\n        </mat-radio-group>\r\n      </div>\r\n      <div class=\"pb-1\">\r\n        <mat-checkbox [(ngModel)]=\"isTopbarFixed\" (change)=\"toggleTopbarFixed($event)\" [disabled]=\"selectedLayout === 'top'\" [value]=\"selectedLayout !== 'top'\">Fixed Topbar</mat-checkbox>\r\n      </div>\r\n      <div class=\"pb-1\">\r\n        <mat-checkbox [(ngModel)]=\"layoutConf.breadcrumb\" (change)=\"toggleBreadcrumb($event)\">Use breadcrumb</mat-checkbox>\r\n      </div>\r\n      <div class=\"pb-1\">\r\n          <h6 class=\"mt-0\">Breadcrumb Style</h6>\r\n          <mat-radio-group fxLayout=\"column\" [(ngModel)]=\"layoutConf.breadcrumb\">\r\n              <mat-radio-button [value]=\"'simple'\"> Simple </mat-radio-button>\r\n              <mat-radio-button [value]=\"'title'\"> Simple with title </mat-radio-button>\r\n          </mat-radio-group>\r\n        </div>\r\n      <div class=\"pb-1 pos-rel\">\r\n        <h6 class=\"m-0 pb-1\">Choose a Navigation Style</h6>\r\n        <mat-radio-group \r\n        fxLayout=\"column\" \r\n        [(ngModel)]=\"selectedMenu\" \r\n        (change)=\"changeSidenav($event)\" \r\n        [disabled]=\"selectedLayout === 'top'\">\r\n          <mat-radio-button \r\n          *ngFor=\"let type of sidenavTypes\" \r\n          [value]=\"type.value\">\r\n            {{type.name}}\r\n          </mat-radio-button>\r\n        </mat-radio-group>\r\n      </div>\r\n      <mat-divider></mat-divider>\r\n      \r\n      <div class=\"pb-1 pt-1\">\r\n        <mat-checkbox [(ngModel)]=\"isRTL\" (change)=\"toggleDir($event)\">RTL</mat-checkbox>\r\n      </div>\r\n    </mat-card-content>\r\n  </mat-card>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/customizer/customizer.component.scss":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/customizer/customizer.component.scss ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#app-customizer {\n  position: fixed;\n  z-index: 100;\n  bottom: 16px;\n  right: 24px; }\n  #app-customizer .handle {\n    float: right; }\n  #app-customizer .mat-card-content {\n    padding: 1rem 1.5rem 2rem; }\n  .pos-rel {\n  position: relative;\n  z-index: 99; }\n  .pos-rel .olay {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    background: rgba(255, 255, 255, 0.5);\n    z-index: 100; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvc2hhcmVkL2NvbXBvbmVudHMvY3VzdG9taXplci9FOlxcRGluZXNoXFxHaXRodWJcXExlZ2FjeUxJZmVQbGFucy9zcmNcXGFwcFxcc2hhcmVkXFxjb21wb25lbnRzXFxjdXN0b21pemVyXFxjdXN0b21pemVyLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsZUFBZTtFQUNmLFlBQVk7RUFDWixZQUFZO0VBQ1osV0FBVyxFQUFBO0VBSmI7SUFNSSxZQUFZLEVBQUE7RUFOaEI7SUFTSSx5QkFBeUIsRUFBQTtFQUc3QjtFQUNFLGtCQUFrQjtFQUNsQixXQUFXLEVBQUE7RUFGYjtJQUlJLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsWUFBWTtJQUNaLG9DQUFtQztJQUNuQyxZQUFZLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9zaGFyZWQvY29tcG9uZW50cy9jdXN0b21pemVyL2N1c3RvbWl6ZXIuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIjYXBwLWN1c3RvbWl6ZXIge1xyXG4gIHBvc2l0aW9uOiBmaXhlZDtcclxuICB6LWluZGV4OiAxMDA7XHJcbiAgYm90dG9tOiAxNnB4O1xyXG4gIHJpZ2h0OiAyNHB4O1xyXG4gIC5oYW5kbGUge1xyXG4gICAgZmxvYXQ6IHJpZ2h0O1xyXG4gIH1cclxuICAubWF0LWNhcmQtY29udGVudCAge1xyXG4gICAgcGFkZGluZzogMXJlbSAxLjVyZW0gMnJlbTtcclxuICB9XHJcbn1cclxuLnBvcy1yZWwge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB6LWluZGV4OiA5OTtcclxuICAub2xheSB7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgLjUpO1xyXG4gICAgei1pbmRleDogMTAwO1xyXG4gIH1cclxufSJdfQ== */"

/***/ }),

/***/ "./src/app/shared/components/customizer/customizer.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/shared/components/customizer/customizer.component.ts ***!
  \**********************************************************************/
/*! exports provided: CustomizerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomizerComponent", function() { return CustomizerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/navigation.service */ "./src/app/shared/services/navigation.service.ts");
/* harmony import */ var _shared_services_layout_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/services/layout.service */ "./src/app/shared/services/layout.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var CustomizerComponent = /** @class */ (function () {
    function CustomizerComponent(navService, layout) {
        this.navService = navService;
        this.layout = layout;
        this.isCustomizerOpen = false;
        this.sidenavTypes = [{
                name: 'Default Menu',
                value: 'default-menu'
            }, {
                name: 'Separator Menu',
                value: 'separator-menu'
            }, {
                name: 'Icon Menu',
                value: 'icon-menu'
            }];
        this.selectedMenu = 'icon-menu';
        this.isTopbarFixed = false;
        this.isRTL = false;
    }
    CustomizerComponent.prototype.ngOnInit = function () {
        this.layoutConf = this.layout.layoutConf;
        this.selectedLayout = this.layoutConf.navigationPos;
        this.isTopbarFixed = this.layoutConf.topbarFixed;
        this.isRTL = this.layoutConf.dir === 'rtl';
    };
    CustomizerComponent.prototype.changeLayoutStyle = function (data) {
        this.layout.publishLayoutChange({ navigationPos: this.selectedLayout });
    };
    CustomizerComponent.prototype.changeSidenav = function (data) {
        this.navService.publishNavigationChange(data.value);
    };
    CustomizerComponent.prototype.toggleBreadcrumb = function (data) {
        this.layout.publishLayoutChange({ breadcrumb: data.checked });
    };
    CustomizerComponent.prototype.toggleTopbarFixed = function (data) {
        this.layout.publishLayoutChange({ topbarFixed: data.checked });
    };
    CustomizerComponent.prototype.toggleDir = function (data) {
        var dir = data.checked ? 'rtl' : 'ltr';
        this.layout.publishLayoutChange({ dir: dir });
    };
    CustomizerComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-customizer',
            template: __webpack_require__(/*! ./customizer.component.html */ "./src/app/shared/components/customizer/customizer.component.html"),
            styles: [__webpack_require__(/*! ./customizer.component.scss */ "./src/app/shared/components/customizer/customizer.component.scss")]
        }),
        __metadata("design:paramtypes", [_shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__["NavigationService"],
            _shared_services_layout_service__WEBPACK_IMPORTED_MODULE_2__["LayoutService"]])
    ], CustomizerComponent);
    return CustomizerComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/header-side/header-side.component.ts":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/header-side/header-side.component.ts ***!
  \************************************************************************/
/*! exports provided: HeaderSideComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderSideComponent", function() { return HeaderSideComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var HeaderSideComponent = /** @class */ (function () {
    function HeaderSideComponent(themeService, layout, translate, renderer) {
        this.themeService = themeService;
        this.layout = layout;
        this.translate = translate;
        this.renderer = renderer;
        this.currentLang = 'en';
        this.availableLangs = [{
                name: 'English',
                code: 'en',
            }, {
                name: 'Spanish',
                code: 'es',
            }];
    }
    HeaderSideComponent.prototype.ngOnInit = function () {
        this.egretThemes = this.themeService.egretThemes;
        this.layoutConf = this.layout.layoutConf;
        this.translate.use(this.currentLang);
    };
    HeaderSideComponent.prototype.setLang = function (e) {
        console.log(e);
        this.translate.use(this.currentLang);
    };
    HeaderSideComponent.prototype.changeTheme = function (theme) {
        this.themeService.changeTheme(this.renderer, theme);
    };
    HeaderSideComponent.prototype.toggleNotific = function () {
        this.notificPanel.toggle();
    };
    HeaderSideComponent.prototype.toggleSidenav = function () {
        if (this.layoutConf.sidebarStyle === 'closed') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            });
        }
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    HeaderSideComponent.prototype.toggleCollapse = function () {
        // compact --> full
        if (this.layoutConf.sidebarStyle === 'compact') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            }, { transitionClass: true });
        }
        // * --> compact
        this.layout.publishLayoutChange({
            sidebarStyle: 'compact'
        }, { transitionClass: true });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], HeaderSideComponent.prototype, "notificPanel", void 0);
    HeaderSideComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-header-side',
            template: __webpack_require__(/*! ./header-side.template.html */ "./src/app/shared/components/header-side/header-side.template.html")
        }),
        __metadata("design:paramtypes", [_services_theme_service__WEBPACK_IMPORTED_MODULE_1__["ThemeService"],
            _services_layout_service__WEBPACK_IMPORTED_MODULE_2__["LayoutService"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]])
    ], HeaderSideComponent);
    return HeaderSideComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/header-side/header-side.template.html":
/*!*************************************************************************!*\
  !*** ./src/app/shared/components/header-side/header-side.template.html ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-toolbar class=\"topbar topbar-white\">\r\n  <!-- Sidenav toggle button -->\r\n  <button \r\n  *ngIf=\"layoutConf.sidebarStyle !== 'compact'\"\r\n  mat-icon-button\r\n  id=\"sidenavToggle\" \r\n  (click)=\"toggleSidenav()\"\r\n  matTooltip=\"Toggle Hide/Open\">\r\n  <mat-icon>menu</mat-icon>\r\n  </button>\r\n  <!-- Sidenav toggle collapse -->\r\n  <button \r\n  *ngIf=\"layoutConf.sidebarStyle !== 'closed'\"\r\n  mat-icon-button\r\n  id=\"collapseToggle\"\r\n  fxHide.lt-md=\"true\" \r\n  (click)=\"toggleCollapse()\"\r\n  matTooltip=\"Toggle Collapse\"\r\n  class=\"toggle-collapsed\">\r\n  <mat-icon>chevron_left</mat-icon>\r\n  </button>\r\n  <!-- Search form -->\r\n  <div \r\n  fxFlex\r\n  fxHide.lt-sm=\"true\" \r\n  class=\"search-bar\">\r\n    <form class=\"top-search-form\">\r\n      <mat-icon role=\"img\">search</mat-icon>\r\n      <input autofocus=\"true\" placeholder=\"Search\" type=\"text\">\r\n    </form>\r\n  </div>\r\n  <span fxFlex></span>\r\n  <!-- Language Switcher -->\r\n  <mat-select \r\n  placeholder=\"\"\r\n  id=\"langToggle\"\r\n  [style.width]=\"'auto'\"\r\n  name=\"currentLang\"\r\n  [(ngModel)]=\"currentLang\" \r\n  (selectionChange)=\"setLang($event)\">\r\n    <mat-option \r\n    *ngFor=\"let lang of availableLangs\" \r\n    [value]=\"lang.code\" ngDefaultControl>{{ lang.name }}</mat-option>\r\n  </mat-select>\r\n  <!-- Theme Switcher -->\r\n  <button \r\n  mat-icon-button\r\n  id=\"schemeToggle\" \r\n  [style.overflow]=\"'visible'\"\r\n  matTooltip=\"Color Schemes\"\r\n  [matMenuTriggerFor]=\"themeMenu\"\r\n  class=\"topbar-button-right\">\r\n    <mat-icon>format_color_fill</mat-icon>\r\n  </button>\r\n  <mat-menu #themeMenu=\"matMenu\">\r\n    <mat-grid-list\r\n    class=\"theme-list\" \r\n    cols=\"2\" \r\n    rowHeight=\"48px\">\r\n      <mat-grid-tile \r\n      *ngFor=\"let theme of egretThemes\"\r\n      (click)=\"changeTheme(theme)\">\r\n        <div mat-menu-item [title]=\"theme.name\">\r\n          <div [style.background]=\"theme.baseColor\" class=\"egret-swatch\"></div>\r\n          <mat-icon class=\"active-icon\" *ngIf=\"theme.isActive\">check</mat-icon>\r\n        </div>\r\n      </mat-grid-tile>\r\n    </mat-grid-list>\r\n  </mat-menu>\r\n  <!-- Notification toggle button -->\r\n  <button \r\n  mat-icon-button\r\n  matTooltip=\"Notifications\" \r\n  (click)=\"toggleNotific()\"\r\n  [style.overflow]=\"'visible'\" \r\n  class=\"topbar-button-right\">\r\n    <mat-icon>notifications</mat-icon>\r\n    <span class=\"notification-number mat-bg-warn\">3</span>\r\n  </button>\r\n  <!-- Top left user menu -->\r\n  <button mat-icon-button [matMenuTriggerFor]=\"accountMenu\" class=\"topbar-button-right img-button\">\r\n    <img src=\"assets/images/face-7.jpg\" alt=\"\">\r\n  </button>\r\n  <mat-menu #accountMenu=\"matMenu\">\r\n    <button mat-menu-item [routerLink]=\"['/profile/overview']\">\r\n      <mat-icon>account_box</mat-icon>\r\n      <span>Profile</span>\r\n    </button>\r\n    <button mat-menu-item [routerLink]=\"['/profile/settings']\">\r\n      <mat-icon>settings</mat-icon>\r\n      <span>Account Settings</span>\r\n    </button>\r\n    <button mat-menu-item>\r\n      <mat-icon>notifications_off</mat-icon>\r\n      <span>Disable alerts</span>\r\n    </button>\r\n    <button mat-menu-item [routerLink]=\"['/sessions/signin']\">\r\n      <mat-icon>exit_to_app</mat-icon>\r\n      <span>Sign out</span>\r\n    </button>\r\n  </mat-menu>\r\n</mat-toolbar>"

/***/ }),

/***/ "./src/app/shared/components/header-top/header-top.component.html":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/header-top/header-top.component.html ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"header-topnav mat-elevation-z2\">\r\n  <div class=\"container\">\r\n    <div class=\"topnav\">\r\n      <!-- App Logo -->\r\n      <div class=\"topbar-branding\">\r\n        <img src=\"assets/images/logo.png\" alt=\"\" class=\"app-logo\">\r\n      </div>\r\n\r\n      <ul class=\"menu\" *ngIf=\"!layoutConf.isMobile\">\r\n        <li *ngFor=\"let item of menuItems; let i = index;\">\r\n          <div *ngIf=\"item.type !== 'separator'\" routerLinkActive=\"open\">\r\n            <a matRipple routerLink=\"/{{item.state}}\" *ngIf=\"item.type === 'link'\">\r\n              <mat-icon>{{item.icon}}</mat-icon> \r\n              {{item.name | translate}}\r\n            </a>\r\n            <div *ngIf=\"item.type === 'dropDown'\">\r\n              <label matRipple for=\"drop-{{i}}\" class=\"toggle\"><mat-icon>{{item.icon}}</mat-icon> {{item.name | translate}}</label>\r\n              <a matRipple><mat-icon>{{item.icon}}</mat-icon> {{item.name | translate}}</a>\r\n              <input type=\"checkbox\" id=\"drop-{{i}}\" />\r\n              <ul>\r\n                <li *ngFor=\"let itemLvL2 of item.sub; let j = index;\" routerLinkActive=\"open\">\r\n                  <a matRipple routerLink=\"{{item.state ? '/'+item.state : ''}}/{{itemLvL2.state}}\" \r\n                  *ngIf=\"itemLvL2.type !== 'dropDown'\">\r\n                    <mat-icon *ngIf=\"itemLvL2.icon\">{{itemLvL2.icon}}</mat-icon>  \r\n                    {{itemLvL2.name | translate}}\r\n                  </a>\r\n                  \r\n                  <div *ngIf=\"itemLvL2.type === 'dropDown'\">\r\n                    <label matRipple for=\"drop-{{i}}{{j}}\" class=\"toggle\">{{itemLvL2.name | translate}}</label>\r\n                    <a matRipple><mat-icon *ngIf=\"itemLvL2.icon\">{{itemLvL2.icon}}</mat-icon>  {{itemLvL2.name | translate}}</a>\r\n                    <input type=\"checkbox\" id=\"drop-{{i}}{{j}}\" />\r\n                    <!-- Level 3 -->\r\n                    <ul>\r\n                      <li *ngFor=\"let itemLvL3 of itemLvL2.sub\" routerLinkActive=\"open\">\r\n                        <a matRipple routerLink=\"{{item.state ? '/'+item.state : ''}}{{itemLvL2.state ? '/'+itemLvL2.state : ''}}/{{itemLvL3.state}}\">\r\n                          <mat-icon *ngIf=\"itemLvL3.icon\">{{itemLvL3.icon}}</mat-icon>\r\n                          {{itemLvL3.name | translate}}\r\n                        </a>\r\n                      </li>\r\n                    </ul>\r\n                  </div>\r\n                </li>\r\n              </ul>\r\n            </div>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n      <span fxFlex></span>\r\n      <!-- End Navigation -->\r\n      \r\n      <!-- Language Switcher -->\r\n      <mat-select \r\n      *ngIf=\"!layoutConf.isMobile\"\r\n      placeholder=\"\"\r\n      id=\"langToggle\"\r\n      [style.width]=\"'auto'\"\r\n      name=\"currentLang\"\r\n      [(ngModel)]=\"currentLang\" \r\n      (selectionChange)=\"setLang()\"\r\n      class=\"topbar-button-right\">\r\n        <mat-option \r\n        *ngFor=\"let lang of availableLangs\" \r\n        [value]=\"lang.code\" ngDefaultControl>{{ lang.name }}</mat-option>\r\n      </mat-select>\r\n      <!-- Theme Switcher -->\r\n      <button \r\n      mat-icon-button\r\n      id=\"schemeToggle\" \r\n      [style.overflow]=\"'visible'\"\r\n      matTooltip=\"Color Schemes\"\r\n      [matMenuTriggerFor]=\"themeMenu\"\r\n      class=\"topbar-button-right\">\r\n        <mat-icon>format_color_fill</mat-icon>\r\n      </button>\r\n      <mat-menu #themeMenu=\"matMenu\">\r\n        <mat-grid-list\r\n        class=\"theme-list\" \r\n        cols=\"2\" \r\n        rowHeight=\"48px\">\r\n          <mat-grid-tile \r\n          *ngFor=\"let theme of egretThemes\"\r\n          (click)=\"changeTheme(theme)\">\r\n            <div mat-menu-item [title]=\"theme.name\">\r\n              <div [style.background]=\"theme.baseColor\" class=\"egret-swatch\"></div>\r\n              <mat-icon class=\"active-icon\" *ngIf=\"theme.isActive\">check</mat-icon>\r\n            </div>\r\n          </mat-grid-tile>\r\n        </mat-grid-list>\r\n      </mat-menu>\r\n      <!-- Notification toggle button -->\r\n      <button \r\n      mat-icon-button\r\n      matTooltip=\"Notifications\" \r\n      (click)=\"toggleNotific()\"\r\n      [style.overflow]=\"'visible'\" \r\n      class=\"topbar-button-right\">\r\n        <mat-icon>notifications</mat-icon>\r\n        <span class=\"notification-number mat-bg-warn\">3</span>\r\n      </button>\r\n      <!-- Top left user menu -->\r\n      <button mat-icon-button [matMenuTriggerFor]=\"accountMenu\" class=\"topbar-button-right mr-1 img-button\">\r\n        <img src=\"assets/images/face-7.jpg\" alt=\"\">\r\n      </button>\r\n      <mat-menu #accountMenu=\"matMenu\">\r\n        <button mat-menu-item [routerLink]=\"['/profile/overview']\">\r\n          <mat-icon>account_box</mat-icon>\r\n          <span>Profile</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/profile/settings']\">\r\n          <mat-icon>settings</mat-icon>\r\n          <span>Account Settings</span>\r\n        </button>\r\n        <button mat-menu-item>\r\n          <mat-icon>notifications_off</mat-icon>\r\n          <span>Disable alerts</span>\r\n        </button>\r\n        <button mat-menu-item [routerLink]=\"['/sessions/signin']\">\r\n          <mat-icon>exit_to_app</mat-icon>\r\n          <span>Sign out</span>\r\n        </button>\r\n      </mat-menu>\r\n      <!-- Mobile screen menu toggle -->\r\n      <button \r\n      mat-icon-button \r\n      class=\"mr-1\" \r\n      (click)=\"toggleSidenav()\" \r\n      *ngIf=\"layoutConf.isMobile\">\r\n        <mat-icon>menu</mat-icon>\r\n      </button>\r\n\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/header-top/header-top.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/shared/components/header-top/header-top.component.ts ***!
  \**********************************************************************/
/*! exports provided: HeaderTopComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderTopComponent", function() { return HeaderTopComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/navigation.service */ "./src/app/shared/services/navigation.service.ts");
/* harmony import */ var _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var HeaderTopComponent = /** @class */ (function () {
    function HeaderTopComponent(layout, navService, themeService, translate, renderer) {
        this.layout = layout;
        this.navService = navService;
        this.themeService = themeService;
        this.translate = translate;
        this.renderer = renderer;
        this.egretThemes = [];
        this.currentLang = 'en';
        this.availableLangs = [{
                name: 'English',
                code: 'en',
            }, {
                name: 'Spanish',
                code: 'es',
            }];
    }
    HeaderTopComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        this.egretThemes = this.themeService.egretThemes;
        this.menuItemSub = this.navService.menuItems$
            .subscribe(function (res) {
            res = res.filter(function (item) { return item.type !== 'icon' && item.type !== 'separator'; });
            var limit = 4;
            var mainItems = res.slice(0, limit);
            if (res.length <= limit) {
                return _this.menuItems = mainItems;
            }
            var subItems = res.slice(limit, res.length - 1);
            mainItems.push({
                name: 'More',
                type: 'dropDown',
                tooltip: 'More',
                icon: 'more_horiz',
                sub: subItems
            });
            _this.menuItems = mainItems;
        });
    };
    HeaderTopComponent.prototype.ngOnDestroy = function () {
        this.menuItemSub.unsubscribe();
    };
    HeaderTopComponent.prototype.setLang = function () {
        this.translate.use(this.currentLang);
    };
    HeaderTopComponent.prototype.changeTheme = function (theme) {
        this.themeService.changeTheme(this.renderer, theme);
    };
    HeaderTopComponent.prototype.toggleNotific = function () {
        this.notificPanel.toggle();
    };
    HeaderTopComponent.prototype.toggleSidenav = function () {
        if (this.layoutConf.sidebarStyle === 'closed') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            });
        }
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], HeaderTopComponent.prototype, "notificPanel", void 0);
    HeaderTopComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-header-top',
            template: __webpack_require__(/*! ./header-top.component.html */ "./src/app/shared/components/header-top/header-top.component.html")
        }),
        __metadata("design:paramtypes", [_services_layout_service__WEBPACK_IMPORTED_MODULE_4__["LayoutService"],
            _shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__["NavigationService"],
            _shared_services_theme_service__WEBPACK_IMPORTED_MODULE_2__["ThemeService"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]])
    ], HeaderTopComponent);
    return HeaderTopComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/layouts/admin-layout/admin-layout.component.ts":
/*!**********************************************************************************!*\
  !*** ./src/app/shared/components/layouts/admin-layout/admin-layout.component.ts ***!
  \**********************************************************************************/
/*! exports provided: AdminLayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdminLayoutComponent", function() { return AdminLayoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





// import PerfectScrollbar from 'perfect-scrollbar';


var AdminLayoutComponent = /** @class */ (function () {
    function AdminLayoutComponent(router, translate, themeService, layout, media) {
        var _this = this;
        this.router = router;
        this.translate = translate;
        this.themeService = themeService;
        this.layout = layout;
        this.media = media;
        this.isModuleLoading = false;
        // private sidebarPS: PerfectScrollbar;
        // private bodyPS: PerfectScrollbar;
        // private headerFixedBodyPS: PerfectScrollbar;
        this.scrollConfig = {};
        this.layoutConf = {};
        // Close sidenav after route change in mobile
        this.routerEventSub = router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; }))
            .subscribe(function (routeChange) {
            _this.layout.adjustLayout({ route: routeChange.url });
        });
        // Translator init
        var browserLang = translate.getBrowserLang();
        translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    }
    AdminLayoutComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        // this.layout.adjustLayout();
        // console.log(this.layoutConf)
        this.layoutConf.navigationPos = 'side';
        // FOR MODULE LOADER FLAG
        this.moduleLoaderSub = this.router.events.subscribe(function (event) {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadStart"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveStart"]) {
                _this.isModuleLoading = true;
            }
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadEnd"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveEnd"]) {
                _this.isModuleLoading = false;
            }
        });
    };
    AdminLayoutComponent.prototype.onResize = function (event) {
        this.layout.adjustLayout(event);
    };
    AdminLayoutComponent.prototype.ngAfterViewInit = function () {
        // this.layoutConfSub = this.layout.layoutConf$.subscribe(change => {
        //   // this.initBodyPS(change)
        // })
    };
    // initBodyPS(layoutConf:any = {}) {
    //   if(layoutConf.navigationPos === 'side' && layoutConf.topbarFixed) {
    //     if (this.bodyPS) this.bodyPS.destroy();
    //     if (this.headerFixedBodyPS) this.headerFixedBodyPS.destroy();
    //     this.headerFixedBodyPS = new PerfectScrollbar('.rightside-content-hold', {
    //       suppressScrollX: true
    //     });
    //     this.scrollToTop('.rightside-content-hold');
    //   } else {
    //     if (this.bodyPS) this.bodyPS.destroy();
    //     if (this.headerFixedBodyPS) this.headerFixedBodyPS.destroy();
    //     this.bodyPS = new PerfectScrollbar('.main-content-wrap', {
    //       suppressScrollX: true
    //     });
    //     this.scrollToTop('.main-content-wrap');
    //   }
    // }
    AdminLayoutComponent.prototype.scrollToTop = function (selector) {
        if (document) {
            var element = document.querySelector(selector);
            element.scrollTop = 0;
        }
    };
    AdminLayoutComponent.prototype.ngOnDestroy = function () {
        if (this.moduleLoaderSub) {
            this.moduleLoaderSub.unsubscribe();
        }
        if (this.layoutConfSub) {
            this.layoutConfSub.unsubscribe();
        }
        if (this.routerEventSub) {
            this.routerEventSub.unsubscribe();
        }
    };
    AdminLayoutComponent.prototype.closeSidebar = function () {
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('window:resize', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AdminLayoutComponent.prototype, "onResize", null);
    AdminLayoutComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-admin-layout',
            template: __webpack_require__(/*! ./admin-layout.template.html */ "./src/app/shared/components/layouts/admin-layout/admin-layout.template.html")
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _services_theme_service__WEBPACK_IMPORTED_MODULE_4__["ThemeService"],
            _services_layout_service__WEBPACK_IMPORTED_MODULE_5__["LayoutService"],
            _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["ObservableMedia"]])
    ], AdminLayoutComponent);
    return AdminLayoutComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/layouts/admin-layout/admin-layout.template.html":
/*!***********************************************************************************!*\
  !*** ./src/app/shared/components/layouts/admin-layout/admin-layout.template.html ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-admin-wrap\" [dir]='layoutConf.dir'>\r\n  <!-- Header for top navigation layout -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT -->\r\n  <app-header-top \r\n    *ngIf=\"layoutConf.navigationPos === 'top'\" \r\n    [notificPanel]=\"notificationPanel\">\r\n  </app-header-top>\r\n  <!-- Main Container -->\r\n  <mat-sidenav-container \r\n  [dir]='layoutConf.dir'\r\n  class=\"app-admin-container app-side-nav-container mat-drawer-transition\"\r\n  [ngClass]=\"{\r\n    'navigation-top': layoutConf.navigationPos === 'top',\r\n    'sidebar-full': layoutConf.sidebarStyle === 'full',\r\n    'sidebar-compact': layoutConf.sidebarStyle === 'compact' && layoutConf.navigationPos === 'side',\r\n    'sidebar-compact-big': layoutConf.sidebarStyle === 'compact-big' && layoutConf.navigationPos === 'side',\r\n    'layout-intransition': layoutConf.layoutInTransition,\r\n    'sidebar-opened': layoutConf.sidebarStyle !== 'closed' && layoutConf.navigationPos === 'side',\r\n    'sidebar-closed': layoutConf.sidebarStyle === 'closed',\r\n    'fixed-topbar': layoutConf.topbarFixed && layoutConf.navigationPos === 'side'\r\n  }\">\r\n  <!-- SIDEBAR -->\r\n  <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n  <app-sidebar-side *ngIf=\"layoutConf.navigationPos === 'side'\"></app-sidebar-side>\r\n  \r\n  <!-- Top navigation layout (navigation for mobile screen) -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION MOBILE LAYOUT -->\r\n  <app-sidebar-top *ngIf=\"layoutConf.navigationPos === 'top' && layoutConf.isMobile\"></app-sidebar-top>\r\n\r\n    <!-- App content -->\r\n    <div class=\"main-content-wrap\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"layoutConf.topbarFixed\">\r\n      <!-- Header for side navigation layout -->\r\n      <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n      <app-header-side \r\n        *ngIf=\"layoutConf.navigationPos === 'side'\"\r\n        [notificPanel]=\"notificationPanel\">\r\n      </app-header-side>\r\n\r\n      <div class=\"rightside-content-hold\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"!layoutConf.topbarFixed\">\r\n        <!-- View Loader -->\r\n        <div class=\"view-loader\" *ngIf=\"isModuleLoading\">\r\n          <div class=\"spinner\">\r\n            <div class=\"double-bounce1 mat-bg-accent\"></div>\r\n            <div class=\"double-bounce2 mat-bg-primary\"></div>\r\n          </div>\r\n        </div>\r\n        <!-- Breadcrumb -->\r\n        <app-breadcrumb></app-breadcrumb>\r\n        <!-- View outlet -->\r\n        <router-outlet></router-outlet>\r\n      </div>\r\n    </div>\r\n    <!-- View overlay for mobile navigation -->\r\n    <div class=\"sidebar-backdrop\"\r\n    [ngClass]=\"{'visible': layoutConf.sidebarStyle !== 'closed' && layoutConf.isMobile}\"\r\n    (click)=\"closeSidebar()\"></div>\r\n    \r\n    <!-- Notificaation bar -->\r\n    <mat-sidenav #notificationPanel mode=\"over\" class=\"\" position=\"end\">\r\n      <div class=\"navigation-hold\" fxLayout=\"column\">\r\n        <app-notifications [notificPanel]=\"notificationPanel\"></app-notifications>\r\n      </div>\r\n    </mat-sidenav>\r\n  </mat-sidenav-container>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/layouts/advisor-layout/advisor-layout.component.ts":
/*!**************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/advisor-layout/advisor-layout.component.ts ***!
  \**************************************************************************************/
/*! exports provided: AdvisorLayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdvisorLayoutComponent", function() { return AdvisorLayoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





// import PerfectScrollbar from 'perfect-scrollbar';


var AdvisorLayoutComponent = /** @class */ (function () {
    function AdvisorLayoutComponent(router, translate, themeService, layout, media) {
        var _this = this;
        this.router = router;
        this.translate = translate;
        this.themeService = themeService;
        this.layout = layout;
        this.media = media;
        this.isModuleLoading = false;
        // private sidebarPS: PerfectScrollbar;
        // private bodyPS: PerfectScrollbar;
        // private headerFixedBodyPS: PerfectScrollbar;
        this.scrollConfig = {};
        this.layoutConf = {};
        // Close sidenav after route change in mobile
        this.routerEventSub = router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; }))
            .subscribe(function (routeChange) {
            _this.layout.adjustLayout({ route: routeChange.url });
        });
        // Translator init
        var browserLang = translate.getBrowserLang();
        translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    }
    AdvisorLayoutComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        // this.layout.adjustLayout();
        // console.log(this.layoutConf)
        // FOR MODULE LOADER FLAG
        this.moduleLoaderSub = this.router.events.subscribe(function (event) {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadStart"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveStart"]) {
                _this.isModuleLoading = true;
            }
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadEnd"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveEnd"]) {
                _this.isModuleLoading = false;
            }
        });
    };
    AdvisorLayoutComponent.prototype.onResize = function (event) {
        this.layout.adjustLayout(event);
    };
    AdvisorLayoutComponent.prototype.ngAfterViewInit = function () {
        // this.layoutConfSub = this.layout.layoutConf$.subscribe(change => {
        //   // this.initBodyPS(change)
        // })
    };
    // initBodyPS(layoutConf:any = {}) {
    //   if(layoutConf.navigationPos === 'side' && layoutConf.topbarFixed) {
    //     if (this.bodyPS) this.bodyPS.destroy();
    //     if (this.headerFixedBodyPS) this.headerFixedBodyPS.destroy();
    //     this.headerFixedBodyPS = new PerfectScrollbar('.rightside-content-hold', {
    //       suppressScrollX: true
    //     });
    //     this.scrollToTop('.rightside-content-hold');
    //   } else {
    //     if (this.bodyPS) this.bodyPS.destroy();
    //     if (this.headerFixedBodyPS) this.headerFixedBodyPS.destroy();
    //     this.bodyPS = new PerfectScrollbar('.main-content-wrap', {
    //       suppressScrollX: true
    //     });
    //     this.scrollToTop('.main-content-wrap');
    //   }
    // }
    AdvisorLayoutComponent.prototype.scrollToTop = function (selector) {
        if (document) {
            var element = document.querySelector(selector);
            element.scrollTop = 0;
        }
    };
    AdvisorLayoutComponent.prototype.ngOnDestroy = function () {
        if (this.moduleLoaderSub) {
            this.moduleLoaderSub.unsubscribe();
        }
        if (this.layoutConfSub) {
            this.layoutConfSub.unsubscribe();
        }
        if (this.routerEventSub) {
            this.routerEventSub.unsubscribe();
        }
    };
    AdvisorLayoutComponent.prototype.closeSidebar = function () {
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('window:resize', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AdvisorLayoutComponent.prototype, "onResize", null);
    AdvisorLayoutComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-advisor-layout',
            template: __webpack_require__(/*! ./advisor-layout.template.html */ "./src/app/shared/components/layouts/advisor-layout/advisor-layout.template.html")
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _services_theme_service__WEBPACK_IMPORTED_MODULE_4__["ThemeService"],
            _services_layout_service__WEBPACK_IMPORTED_MODULE_5__["LayoutService"],
            _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["ObservableMedia"]])
    ], AdvisorLayoutComponent);
    return AdvisorLayoutComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/layouts/advisor-layout/advisor-layout.template.html":
/*!***************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/advisor-layout/advisor-layout.template.html ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-admin-wrap\" [dir]='layoutConf.dir'>\r\n  <!-- Header for top navigation layout -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT -->\r\n  <app-advisor-header-top \r\n    *ngIf=\"layoutConf.navigationPos === 'top'\" \r\n    [notificPanel]=\"notificationPanel\">\r\n  </app-advisor-header-top>\r\n  <!-- Main Container -->\r\n  <mat-sidenav-container \r\n  [dir]='layoutConf.dir'\r\n  class=\"app-admin-container app-side-nav-container mat-drawer-transition\"\r\n  [ngClass]=\"{\r\n    'navigation-top': layoutConf.navigationPos === 'top',\r\n    'sidebar-full': layoutConf.sidebarStyle === 'full',\r\n    'sidebar-compact': layoutConf.sidebarStyle === 'compact' && layoutConf.navigationPos === 'side',\r\n    'sidebar-compact-big': layoutConf.sidebarStyle === 'compact-big' && layoutConf.navigationPos === 'side',\r\n    'layout-intransition': layoutConf.layoutInTransition,\r\n    'sidebar-opened': layoutConf.sidebarStyle !== 'closed' && layoutConf.navigationPos === 'side',\r\n    'sidebar-closed': layoutConf.sidebarStyle === 'closed',\r\n    'fixed-topbar': layoutConf.topbarFixed && layoutConf.navigationPos === 'side'\r\n  }\">\r\n  <!-- SIDEBAR -->\r\n  <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n  <app-sidebar-side *ngIf=\"layoutConf.navigationPos === 'side'\"></app-sidebar-side>\r\n  \r\n  <!-- Top navigation layout (navigation for mobile screen) -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION MOBILE LAYOUT -->\r\n  <app-sidebar-top *ngIf=\"layoutConf.navigationPos === 'top' && layoutConf.isMobile\"></app-sidebar-top>\r\n\r\n    <!-- App content -->\r\n    <div class=\"main-content-wrap\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"layoutConf.topbarFixed\">\r\n      <!-- Header for side navigation layout -->\r\n      <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n      <app-header-side \r\n        *ngIf=\"layoutConf.navigationPos === 'side'\"\r\n        [notificPanel]=\"notificationPanel\">\r\n      </app-header-side>\r\n\r\n      <div class=\"rightside-content-hold\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"!layoutConf.topbarFixed\">\r\n        <!-- View Loader -->\r\n        <div class=\"view-loader\" *ngIf=\"isModuleLoading\">\r\n          <div class=\"spinner\">\r\n            <div class=\"double-bounce1 mat-bg-accent\"></div>\r\n            <div class=\"double-bounce2 mat-bg-primary\"></div>\r\n          </div>\r\n        </div>\r\n        <!-- Breadcrumb -->\r\n        <app-breadcrumb></app-breadcrumb>\r\n        <!-- View outlet -->\r\n        <router-outlet></router-outlet>\r\n      </div>\r\n    </div>\r\n    <!-- View overlay for mobile navigation -->\r\n    <div class=\"sidebar-backdrop\"\r\n    [ngClass]=\"{'visible': layoutConf.sidebarStyle !== 'closed' && layoutConf.isMobile}\"\r\n    (click)=\"closeSidebar()\"></div>\r\n    \r\n    <!-- Notificaation bar -->\r\n    <mat-sidenav #notificationPanel mode=\"over\" class=\"\" position=\"end\">\r\n      <div class=\"navigation-hold\" fxLayout=\"column\">\r\n        <app-notifications [notificPanel]=\"notificationPanel\"></app-notifications>\r\n      </div>\r\n    </mat-sidenav>\r\n  </mat-sidenav-container>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/layouts/auth-layout/auth-layout.component.html":
/*!**********************************************************************************!*\
  !*** ./src/app/shared/components/layouts/auth-layout/auth-layout.component.html ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>"

/***/ }),

/***/ "./src/app/shared/components/layouts/auth-layout/auth-layout.component.ts":
/*!********************************************************************************!*\
  !*** ./src/app/shared/components/layouts/auth-layout/auth-layout.component.ts ***!
  \********************************************************************************/
/*! exports provided: AuthLayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthLayoutComponent", function() { return AuthLayoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var AuthLayoutComponent = /** @class */ (function () {
    function AuthLayoutComponent() {
    }
    AuthLayoutComponent.prototype.ngOnInit = function () {
        var locationArray = location.href.split("/");
        if (locationArray.indexOf("auth") > -1) {
            var htmlTag = document.getElementsByTagName("html")[0];
            var bodyTag = document.getElementsByTagName("body")[0];
            htmlTag.className += " llp--auth--wrapper";
            bodyTag.className += " llp--auth--wrapper";
        }
    };
    AuthLayoutComponent.prototype.ngOnDestroy = function () {
        var locationArray = location.href.split("/");
        if (locationArray.indexOf("auth") > -1) {
            //html
            var htmlTag = document.getElementsByTagName("html")[0];
            var htmlClasses = htmlTag.className && htmlTag.className.length > 0 ? htmlTag.className.split(" ") : [];
            var myclassHtmlIndex = htmlClasses.indexOf('llp--auth--wrapper');
            if (myclassHtmlIndex > -1) {
                htmlClasses.splice(myclassHtmlIndex, 1);
                htmlTag.className = htmlClasses.join(" ");
            }
            //body 
            var bodyTag = document.getElementsByTagName("body")[0];
            var bodyClasses = bodyTag.className && bodyTag.className.length > 0 ? bodyTag.className.split(" ") : [];
            var myclassBodyIndex = bodyClasses.indexOf('llp--auth--wrapper');
            if (myclassBodyIndex > -1) {
                bodyClasses.splice(myclassBodyIndex, 1);
                bodyTag.className = bodyClasses.join(" ");
            }
        }
    };
    AuthLayoutComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-auth-layout',
            template: __webpack_require__(/*! ./auth-layout.component.html */ "./src/app/shared/components/layouts/auth-layout/auth-layout.component.html")
        }),
        __metadata("design:paramtypes", [])
    ], AuthLayoutComponent);
    return AuthLayoutComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/layouts/customer-layout/customer-layout.component.ts":
/*!****************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/customer-layout/customer-layout.component.ts ***!
  \****************************************************************************************/
/*! exports provided: CustomerLayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomerLayoutComponent", function() { return CustomerLayoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





// import PerfectScrollbar from 'perfect-scrollbar';


var CustomerLayoutComponent = /** @class */ (function () {
    function CustomerLayoutComponent(router, translate, themeService, layout, media) {
        var _this = this;
        this.router = router;
        this.translate = translate;
        this.themeService = themeService;
        this.layout = layout;
        this.media = media;
        this.isModuleLoading = false;
        // private sidebarPS: PerfectScrollbar;
        this.scrollConfig = {};
        this.layoutConf = {};
        // Close sidenav after route change in mobile
        this.routerEventSub = router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; }))
            .subscribe(function (routeChange) {
            _this.layout.adjustLayout({ route: routeChange.url });
        });
        // Translator init
        var browserLang = translate.getBrowserLang();
        translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    }
    CustomerLayoutComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.layoutConf = this.layout.layoutConf;
        // FOR MODULE LOADER FLAG
        this.moduleLoaderSub = this.router.events.subscribe(function (event) {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadStart"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveStart"]) {
                _this.isModuleLoading = true;
            }
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouteConfigLoadEnd"] || event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["ResolveEnd"]) {
                _this.isModuleLoading = false;
            }
        });
    };
    CustomerLayoutComponent.prototype.onResize = function (event) {
        this.layout.adjustLayout(event);
    };
    CustomerLayoutComponent.prototype.scrollToTop = function (selector) {
        if (document) {
            var element = document.querySelector(selector);
            element.scrollTop = 0;
        }
    };
    CustomerLayoutComponent.prototype.ngOnDestroy = function () {
        if (this.moduleLoaderSub) {
            this.moduleLoaderSub.unsubscribe();
        }
        if (this.layoutConfSub) {
            this.layoutConfSub.unsubscribe();
        }
        if (this.routerEventSub) {
            this.routerEventSub.unsubscribe();
        }
    };
    CustomerLayoutComponent.prototype.closeSidebar = function () {
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('window:resize', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], CustomerLayoutComponent.prototype, "onResize", null);
    CustomerLayoutComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-customer-layout',
            template: __webpack_require__(/*! ./customer-layout.template.html */ "./src/app/shared/components/layouts/customer-layout/customer-layout.template.html")
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"],
            _services_theme_service__WEBPACK_IMPORTED_MODULE_4__["ThemeService"],
            _services_layout_service__WEBPACK_IMPORTED_MODULE_5__["LayoutService"],
            _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["ObservableMedia"]])
    ], CustomerLayoutComponent);
    return CustomerLayoutComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/layouts/customer-layout/customer-layout.template.html":
/*!*****************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/customer-layout/customer-layout.template.html ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-admin-wrap\" [dir]='layoutConf.dir'>\r\n  <!-- Header for top navigation layout -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT -->\r\n  <app-customer-header-top\r\n    *ngIf=\"layoutConf.navigationPos === 'top'\" \r\n    [notificPanel]=\"notificationPanel\">\r\n  </app-customer-header-top>\r\n  <!-- Main Container -->\r\n  <mat-sidenav-container \r\n  [dir]='layoutConf.dir'\r\n  class=\"app-admin-container app-side-nav-container mat-drawer-transition\"\r\n  [ngClass]=\"{\r\n    'navigation-top': layoutConf.navigationPos === 'top',\r\n    'sidebar-full': layoutConf.sidebarStyle === 'full',\r\n    'sidebar-compact': layoutConf.sidebarStyle === 'compact' && layoutConf.navigationPos === 'side',\r\n    'sidebar-compact-big': layoutConf.sidebarStyle === 'compact-big' && layoutConf.navigationPos === 'side',\r\n    'layout-intransition': layoutConf.layoutInTransition,\r\n    'sidebar-opened': layoutConf.sidebarStyle !== 'closed' && layoutConf.navigationPos === 'side',\r\n    'sidebar-closed': layoutConf.sidebarStyle === 'closed',\r\n    'fixed-topbar': layoutConf.topbarFixed && layoutConf.navigationPos === 'side'\r\n  }\">\r\n  <!-- SIDEBAR -->\r\n  <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n  <app-sidebar-side *ngIf=\"layoutConf.navigationPos === 'side'\"></app-sidebar-side>\r\n  \r\n  <!-- Top navigation layout (navigation for mobile screen) -->\r\n  <!-- ONLY REQUIRED FOR **TOP** NAVIGATION MOBILE LAYOUT -->\r\n  <app-sidebar-top *ngIf=\"layoutConf.navigationPos === 'top' && layoutConf.isMobile\"></app-sidebar-top>\r\n\r\n    <!-- App content -->\r\n    <div class=\"main-content-wrap\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"layoutConf.topbarFixed\">\r\n      <!-- Header for side navigation layout -->\r\n      <!-- ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT -->\r\n      <app-header-side \r\n        *ngIf=\"layoutConf.navigationPos === 'side'\"\r\n        [notificPanel]=\"notificationPanel\">\r\n      </app-header-side>\r\n\r\n      <div class=\"rightside-content-hold\" [perfectScrollbar]=\"scrollConfig\" [disabled]=\"!layoutConf.topbarFixed\">\r\n        <!-- View Loader -->\r\n        <div class=\"view-loader\" *ngIf=\"isModuleLoading\">\r\n          <div class=\"spinner\">\r\n            <div class=\"double-bounce1 mat-bg-accent\"></div>\r\n            <div class=\"double-bounce2 mat-bg-primary\"></div>\r\n          </div>\r\n        </div>\r\n        <!-- Breadcrumb -->\r\n        <app-breadcrumb></app-breadcrumb>\r\n        <!-- View outlet -->\r\n        <router-outlet></router-outlet>\r\n      </div>\r\n    </div>\r\n    <!-- View overlay for mobile navigation -->\r\n    <div class=\"sidebar-backdrop\"\r\n    [ngClass]=\"{'visible': layoutConf.sidebarStyle !== 'closed' && layoutConf.isMobile}\"\r\n    (click)=\"closeSidebar()\"></div>\r\n    \r\n    <!-- Notificaation bar -->\r\n    <mat-sidenav #notificationPanel mode=\"over\" class=\"\" position=\"end\">\r\n      <div class=\"navigation-hold\" fxLayout=\"column\">\r\n        <app-notifications [notificPanel]=\"notificationPanel\"></app-notifications>\r\n      </div>\r\n    </mat-sidenav>\r\n  </mat-sidenav-container>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/layouts/landing-layout/landing-layout.component.html":
/*!****************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/landing-layout/landing-layout.component.html ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>"

/***/ }),

/***/ "./src/app/shared/components/layouts/landing-layout/landing-layout.component.ts":
/*!**************************************************************************************!*\
  !*** ./src/app/shared/components/layouts/landing-layout/landing-layout.component.ts ***!
  \**************************************************************************************/
/*! exports provided: LandingLayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LandingLayoutComponent", function() { return LandingLayoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var LandingLayoutComponent = /** @class */ (function () {
    function LandingLayoutComponent() {
    }
    LandingLayoutComponent.prototype.ngOnInit = function () {
    };
    LandingLayoutComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-landing-layout',
            template: __webpack_require__(/*! ./landing-layout.component.html */ "./src/app/shared/components/layouts/landing-layout/landing-layout.component.html")
        }),
        __metadata("design:paramtypes", [])
    ], LandingLayoutComponent);
    return LandingLayoutComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/notifications/notifications.component.html":
/*!******************************************************************************!*\
  !*** ./src/app/shared/components/notifications/notifications.component.html ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"text-center mat-bg-primary pt-1 pb-1\">\r\n  <h6 class=\"m-0\">Notifications</h6>\r\n</div>\r\n<mat-nav-list class=\"notification-list\" role=\"list\">\r\n  <!-- Notification item -->\r\n  <mat-list-item *ngFor=\"let n of notifications\" class=\"notific-item\" role=\"listitem\" routerLinkActive=\"open\">\r\n    <mat-icon [color]=\"n.color\" class=\"notific-icon mr-1\">{{n.icon}}</mat-icon>\r\n    <a [routerLink]=\"[n.route || '/dashboard']\">\r\n      <div class=\"mat-list-text\">\r\n        <h4 class=\"message\">{{n.message}}</h4>\r\n        <small class=\"time text-muted\">{{n.time}}</small>\r\n      </div>\r\n    </a>\r\n  </mat-list-item>\r\n</mat-nav-list>\r\n<div class=\"text-center mt-1\" *ngIf=\"notifications.length\">\r\n  <small><a href=\"#\" (click)=\"clearAll($event)\">Clear all notifications</a></small>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/notifications/notifications.component.ts":
/*!****************************************************************************!*\
  !*** ./src/app/shared/components/notifications/notifications.component.ts ***!
  \****************************************************************************/
/*! exports provided: NotificationsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotificationsComponent", function() { return NotificationsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var NotificationsComponent = /** @class */ (function () {
    function NotificationsComponent(router) {
        this.router = router;
        // Dummy notifications
        this.notifications = [{
                message: 'New contact added',
                icon: 'assignment_ind',
                time: '1 min ago',
                route: '/inbox',
                color: 'primary'
            }, {
                message: 'New message',
                icon: 'chat',
                time: '4 min ago',
                route: '/chat',
                color: 'accent'
            }, {
                message: 'Server rebooted',
                icon: 'settings_backup_restore',
                time: '12 min ago',
                route: '/charts',
                color: 'warn'
            }];
    }
    NotificationsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.router.events.subscribe(function (routeChange) {
            if (routeChange instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]) {
                _this.notificPanel.close();
            }
        });
    };
    NotificationsComponent.prototype.clearAll = function (e) {
        e.preventDefault();
        this.notifications = [];
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], NotificationsComponent.prototype, "notificPanel", void 0);
    NotificationsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-notifications',
            template: __webpack_require__(/*! ./notifications.component.html */ "./src/app/shared/components/notifications/notifications.component.html")
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], NotificationsComponent);
    return NotificationsComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/sidebar-side/sidebar-side.component.html":
/*!****************************************************************************!*\
  !*** ./src/app/shared/components/sidebar-side/sidebar-side.component.html ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"sidebar-panel\">\r\n  <div id=\"scroll-area\" [perfectScrollbar] class=\"navigation-hold\" fxLayout=\"column\">\r\n    <!-- App Logo -->\r\n    <div class=\"branding default-bg\">\r\n      <img src=\"assets/images/logo.png\" alt=\"\" class=\"app-logo\">\r\n      <!-- Two different logos for dark and light themes -->\r\n      <img \r\n      src=\"assets/images/logo-text-white.png\" \r\n      alt=\"\" \r\n      class=\"app-logo-text\"\r\n      *ngIf=\"themeService.activatedTheme?.name?.indexOf('dark') !== -1\">\r\n      <img \r\n      src=\"assets/images/logo-text.png\" \r\n      alt=\"\" \r\n      class=\"app-logo-text\"\r\n      *ngIf=\"themeService.activatedTheme?.name?.indexOf('dark') === -1\">\r\n    </div>\r\n\r\n    <!-- Sidebar user -->\r\n    <div class=\"app-user\">\r\n      <div class=\"app-user-photo\">\r\n        <img src=\"assets/images/face-7.jpg\" alt=\"\">\r\n      </div>\r\n      <span class=\"app-user-name mb-05\">\r\n        <mat-icon class=\"icon-xs text-muted\">lock</mat-icon> \r\n        Watson Joyce\r\n      </span>\r\n      <!-- Small buttons -->\r\n      <div class=\"app-user-controls\">\r\n        <button \r\n        class=\"text-muted\"\r\n        mat-icon-button \r\n        mat-xs-button\r\n        [matMenuTriggerFor]=\"appUserMenu\">\r\n          <mat-icon>settings</mat-icon>\r\n        </button>\r\n        <button \r\n        class=\"text-muted\"\r\n        mat-icon-button \r\n        mat-xs-button\r\n        matTooltip=\"Inbox\"\r\n        routerLink=\"/inbox\">\r\n          <mat-icon>email</mat-icon>\r\n        </button>\r\n        <button \r\n        class=\"text-muted\"\r\n        mat-icon-button \r\n        mat-xs-button\r\n        matTooltip=\"Sign Out\"\r\n        routerLink=\"/sessions/signin\">\r\n          <mat-icon>exit_to_app</mat-icon>\r\n        </button>\r\n        <mat-menu #appUserMenu=\"matMenu\">\r\n            <button mat-menu-item routerLink=\"/profile/overview\">\r\n              <mat-icon>account_box</mat-icon>\r\n              <span>Profile</span>\r\n            </button>\r\n            <button mat-menu-item routerLink=\"/profile/settings\">\r\n              <mat-icon>settings</mat-icon>\r\n              <span>Account Settings</span>\r\n            </button>\r\n            <button mat-menu-item routerLink=\"/calendar\">\r\n              <mat-icon>date_range</mat-icon>\r\n              <span>Calendar</span>\r\n            </button>\r\n            <button mat-menu-item routerLink=\"/sessions/signin\">\r\n              <mat-icon>exit_to_app</mat-icon>\r\n              <span>Sign out</span>\r\n            </button>\r\n          </mat-menu>\r\n      </div>\r\n    </div>\r\n    <!-- Navigation -->\r\n    <app-sidenav [items]=\"menuItems\" [hasIconMenu]=\"hasIconTypeMenuItem\" [iconMenuTitle]=\"iconTypeMenuTitle\"></app-sidenav>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/sidebar-side/sidebar-side.component.ts":
/*!**************************************************************************!*\
  !*** ./src/app/shared/components/sidebar-side/sidebar-side.component.ts ***!
  \**************************************************************************/
/*! exports provided: SidebarSideComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidebarSideComponent", function() { return SidebarSideComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/navigation.service */ "./src/app/shared/services/navigation.service.ts");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/theme.service */ "./src/app/shared/services/theme.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



// import PerfectScrollbar from 'perfect-scrollbar';
var SidebarSideComponent = /** @class */ (function () {
    function SidebarSideComponent(navService, themeService) {
        this.navService = navService;
        this.themeService = themeService;
    }
    SidebarSideComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.iconTypeMenuTitle = this.navService.iconTypeMenuTitle;
        this.menuItemsSub = this.navService.menuItems$.subscribe(function (menuItem) {
            _this.menuItems = menuItem;
            //Checks item list has any icon type.
            _this.hasIconTypeMenuItem = !!_this.menuItems.filter(function (item) { return item.type === 'icon'; }).length;
        });
    };
    SidebarSideComponent.prototype.ngAfterViewInit = function () {
        // setTimeout(() => {
        //   this.sidebarPS = new PerfectScrollbar('#scroll-area', {
        //     suppressScrollX: true
        //   })
        // })
    };
    SidebarSideComponent.prototype.ngOnDestroy = function () {
        // if(this.sidebarPS) {
        //   this.sidebarPS.destroy();
        // }
        if (this.menuItemsSub) {
            this.menuItemsSub.unsubscribe();
        }
    };
    SidebarSideComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-sidebar-side',
            template: __webpack_require__(/*! ./sidebar-side.component.html */ "./src/app/shared/components/sidebar-side/sidebar-side.component.html")
        }),
        __metadata("design:paramtypes", [_shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__["NavigationService"],
            _services_theme_service__WEBPACK_IMPORTED_MODULE_2__["ThemeService"]])
    ], SidebarSideComponent);
    return SidebarSideComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/sidebar-top/sidebar-top.component.html":
/*!**************************************************************************!*\
  !*** ./src/app/shared/components/sidebar-top/sidebar-top.component.html ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"sidebar-panel\">\r\n  <div id=\"sidebar-top-scroll-area\" [perfectScrollbar] class=\"navigation-hold\" fxLayout=\"column\">\r\n    <app-sidenav [items]=\"menuItems\"></app-sidenav>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/components/sidebar-top/sidebar-top.component.ts":
/*!************************************************************************!*\
  !*** ./src/app/shared/components/sidebar-top/sidebar-top.component.ts ***!
  \************************************************************************/
/*! exports provided: SidebarTopComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidebarTopComponent", function() { return SidebarTopComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/services/navigation.service */ "./src/app/shared/services/navigation.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

// import PerfectScrollbar from 'perfect-scrollbar';

var SidebarTopComponent = /** @class */ (function () {
    function SidebarTopComponent(navService) {
        this.navService = navService;
    }
    SidebarTopComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.menuItemsSub = this.navService.menuItems$.subscribe(function (menuItem) {
            _this.menuItems = menuItem.filter(function (item) { return item.type !== 'icon' && item.type !== 'separator'; });
        });
    };
    SidebarTopComponent.prototype.ngAfterViewInit = function () {
        // setTimeout(() => {
        //   this.sidebarPS = new PerfectScrollbar('#sidebar-top-scroll-area', {
        //     suppressScrollX: true
        //   })
        // })
    };
    SidebarTopComponent.prototype.ngOnDestroy = function () {
        // if(this.sidebarPS) {
        //   this.sidebarPS.destroy();
        // }
        if (this.menuItemsSub) {
            this.menuItemsSub.unsubscribe();
        }
    };
    SidebarTopComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-sidebar-top',
            template: __webpack_require__(/*! ./sidebar-top.component.html */ "./src/app/shared/components/sidebar-top/sidebar-top.component.html")
        }),
        __metadata("design:paramtypes", [_shared_services_navigation_service__WEBPACK_IMPORTED_MODULE_1__["NavigationService"]])
    ], SidebarTopComponent);
    return SidebarTopComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/sidenav/sidenav.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/components/sidenav/sidenav.component.ts ***!
  \****************************************************************/
/*! exports provided: SidenavComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidenavComponent", function() { return SidenavComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var SidenavComponent = /** @class */ (function () {
    function SidenavComponent() {
        this.menuItems = [];
    }
    SidenavComponent.prototype.ngOnInit = function () { };
    // Only for demo purpose
    SidenavComponent.prototype.addMenuItem = function () {
        this.menuItems.push({
            name: 'ITEM',
            type: 'dropDown',
            tooltip: 'Item',
            icon: 'done',
            state: 'material',
            sub: [
                { name: 'SUBITEM', state: 'cards' },
                { name: 'SUBITEM', state: 'buttons' }
            ]
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('items'),
        __metadata("design:type", Array)
    ], SidenavComponent.prototype, "menuItems", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('hasIconMenu'),
        __metadata("design:type", Boolean)
    ], SidenavComponent.prototype, "hasIconTypeMenuItem", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('iconMenuTitle'),
        __metadata("design:type", String)
    ], SidenavComponent.prototype, "iconTypeMenuTitle", void 0);
    SidenavComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-sidenav',
            template: __webpack_require__(/*! ./sidenav.template.html */ "./src/app/shared/components/sidenav/sidenav.template.html")
        }),
        __metadata("design:paramtypes", [])
    ], SidenavComponent);
    return SidenavComponent;
}());



/***/ }),

/***/ "./src/app/shared/components/sidenav/sidenav.template.html":
/*!*****************************************************************!*\
  !*** ./src/app/shared/components/sidenav/sidenav.template.html ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"sidenav-hold\">\r\n  <div class=\"icon-menu\" *ngIf=\"hasIconTypeMenuItem\">\r\n    <!-- Icon menu separator -->\r\n    <div class=\"mt-1 mb-1 nav-item-sep\">\r\n      <mat-divider [ngStyle]=\"{margin: '0 -24px'}\"></mat-divider>\r\n      <span class=\"text-muted icon-menu-title\">{{iconTypeMenuTitle}}</span>\r\n    </div>\r\n    <!-- Icon menu items -->\r\n    <div class=\"icon-menu-item\" *ngFor=\"let item of menuItems\">\r\n      <button *ngIf=\"!item.disabled && item.type === 'icon'\" mat-raised-button [matTooltip]=\"item.tooltip\" routerLink=\"/{{item.state}}\"\r\n        routerLinkActive=\"mat-bg-primary\">\r\n        <mat-icon>{{item.icon}}</mat-icon>\r\n      </button>\r\n    </div>\r\n  </div>\r\n\r\n  <ul appDropdown class=\"sidenav\">\r\n    <li *ngFor=\"let item of menuItems\" appDropdownLink routerLinkActive=\"open\">\r\n      <div class=\"nav-item-sep\" *ngIf=\"item.type === 'separator'\">\r\n        <mat-divider></mat-divider>\r\n        <span class=\"text-muted\">{{item.name | translate}}</span>\r\n      </div>\r\n      <div *ngIf=\"!item.disabled && item.type !== 'separator' && item.type !== 'icon'\" class=\"lvl1\">\r\n        <a routerLink=\"/{{item.state}}\" appDropdownToggle matRipple *ngIf=\"item.type === 'link'\">\r\n          <mat-icon>{{item.icon}}</mat-icon>\r\n          <span class=\"item-name lvl1\">{{item.name | translate}}</span>\r\n          <span fxFlex></span>\r\n          <span class=\"menuitem-badge mat-bg-{{ badge.color }}\" [ngStyle]=\"{background: badge.color}\" *ngFor=\"let badge of item.badges\">{{ badge.value }}</span>\r\n        </a>\r\n        <a [href]=\"item.state\" appDropdownToggle matRipple *ngIf=\"item.type === 'extLink'\" >\r\n          <mat-icon>{{item.icon}}</mat-icon>\r\n          <span class=\"item-name lvl1\">{{item.name | translate}}</span>\r\n          <span fxFlex></span>\r\n          <span class=\"menuitem-badge mat-bg-{{ badge.color }}\" [ngStyle]=\"{background: badge.color}\" *ngFor=\"let badge of item.badges\">{{ badge.value }}</span>\r\n        </a>\r\n\r\n        <!-- DropDown -->\r\n        <a *ngIf=\"item.type === 'dropDown'\" appDropdownToggle matRipple>\r\n          <mat-icon>{{item.icon}}</mat-icon>\r\n          <span class=\"item-name lvl1\">{{item.name | translate}}</span>\r\n          <span fxFlex></span>\r\n          <span class=\"menuitem-badge mat-bg-{{ badge.color }}\" [ngStyle]=\"{background: badge.color}\" *ngFor=\"let badge of item.badges\">{{ badge.value }}</span>\r\n          <mat-icon class=\"menu-caret\">keyboard_arrow_right</mat-icon>\r\n        </a>\r\n        <!-- LEVEL 2 -->\r\n        <ul class=\"submenu lvl2\" appDropdown *ngIf=\"item.type === 'dropDown'\">\r\n          <li *ngFor=\"let itemLvL2 of item.sub\" appDropdownLink routerLinkActive=\"open\">\r\n\r\n            <a routerLink=\"{{item.state ? '/'+item.state : ''}}/{{itemLvL2.state}}\" appDropdownToggle *ngIf=\"itemLvL2.type !== 'dropDown'\"\r\n              matRipple>\r\n              <span class=\"item-name lvl2\">{{itemLvL2.name | translate}}</span>\r\n              <span fxFlex></span>\r\n            </a>\r\n\r\n            <a *ngIf=\"itemLvL2.type === 'dropDown'\" appDropdownToggle matRipple>\r\n              <span class=\"item-name lvl2\">{{itemLvL2.name | translate}}</span>\r\n              <span fxFlex></span>\r\n              <mat-icon class=\"menu-caret\">keyboard_arrow_right</mat-icon>\r\n            </a>\r\n\r\n            <!-- LEVEL 3 -->\r\n            <ul class=\"submenu lvl3\" appDropdown *ngIf=\"itemLvL2.type === 'dropDown'\">\r\n              <li *ngFor=\"let itemLvL3 of itemLvL2.sub\" appDropdownLink routerLinkActive=\"open\">\r\n                <a routerLink=\"{{item.state ? '/'+item.state : ''}}{{itemLvL2.state ? '/'+itemLvL2.state : ''}}/{{itemLvL3.state}}\" appDropdownToggle\r\n                  matRipple>\r\n                  <span class=\"item-name lvl3\">{{itemLvL3.name | translate}}</span>\r\n                </a>\r\n              </li>\r\n            </ul>\r\n\r\n          </li>\r\n        </ul>\r\n      </div>\r\n    </li>\r\n  </ul>\r\n</div>"

/***/ }),

/***/ "./src/app/shared/directives/dropdown-anchor.directive.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/directives/dropdown-anchor.directive.ts ***!
  \****************************************************************/
/*! exports provided: DropdownAnchorDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DropdownAnchorDirective", function() { return DropdownAnchorDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _dropdown_link_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dropdown-link.directive */ "./src/app/shared/directives/dropdown-link.directive.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var DropdownAnchorDirective = /** @class */ (function () {
    function DropdownAnchorDirective(navlink) {
        this.navlink = navlink;
    }
    DropdownAnchorDirective.prototype.onClick = function (e) {
        this.navlink.toggle();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], DropdownAnchorDirective.prototype, "onClick", null);
    DropdownAnchorDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[appDropdownToggle]'
        }),
        __param(0, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"])(_dropdown_link_directive__WEBPACK_IMPORTED_MODULE_1__["DropdownLinkDirective"])),
        __metadata("design:paramtypes", [_dropdown_link_directive__WEBPACK_IMPORTED_MODULE_1__["DropdownLinkDirective"]])
    ], DropdownAnchorDirective);
    return DropdownAnchorDirective;
}());



/***/ }),

/***/ "./src/app/shared/directives/dropdown-link.directive.ts":
/*!**************************************************************!*\
  !*** ./src/app/shared/directives/dropdown-link.directive.ts ***!
  \**************************************************************/
/*! exports provided: DropdownLinkDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DropdownLinkDirective", function() { return DropdownLinkDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _dropdown_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dropdown.directive */ "./src/app/shared/directives/dropdown.directive.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var DropdownLinkDirective = /** @class */ (function () {
    function DropdownLinkDirective(nav) {
        this.nav = nav;
    }
    Object.defineProperty(DropdownLinkDirective.prototype, "open", {
        get: function () {
            return this._open;
        },
        set: function (value) {
            this._open = value;
            if (value) {
                this.nav.closeOtherLinks(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    DropdownLinkDirective.prototype.ngOnInit = function () {
        this.nav.addLink(this);
    };
    DropdownLinkDirective.prototype.ngOnDestroy = function () {
        this.nav.removeGroup(this);
    };
    DropdownLinkDirective.prototype.toggle = function () {
        this.open = !this.open;
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], DropdownLinkDirective.prototype, "group", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostBinding"])('class.open'),
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], DropdownLinkDirective.prototype, "open", null);
    DropdownLinkDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[appDropdownLink]'
        }),
        __param(0, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"])(_dropdown_directive__WEBPACK_IMPORTED_MODULE_1__["AppDropdownDirective"])),
        __metadata("design:paramtypes", [_dropdown_directive__WEBPACK_IMPORTED_MODULE_1__["AppDropdownDirective"]])
    ], DropdownLinkDirective);
    return DropdownLinkDirective;
}());



/***/ }),

/***/ "./src/app/shared/directives/dropdown.directive.ts":
/*!*********************************************************!*\
  !*** ./src/app/shared/directives/dropdown.directive.ts ***!
  \*********************************************************/
/*! exports provided: AppDropdownDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppDropdownDirective", function() { return AppDropdownDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppDropdownDirective = /** @class */ (function () {
    function AppDropdownDirective(router) {
        this.router = router;
        this.navlinks = [];
    }
    AppDropdownDirective.prototype.closeOtherLinks = function (openLink) {
        this.navlinks.forEach(function (link) {
            if (link !== openLink) {
                link.open = false;
            }
        });
    };
    AppDropdownDirective.prototype.addLink = function (link) {
        this.navlinks.push(link);
    };
    AppDropdownDirective.prototype.removeGroup = function (link) {
        var index = this.navlinks.indexOf(link);
        if (index !== -1) {
            this.navlinks.splice(index, 1);
        }
    };
    AppDropdownDirective.prototype.getUrl = function () {
        return this.router.url;
    };
    AppDropdownDirective.prototype.ngOnInit = function () {
        var _this = this;
        this._router = this.router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["filter"])(function (event) { return event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; })).subscribe(function (event) {
            _this.navlinks.forEach(function (link) {
                if (link.group) {
                    var routeUrl = _this.getUrl();
                    var currentUrl = routeUrl.split('/');
                    if (currentUrl.indexOf(link.group) > 0) {
                        link.open = true;
                        _this.closeOtherLinks(link);
                    }
                }
            });
        });
    };
    AppDropdownDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[appDropdown]'
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], AppDropdownDirective);
    return AppDropdownDirective;
}());



/***/ }),

/***/ "./src/app/shared/directives/egret-side-nav-toggle.directive.ts":
/*!**********************************************************************!*\
  !*** ./src/app/shared/directives/egret-side-nav-toggle.directive.ts ***!
  \**********************************************************************/
/*! exports provided: EgretSideNavToggleDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EgretSideNavToggleDirective", function() { return EgretSideNavToggleDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};



var EgretSideNavToggleDirective = /** @class */ (function () {
    function EgretSideNavToggleDirective(media, sideNav) {
        this.media = media;
        this.sideNav = sideNav;
    }
    EgretSideNavToggleDirective.prototype.ngOnInit = function () {
        this.initSideNav();
    };
    EgretSideNavToggleDirective.prototype.ngOnDestroy = function () {
        if (this.screenSizeWatcher) {
            this.screenSizeWatcher.unsubscribe();
        }
    };
    EgretSideNavToggleDirective.prototype.updateSidenav = function () {
        var self = this;
        setTimeout(function () {
            self.sideNav.opened = !self.isMobile;
            self.sideNav.mode = self.isMobile ? 'over' : 'side';
        });
    };
    EgretSideNavToggleDirective.prototype.initSideNav = function () {
        var _this = this;
        this.isMobile = this.media.isActive('xs') || this.media.isActive('sm');
        this.updateSidenav();
        this.screenSizeWatcher = this.media.subscribe(function (change) {
            _this.isMobile = (change.mqAlias == 'xs') || (change.mqAlias == 'sm');
            _this.updateSidenav();
        });
    };
    EgretSideNavToggleDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[EgretSideNavToggle]'
        }),
        __param(1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Host"])()), __param(1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Self"])()), __param(1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Optional"])()),
        __metadata("design:paramtypes", [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["ObservableMedia"],
            _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSidenav"]])
    ], EgretSideNavToggleDirective);
    return EgretSideNavToggleDirective;
}());



/***/ }),

/***/ "./src/app/shared/directives/font-size.directive.ts":
/*!**********************************************************!*\
  !*** ./src/app/shared/directives/font-size.directive.ts ***!
  \**********************************************************/
/*! exports provided: FontSizeDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FontSizeDirective", function() { return FontSizeDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};

var FontSizeDirective = /** @class */ (function () {
    function FontSizeDirective(fontSize, el) {
        this.fontSize = fontSize;
        this.el = el;
    }
    FontSizeDirective.prototype.ngOnInit = function () {
        this.el.nativeElement.fontSize = this.fontSize;
    };
    FontSizeDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({ selector: '[fontSize]' }),
        __param(0, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Attribute"])('fontSize')),
        __metadata("design:paramtypes", [String, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]])
    ], FontSizeDirective);
    return FontSizeDirective;
}());



/***/ }),

/***/ "./src/app/shared/directives/scroll-to.directive.ts":
/*!**********************************************************!*\
  !*** ./src/app/shared/directives/scroll-to.directive.ts ***!
  \**********************************************************/
/*! exports provided: ScrollToDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScrollToDirective", function() { return ScrollToDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};

var ScrollToDirective = /** @class */ (function () {
    function ScrollToDirective(elmID, el) {
        this.elmID = elmID;
        this.el = el;
    }
    ScrollToDirective.prototype.ngOnInit = function () { };
    ScrollToDirective.prototype.currentYPosition = function () {
        // Firefox, Chrome, Opera, Safari
        if (self.pageYOffset)
            return self.pageYOffset;
        // Internet Explorer 6 - standards mode
        if (document.documentElement && document.documentElement.scrollTop)
            return document.documentElement.scrollTop;
        // Internet Explorer 6, 7 and 8
        if (document.body.scrollTop)
            return document.body.scrollTop;
        return 0;
    };
    ;
    ScrollToDirective.prototype.elmYPosition = function (eID) {
        var elm = document.getElementById(eID);
        var y = elm.offsetTop;
        var node = elm;
        while (node.offsetParent && node.offsetParent != document.body) {
            node = node.offsetParent;
            y += node.offsetTop;
        }
        return y;
    };
    ;
    ScrollToDirective.prototype.smoothScroll = function () {
        if (!this.elmID)
            return;
        var startY = this.currentYPosition();
        var stopY = this.elmYPosition(this.elmID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY);
            return;
        }
        var speed = Math.round(distance / 50);
        if (speed >= 20)
            speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for (var i = startY; i < stopY; i += step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY += step;
                if (leapY > stopY)
                    leapY = stopY;
                timer++;
            }
            return;
        }
        for (var i = startY; i > stopY; i -= step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY -= step;
            if (leapY < stopY)
                leapY = stopY;
            timer++;
        }
        return false;
    };
    ;
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ScrollToDirective.prototype, "smoothScroll", null);
    ScrollToDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({ selector: '[scrollTo]' }),
        __param(0, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Attribute"])('scrollTo')),
        __metadata("design:paramtypes", [String, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]])
    ], ScrollToDirective);
    return ScrollToDirective;
}());



/***/ }),

/***/ "./src/app/shared/helpers/url.helper.ts":
/*!**********************************************!*\
  !*** ./src/app/shared/helpers/url.helper.ts ***!
  \**********************************************/
/*! exports provided: getQueryParam */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getQueryParam", function() { return getQueryParam; });
function getQueryParam(prop) {
    var params = {};
    var search = decodeURIComponent(window.location.href.slice(window.location.href.indexOf('?') + 1));
    var definitions = search.split('&');
    definitions.forEach(function (val, key) {
        var parts = val.split('=', 2);
        params[parts[0]] = parts[1];
    });
    return (prop && prop in params) ? params[prop] : params;
}


/***/ }),

/***/ "./src/app/shared/inmemory-db/chat-db.ts":
/*!***********************************************!*\
  !*** ./src/app/shared/inmemory-db/chat-db.ts ***!
  \***********************************************/
/*! exports provided: ChatDB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatDB", function() { return ChatDB; });
var ChatDB = /** @class */ (function () {
    function ChatDB() {
    }
    ChatDB.user = [
        {
            id: "7863a6802ez0e277a0f98534",
            name: "John Doe",
            avatar: "assets/images/face-1.jpg",
            status: "online",
            chatInfo: [
                {
                    chatId: "89564a680b3249760ea21fe77",
                    contactId: "323sa680b3249760ea21rt47",
                    contactName: "Frank Powell",
                    unread: 4,
                    lastChatTime: "2017-06-12T02:10:18.931Z"
                },
                {
                    chatId: "3289564a680b2134760ea21fe7753",
                    contactId: "14663a3406eb47ffa63d4fec9429cb71",
                    contactName: "Betty Diaz",
                    unread: 0,
                    lastChatTime: "2017-06-12T02:10:18.931Z"
                }
            ]
        }
    ];
    ChatDB.contacts = [
        {
            id: "323sa680b3249760ea21rt47",
            name: "Frank Powell",
            avatar: "assets/images/faces/13.jpg",
            status: "online",
            mood: ""
        },
        {
            id: "14663a3406eb47ffa63d4fec9429cb71",
            name: "Betty Diaz",
            avatar: "assets/images/faces/12.jpg",
            status: "online",
            mood: ""
        },
        {
            id: "43bd9bc59d164b5aea498e3ae1c24c3c",
            name: "Brian Stephens",
            avatar: "assets/images/faces/3.jpg",
            status: "online",
            mood: ""
        },
        {
            id: "3fc8e01f3ce649d1caf884fbf4f698e4",
            name: "Jacqueline Day",
            avatar: "assets/images/faces/16.jpg",
            status: "offline",
            mood: ""
        },
        {
            id: "e929b1d790ab49968ed8e34648553df4",
            name: "Arthur Mendoza",
            avatar: "assets/images/faces/10.jpg",
            status: "online",
            mood: ""
        },
        {
            id: "d6caf04bba614632b5fecf91aebf4564",
            name: "Jeremy Lee",
            avatar: "assets/images/faces/9.jpg",
            status: "offline",
            mood: ""
        },
        {
            id: "be0fb188c8e242f097fafa24632107e4",
            name: "Johnny Newman",
            avatar: "assets/images/faces/5.jpg",
            status: "offline",
            mood: ""
        },
        {
            id: "dea902191b964a68ba5f2d93cff37e13",
            name: "Jeffrey Little",
            avatar: "assets/images/faces/15.jpg",
            status: "online",
            mood: ""
        },
        {
            id: "0bf58f5ccc4543a9f8747350b7bda3c7",
            name: "Barbara Romero",
            avatar: "assets/images/faces/4.jpg",
            status: "offline",
            mood: ""
        },
        {
            id: "c5d7498bbcb84d81fc72168871ac6a6e",
            name: "Daniel James",
            avatar: "assets/images/faces/2.jpg",
            status: "offline",
            mood: ""
        },
        {
            id: "97bfbdd9413e46efdaca2010400fe18c",
            name: "Alice Sanders",
            avatar: "assets/images/faces/17.jpg",
            status: "offline",
            mood: ""
        }
    ];
    ChatDB.chatCollection = [
        {
            id: "89564a680b3249760ea21fe77",
            chats: [
                {
                    contactId: "323sa680b3249760ea21rt47",
                    text: "Do you ever find yourself falling into the “discount trap?”",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Giving away your knowledge or product just to gain clients?",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "323sa680b3249760ea21rt47",
                    text: "Yes",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Don’t feel bad. It happens to a lot of us",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "323sa680b3249760ea21rt47",
                    text: "Do you ever find yourself falling into the “discount trap?”",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Giving away your knowledge or product just to gain clients?",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "323sa680b3249760ea21rt47",
                    text: "Yes",
                    time: "2018-02-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Don’t feel bad. It happens to a lot of us",
                    time: "2018-02-32T08:45:28.291Z"
                }
            ]
        },
        {
            id: "3289564a680b2134760ea21fe7753",
            chats: [
                {
                    contactId: "14663a3406eb47ffa63d4fec9429cb71",
                    text: "Do you ever find yourself falling into the “discount trap?”",
                    time: "2018-03-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Giving away your knowledge or product just to gain clients?",
                    time: "2018-03-32T08:45:28.291Z"
                },
                {
                    contactId: "14663a3406eb47ffa63d4fec9429cb71",
                    text: "Yes",
                    time: "2018-03-32T08:45:28.291Z"
                },
                {
                    contactId: "7863a6802ez0e277a0f98534",
                    text: "Don’t feel bad. It happens to a lot of us",
                    time: "2018-03-32T08:45:28.291Z"
                }
            ]
        }
    ];
    return ChatDB;
}());



/***/ }),

/***/ "./src/app/shared/inmemory-db/inmemory-db.service.ts":
/*!***********************************************************!*\
  !*** ./src/app/shared/inmemory-db/inmemory-db.service.ts ***!
  \***********************************************************/
/*! exports provided: InMemoryDataService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InMemoryDataService", function() { return InMemoryDataService; });
/* harmony import */ var _chat_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat-db */ "./src/app/shared/inmemory-db/chat-db.ts");

var InMemoryDataService = /** @class */ (function () {
    function InMemoryDataService() {
    }
    InMemoryDataService.prototype.createDb = function () {
        return {
            'contacts': _chat_db__WEBPACK_IMPORTED_MODULE_0__["ChatDB"].contacts,
            'chat-collections': _chat_db__WEBPACK_IMPORTED_MODULE_0__["ChatDB"].chatCollection,
            'chat-user': _chat_db__WEBPACK_IMPORTED_MODULE_0__["ChatDB"].user
        };
    };
    return InMemoryDataService;
}());



/***/ }),

/***/ "./src/app/shared/pipes/excerpt.pipe.ts":
/*!**********************************************!*\
  !*** ./src/app/shared/pipes/excerpt.pipe.ts ***!
  \**********************************************/
/*! exports provided: ExcerptPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExcerptPipe", function() { return ExcerptPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ExcerptPipe = /** @class */ (function () {
    function ExcerptPipe() {
    }
    ExcerptPipe.prototype.transform = function (text, limit) {
        if (limit === void 0) { limit = 5; }
        if (text.length <= limit)
            return text;
        return text.substring(0, limit) + '...';
    };
    ExcerptPipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({ name: 'excerpt' })
    ], ExcerptPipe);
    return ExcerptPipe;
}());



/***/ }),

/***/ "./src/app/shared/pipes/get-value-by-key.pipe.ts":
/*!*******************************************************!*\
  !*** ./src/app/shared/pipes/get-value-by-key.pipe.ts ***!
  \*******************************************************/
/*! exports provided: GetValueByKeyPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GetValueByKeyPipe", function() { return GetValueByKeyPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var GetValueByKeyPipe = /** @class */ (function () {
    function GetValueByKeyPipe() {
    }
    GetValueByKeyPipe.prototype.transform = function (value, id, property) {
        var filteredObj = value.find(function (item) {
            if (item.id !== undefined) {
                return item.id === id;
            }
            return false;
        });
        if (filteredObj) {
            return filteredObj[property];
        }
    };
    GetValueByKeyPipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({
            name: "getValueByKey",
            pure: false
        })
    ], GetValueByKeyPipe);
    return GetValueByKeyPipe;
}());



/***/ }),

/***/ "./src/app/shared/pipes/relative-time.pipe.ts":
/*!****************************************************!*\
  !*** ./src/app/shared/pipes/relative-time.pipe.ts ***!
  \****************************************************/
/*! exports provided: RelativeTimePipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RelativeTimePipe", function() { return RelativeTimePipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var RelativeTimePipe = /** @class */ (function () {
    function RelativeTimePipe() {
    }
    RelativeTimePipe.prototype.transform = function (value) {
        if (!(value instanceof Date))
            value = new Date(value);
        var seconds = Math.floor(((new Date()).getTime() - value.getTime()) / 1000);
        var interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + " years ago";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months ago";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    };
    RelativeTimePipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({ name: 'relativeTime' })
    ], RelativeTimePipe);
    return RelativeTimePipe;
}());



/***/ }),

/***/ "./src/app/shared/services/advisor-nav-links.service.ts":
/*!**************************************************************!*\
  !*** ./src/app/shared/services/advisor-nav-links.service.ts ***!
  \**************************************************************/
/*! exports provided: AdvisorNavService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdvisorNavService", function() { return AdvisorNavService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AdvisorNavService = /** @class */ (function () {
    function AdvisorNavService() {
        // tslint:disable-next-line:member-ordering
        this.iconMenu = [
            {
                name: 'HOME',
                type: 'link',
                tooltip: 'Home',
                icon: 'home',
                state: 'advisor/nested1'
            },
            {
                name: 'Legacies',
                type: 'link',
                tooltip: 'Profile',
                icon: 'person',
                state: 'advisor/legacies'
            },
            {
                name: 'Leads',
                type: 'link',
                tooltip: 'Tour',
                icon: 'flight_takeoff',
                state: 'advisor/users'
            },
            {
                type: 'separator',
                name: 'Main Items'
            }
        ];
        // Icon menu TITLE at the very top of navigation.
        // This title will appear if any icon type item is present in menu.
        this.iconTypeMenuTitle = 'Frequently Accessed';
        // sets iconMenu as default;
        this.menuItems = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.iconMenu);
        // navigation component has subscribed to this Observable
        this.menuItems$ = this.menuItems.asObservable();
    }
    // Customizer component uses this method to change menu.
    // You can remove this method and customizer component.
    // Or you can customize this method to supply different menu for
    // different user type.
    AdvisorNavService.prototype.publishNavigationChange = function (menuType) {
        switch (menuType) {
            // case 'separator-menu':
            //   this.menuItems.next(this.separatorMenu);
            //   break;
            // case 'icon-menu':
            //   this.menuItems.next(this.iconMenu);
            //   break;
            default:
                this.menuItems.next(this.iconMenu);
        }
    };
    AdvisorNavService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], AdvisorNavService);
    return AdvisorNavService;
}());



/***/ }),

/***/ "./src/app/shared/services/app-confirm/app-confirm.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/shared/services/app-confirm/app-confirm.component.ts ***!
  \**********************************************************************/
/*! exports provided: AppComfirmComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComfirmComponent", function() { return AppComfirmComponent; });
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var AppComfirmComponent = /** @class */ (function () {
    function AppComfirmComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
    }
    AppComfirmComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-confirm',
            template: "<h1 matDialogTitle>{{ data.title }}</h1>\n    <div mat-dialog-content>{{ data.message }}</div>\n    <div mat-dialog-actions>\n    <button \n    type=\"button\" \n    mat-raised-button\n    color=\"primary\" \n    (click)=\"dialogRef.close(true)\">OK</button>\n    &nbsp;\n    <span fxFlex></span>\n    <button \n    type=\"button\"\n    color=\"accent\"\n    mat-raised-button \n    (click)=\"dialogRef.close(false)\">Cancel</button>\n    </div>",
        }),
        __param(1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_0__["MAT_DIALOG_DATA"])),
        __metadata("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_0__["MatDialogRef"], Object])
    ], AppComfirmComponent);
    return AppComfirmComponent;
}());



/***/ }),

/***/ "./src/app/shared/services/app-confirm/app-confirm.service.ts":
/*!********************************************************************!*\
  !*** ./src/app/shared/services/app-confirm/app-confirm.service.ts ***!
  \********************************************************************/
/*! exports provided: AppConfirmService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppConfirmService", function() { return AppConfirmService; });
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_confirm_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-confirm.component */ "./src/app/shared/services/app-confirm/app-confirm.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppConfirmService = /** @class */ (function () {
    function AppConfirmService(dialog) {
        this.dialog = dialog;
    }
    AppConfirmService.prototype.confirm = function (data) {
        if (data === void 0) { data = {}; }
        data.title = data.title || 'Confirm';
        data.message = data.message || 'Are you sure?';
        var dialogRef;
        dialogRef = this.dialog.open(_app_confirm_component__WEBPACK_IMPORTED_MODULE_2__["AppComfirmComponent"], {
            width: '380px',
            disableClose: true,
            data: { title: data.title, message: data.message }
        });
        return dialogRef.afterClosed();
    };
    AppConfirmService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_0__["MatDialog"]])
    ], AppConfirmService);
    return AppConfirmService;
}());



/***/ }),

/***/ "./src/app/shared/services/app-loader/app-loader.component.css":
/*!*********************************************************************!*\
  !*** ./src/app/shared/services/app-loader/app-loader.component.css ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".mat-dialog-content {\r\n  min-height: 122px;\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvc2hhcmVkL3NlcnZpY2VzL2FwcC1sb2FkZXIvYXBwLWxvYWRlci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsaUJBQWlCO0FBQ25CIiwiZmlsZSI6InNyYy9hcHAvc2hhcmVkL3NlcnZpY2VzL2FwcC1sb2FkZXIvYXBwLWxvYWRlci5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm1hdC1kaWFsb2ctY29udGVudCB7XHJcbiAgbWluLWhlaWdodDogMTIycHg7XHJcbn0iXX0= */"

/***/ }),

/***/ "./src/app/shared/services/app-loader/app-loader.component.html":
/*!**********************************************************************!*\
  !*** ./src/app/shared/services/app-loader/app-loader.component.html ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"text-center\">\r\n    <h6 class=\"m-0 pb-1\">{{ title }}</h6>\r\n    <div mat-dialog-content>\r\n        <mat-spinner [style.margin]=\"'auto'\"></mat-spinner>\r\n    </div>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/shared/services/app-loader/app-loader.component.ts":
/*!********************************************************************!*\
  !*** ./src/app/shared/services/app-loader/app-loader.component.ts ***!
  \********************************************************************/
/*! exports provided: AppLoaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppLoaderComponent", function() { return AppLoaderComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppLoaderComponent = /** @class */ (function () {
    function AppLoaderComponent(dialogRef) {
        this.dialogRef = dialogRef;
    }
    AppLoaderComponent.prototype.ngOnInit = function () {
    };
    AppLoaderComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-app-loader',
            template: __webpack_require__(/*! ./app-loader.component.html */ "./src/app/shared/services/app-loader/app-loader.component.html"),
            styles: [__webpack_require__(/*! ./app-loader.component.css */ "./src/app/shared/services/app-loader/app-loader.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"]])
    ], AppLoaderComponent);
    return AppLoaderComponent;
}());



/***/ }),

/***/ "./src/app/shared/services/app-loader/app-loader.service.ts":
/*!******************************************************************!*\
  !*** ./src/app/shared/services/app-loader/app-loader.service.ts ***!
  \******************************************************************/
/*! exports provided: AppLoaderService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppLoaderService", function() { return AppLoaderService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _app_loader_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-loader.component */ "./src/app/shared/services/app-loader/app-loader.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppLoaderService = /** @class */ (function () {
    function AppLoaderService(dialog) {
        this.dialog = dialog;
    }
    AppLoaderService.prototype.open = function (title) {
        if (title === void 0) { title = 'Please wait'; }
        this.dialogRef = this.dialog.open(_app_loader_component__WEBPACK_IMPORTED_MODULE_2__["AppLoaderComponent"], { disableClose: true, backdropClass: 'light-backdrop' });
        this.dialogRef.updateSize('200px');
        this.dialogRef.componentInstance.title = title;
        return this.dialogRef.afterClosed();
    };
    AppLoaderService.prototype.close = function () {
        if (this.dialogRef)
            this.dialogRef.close();
    };
    AppLoaderService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_1__["MatDialog"]])
    ], AppLoaderService);
    return AppLoaderService;
}());



/***/ }),

/***/ "./src/app/shared/services/auth/auth.guard.ts":
/*!****************************************************!*\
  !*** ./src/app/shared/services/auth/auth.guard.ts ***!
  \****************************************************/
/*! exports provided: AuthGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthGuard", function() { return AuthGuard; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AuthGuard = /** @class */ (function () {
    function AuthGuard(router) {
        this.router = router;
        this.isAuthenticated = true; // Set this value dynamically
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        if (this.isAuthenticated) {
            return true;
        }
        this.router.navigate(['/auth/signin']);
        return false;
    };
    AuthGuard = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], AuthGuard);
    return AuthGuard;
}());



/***/ }),

/***/ "./src/app/shared/services/customer-nav-links.service.ts":
/*!***************************************************************!*\
  !*** ./src/app/shared/services/customer-nav-links.service.ts ***!
  \***************************************************************/
/*! exports provided: CustNavService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustNavService", function() { return CustNavService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var CustNavService = /** @class */ (function () {
    function CustNavService() {
        // tslint:disable-next-line:member-ordering
        this.iconMenu = [
            {
                name: 'HOME',
                type: 'link',
                tooltip: 'Home',
                icon: 'home',
                state: 'customer/nested1'
            },
            {
                name: 'People',
                type: 'link',
                tooltip: 'Profile',
                icon: 'person',
                state: 'customer/gallery'
            },
            {
                name: 'Professionals',
                type: 'link',
                tooltip: 'Tour',
                icon: 'flight_takeoff',
                state: 'customer/users'
            },
            {
                type: 'separator',
                name: 'Main Items'
            }
        ];
        // Icon menu TITLE at the very top of navigation.
        // This title will appear if any icon type item is present in menu.
        this.iconTypeMenuTitle = 'Frequently Accessed';
        // sets iconMenu as default;
        this.menuItems = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.iconMenu);
        // navigation component has subscribed to this Observable
        this.menuItems$ = this.menuItems.asObservable();
    }
    // Customizer component uses this method to change menu.
    // You can remove this method and customizer component.
    // Or you can customize this method to supply different menu for
    // different user type.
    CustNavService.prototype.publishNavigationChange = function (menuType) {
        switch (menuType) {
            // case 'separator-menu':
            //   this.menuItems.next(this.separatorMenu);
            //   break;
            // case 'icon-menu':
            //   this.menuItems.next(this.iconMenu);
            //   break;
            default:
                this.menuItems.next(this.iconMenu);
        }
    };
    CustNavService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], CustNavService);
    return CustNavService;
}());



/***/ }),

/***/ "./src/app/shared/services/layout.service.ts":
/*!***************************************************!*\
  !*** ./src/app/shared/services/layout.service.ts ***!
  \***************************************************/
/*! exports provided: LayoutService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LayoutService", function() { return LayoutService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _helpers_url_helper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers/url.helper */ "./src/app/shared/helpers/url.helper.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var LayoutService = /** @class */ (function () {
    function LayoutService(router) {
        this.router = router;
        this.layoutConfSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.layoutConf);
        this.layoutConf$ = this.layoutConfSubject.asObservable();
        this.fullWidthRoutes = ['shop'];
        this.setAppLayout();
    }
    LayoutService.prototype.setAppLayout = function () {
        //******** SET YOUR LAYOUT OPTIONS HERE *********
        this.layoutConf = {
            "navigationPos": "top",
            "sidebarStyle": "full",
            "dir": "ltr",
            "useBreadcrumb": true,
            "topbarFixed": false,
            "breadcrumb": "title" // simple, title
        };
        //******* Only for demo purpose ***
        this.setLayoutFromQuery();
        //**********************
    };
    LayoutService.prototype.publishLayoutChange = function (lc, opt) {
        var _this = this;
        if (opt === void 0) { opt = {}; }
        var duration = opt.duration || 250;
        if (!opt.transitionClass) {
            this.layoutConf = Object.assign(this.layoutConf, lc);
            return this.layoutConfSubject.next(this.layoutConf);
        }
        this.layoutConf = Object.assign(this.layoutConf, lc, { layoutInTransition: true });
        this.layoutConfSubject.next(this.layoutConf);
        setTimeout(function () {
            _this.layoutConf = Object.assign(_this.layoutConf, { layoutInTransition: false });
            _this.layoutConfSubject.next(_this.layoutConf);
        }, duration);
    };
    LayoutService.prototype.setLayoutFromQuery = function () {
        var layoutConfString = Object(_helpers_url_helper__WEBPACK_IMPORTED_MODULE_3__["getQueryParam"])('layout');
        try {
            this.layoutConf = JSON.parse(layoutConfString);
        }
        catch (e) { }
    };
    LayoutService.prototype.adjustLayout = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var sidebarStyle;
        this.isMobile = this.isSm();
        this.currentRoute = options.route || this.currentRoute;
        sidebarStyle = this.isMobile ? 'closed' : this.layoutConf.sidebarStyle;
        if (this.currentRoute) {
            this.fullWidthRoutes.forEach(function (route) {
                if (_this.currentRoute.indexOf(route) !== -1) {
                    sidebarStyle = 'closed';
                }
            });
        }
        this.publishLayoutChange({
            isMobile: this.isMobile,
            sidebarStyle: sidebarStyle
        });
    };
    LayoutService.prototype.isSm = function () {
        return window.matchMedia("(max-width: 959px)").matches;
    };
    LayoutService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]])
    ], LayoutService);
    return LayoutService;
}());



/***/ }),

/***/ "./src/app/shared/services/navigation.service.ts":
/*!*******************************************************!*\
  !*** ./src/app/shared/services/navigation.service.ts ***!
  \*******************************************************/
/*! exports provided: NavigationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavigationService", function() { return NavigationService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var NavigationService = /** @class */ (function () {
    function NavigationService() {
        this.iconMenu = [
            {
                name: 'HOME',
                type: 'icon',
                tooltip: 'Home',
                icon: 'home',
                state: 'home'
            },
            {
                name: 'PROFILE',
                type: 'icon',
                tooltip: 'Profile',
                icon: 'person',
                state: 'profile/overview'
            },
            {
                name: 'TOUR',
                type: 'icon',
                tooltip: 'Tour',
                icon: 'flight_takeoff',
                state: 'tour'
            },
            {
                type: 'separator',
                name: 'Main Items'
            },
            {
                name: 'DASHBOARD01',
                type: 'link',
                tooltip: 'Dashboard',
                icon: 'dashboard',
                state: 'admin'
            },
            {
                name: 'DOC01',
                type: 'extLink',
                tooltip: 'Documentation',
                icon: 'library_books',
                state: 'admin/Nested3'
            }
        ];
        // Icon menu TITLE at the very top of navigation.
        // This title will appear if any icon type item is present in menu.
        this.iconTypeMenuTitle = 'Frequently Accessed';
        // sets iconMenu as default;
        this.menuItems = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.iconMenu);
        // navigation component has subscribed to this Observable
        this.menuItems$ = this.menuItems.asObservable();
    }
    // Customizer component uses this method to change menu.
    // You can remove this method and customizer component.
    // Or you can customize this method to supply different menu for
    // different user type.
    NavigationService.prototype.publishNavigationChange = function (menuType) {
        switch (menuType) {
            // case 'separator-menu':
            //   this.menuItems.next(this.separatorMenu);
            //   break;
            // case 'icon-menu':
            //   this.menuItems.next(this.iconMenu);
            //   break;
            default:
                this.menuItems.next(this.iconMenu);
        }
    };
    NavigationService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], NavigationService);
    return NavigationService;
}());



/***/ }),

/***/ "./src/app/shared/services/route-parts.service.ts":
/*!********************************************************!*\
  !*** ./src/app/shared/services/route-parts.service.ts ***!
  \********************************************************/
/*! exports provided: RoutePartsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RoutePartsService", function() { return RoutePartsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var RoutePartsService = /** @class */ (function () {
    function RoutePartsService(router) {
        this.router = router;
    }
    RoutePartsService.prototype.ngOnInit = function () {
    };
    RoutePartsService.prototype.generateRouteParts = function (snapshot) {
        var routeParts = [];
        if (snapshot) {
            if (snapshot.firstChild) {
                routeParts = routeParts.concat(this.generateRouteParts(snapshot.firstChild));
            }
            if (snapshot.data['title'] && snapshot.url.length) {
                // console.log(snapshot.data['title'], snapshot.url)
                routeParts.push({
                    title: snapshot.data['title'],
                    breadcrumb: snapshot.data['breadcrumb'],
                    url: snapshot.url[0].path,
                    urlSegments: snapshot.url,
                    params: snapshot.params
                });
            }
        }
        return routeParts;
    };
    RoutePartsService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], RoutePartsService);
    return RoutePartsService;
}());



/***/ }),

/***/ "./src/app/shared/services/theme.service.ts":
/*!**************************************************!*\
  !*** ./src/app/shared/services/theme.service.ts ***!
  \**************************************************/
/*! exports provided: ThemeService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemeService", function() { return ThemeService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _helpers_url_helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/url.helper */ "./src/app/shared/helpers/url.helper.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};



var ThemeService = /** @class */ (function () {
    function ThemeService(document) {
        this.document = document;
        this.egretThemes = [{
                "name": "egret-dark-purple",
                "baseColor": "#9c27b0",
                "isActive": false
            }, {
                "name": "egret-dark-pink",
                "baseColor": "#e91e63",
                "isActive": false
            }, {
                "name": "egret-blue",
                "baseColor": "#247ba0",
                "isActive": false
            }, {
                "name": "egret-indigo",
                "baseColor": "#3f51b5",
                "isActive": true
            }];
    }
    // Invoked in AppComponent and apply 'activatedTheme' on startup
    ThemeService.prototype.applyMatTheme = function (r) {
        /*
        ****** (SET YOUR DEFAULT THEME HERE) *******
        * Assign new Theme to activatedTheme
        */
        // this.activatedTheme = this.egretThemes[0]; 
        // this.activatedTheme = this.egretThemes[1]; 
        // this.activatedTheme = this.egretThemes[2]; 
        this.activatedTheme = this.egretThemes[3];
        // *********** ONLY FOR DEMO **********
        this.setThemeFromQuery();
        // ************************************
        this.changeTheme(r, this.activatedTheme);
    };
    ThemeService.prototype.changeTheme = function (r, theme) {
        r.removeClass(this.document.body, this.activatedTheme.name);
        r.addClass(this.document.body, theme.name);
        this.flipActiveFlag(theme);
    };
    ThemeService.prototype.flipActiveFlag = function (theme) {
        var _this = this;
        this.egretThemes.forEach(function (t) {
            t.isActive = false;
            if (t.name === theme.name) {
                t.isActive = true;
                _this.activatedTheme = theme;
            }
        });
    };
    // *********** ONLY FOR DEMO **********
    ThemeService.prototype.setThemeFromQuery = function () {
        var themeStr = Object(_helpers_url_helper__WEBPACK_IMPORTED_MODULE_2__["getQueryParam"])('theme');
        try {
            this.activatedTheme = JSON.parse(themeStr);
            this.flipActiveFlag(this.activatedTheme);
        }
        catch (e) { }
    };
    ThemeService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __param(0, Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"])(_angular_common__WEBPACK_IMPORTED_MODULE_1__["DOCUMENT"])),
        __metadata("design:paramtypes", [Document])
    ], ThemeService);
    return ThemeService;
}());



/***/ }),

/***/ "./src/app/shared/shared.module.ts":
/*!*****************************************!*\
  !*** ./src/app/shared/shared.module.ts ***!
  \*****************************************/
/*! exports provided: SharedModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedModule", function() { return SharedModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/esm5/ngx-translate-core.js");
/* harmony import */ var ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ngx-perfect-scrollbar */ "./node_modules/ngx-perfect-scrollbar/dist/ngx-perfect-scrollbar.es5.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _components_header_side_header_side_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/header-side/header-side.component */ "./src/app/shared/components/header-side/header-side.component.ts");
/* harmony import */ var _components_sidebar_side_sidebar_side_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/sidebar-side/sidebar-side.component */ "./src/app/shared/components/sidebar-side/sidebar-side.component.ts");
/* harmony import */ var _components_header_top_header_top_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/header-top/header-top.component */ "./src/app/shared/components/header-top/header-top.component.ts");
/* harmony import */ var _components_customer_header_customer_header_top_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/customer-header/customer-header-top.component */ "./src/app/shared/components/customer-header/customer-header-top.component.ts");
/* harmony import */ var _components_advisor_header_advisor_header_top_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/advisor-header/advisor-header-top.component */ "./src/app/shared/components/advisor-header/advisor-header-top.component.ts");
/* harmony import */ var _components_sidebar_top_sidebar_top_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/sidebar-top/sidebar-top.component */ "./src/app/shared/components/sidebar-top/sidebar-top.component.ts");
/* harmony import */ var _components_customizer_customizer_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/customizer/customizer.component */ "./src/app/shared/components/customizer/customizer.component.ts");
/* harmony import */ var _components_layouts_admin_layout_admin_layout_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/layouts/admin-layout/admin-layout.component */ "./src/app/shared/components/layouts/admin-layout/admin-layout.component.ts");
/* harmony import */ var _components_layouts_advisor_layout_advisor_layout_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/layouts/advisor-layout/advisor-layout.component */ "./src/app/shared/components/layouts/advisor-layout/advisor-layout.component.ts");
/* harmony import */ var _components_layouts_auth_layout_auth_layout_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/layouts/auth-layout/auth-layout.component */ "./src/app/shared/components/layouts/auth-layout/auth-layout.component.ts");
/* harmony import */ var _components_layouts_customer_layout_customer_layout_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/layouts/customer-layout/customer-layout.component */ "./src/app/shared/components/layouts/customer-layout/customer-layout.component.ts");
/* harmony import */ var _components_layouts_landing_layout_landing_layout_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./components/layouts/landing-layout/landing-layout.component */ "./src/app/shared/components/layouts/landing-layout/landing-layout.component.ts");
/* harmony import */ var _components_notifications_notifications_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/notifications/notifications.component */ "./src/app/shared/components/notifications/notifications.component.ts");
/* harmony import */ var _components_sidenav_sidenav_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./components/sidenav/sidenav.component */ "./src/app/shared/components/sidenav/sidenav.component.ts");
/* harmony import */ var _components_breadcrumb_breadcrumb_component__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./components/breadcrumb/breadcrumb.component */ "./src/app/shared/components/breadcrumb/breadcrumb.component.ts");
/* harmony import */ var _services_app_confirm_app_confirm_component__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./services/app-confirm/app-confirm.component */ "./src/app/shared/services/app-confirm/app-confirm.component.ts");
/* harmony import */ var _services_app_loader_app_loader_component__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./services/app-loader/app-loader.component */ "./src/app/shared/services/app-loader/app-loader.component.ts");
/* harmony import */ var _directives_font_size_directive__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./directives/font-size.directive */ "./src/app/shared/directives/font-size.directive.ts");
/* harmony import */ var _directives_scroll_to_directive__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./directives/scroll-to.directive */ "./src/app/shared/directives/scroll-to.directive.ts");
/* harmony import */ var _directives_dropdown_directive__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./directives/dropdown.directive */ "./src/app/shared/directives/dropdown.directive.ts");
/* harmony import */ var _directives_dropdown_anchor_directive__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./directives/dropdown-anchor.directive */ "./src/app/shared/directives/dropdown-anchor.directive.ts");
/* harmony import */ var _directives_dropdown_link_directive__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./directives/dropdown-link.directive */ "./src/app/shared/directives/dropdown-link.directive.ts");
/* harmony import */ var _directives_egret_side_nav_toggle_directive__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./directives/egret-side-nav-toggle.directive */ "./src/app/shared/directives/egret-side-nav-toggle.directive.ts");
/* harmony import */ var _pipes_relative_time_pipe__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./pipes/relative-time.pipe */ "./src/app/shared/pipes/relative-time.pipe.ts");
/* harmony import */ var _pipes_excerpt_pipe__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./pipes/excerpt.pipe */ "./src/app/shared/pipes/excerpt.pipe.ts");
/* harmony import */ var _pipes_get_value_by_key_pipe__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./pipes/get-value-by-key.pipe */ "./src/app/shared/pipes/get-value-by-key.pipe.ts");
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./services/theme.service */ "./src/app/shared/services/theme.service.ts");
/* harmony import */ var _services_layout_service__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./services/layout.service */ "./src/app/shared/services/layout.service.ts");
/* harmony import */ var _services_navigation_service__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./services/navigation.service */ "./src/app/shared/services/navigation.service.ts");
/* harmony import */ var _services_customer_nav_links_service__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./services/customer-nav-links.service */ "./src/app/shared/services/customer-nav-links.service.ts");
/* harmony import */ var _services_advisor_nav_links_service__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./services/advisor-nav-links.service */ "./src/app/shared/services/advisor-nav-links.service.ts");
/* harmony import */ var _services_route_parts_service__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./services/route-parts.service */ "./src/app/shared/services/route-parts.service.ts");
/* harmony import */ var _services_auth_auth_guard__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./services/auth/auth.guard */ "./src/app/shared/services/auth/auth.guard.ts");
/* harmony import */ var _services_app_confirm_app_confirm_service__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./services/app-confirm/app-confirm.service */ "./src/app/shared/services/app-confirm/app-confirm.service.ts");
/* harmony import */ var _services_app_loader_app_loader_service__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./services/app-loader/app-loader.service */ "./src/app/shared/services/app-loader/app-loader.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT


// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT




// ONLY FOR DEMO (Removable without changing any layout configuration)

// ALL TIME REQUIRED 










// DIRECTIVES






// PIPES



// SERVICES









/*
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/
// import { LandingPageService } from '../shared/services/landing-page.service';
var classesToInclude = [
    _components_header_top_header_top_component__WEBPACK_IMPORTED_MODULE_10__["HeaderTopComponent"],
    _components_customer_header_customer_header_top_component__WEBPACK_IMPORTED_MODULE_11__["customerHeaderTopComponent"],
    _components_advisor_header_advisor_header_top_component__WEBPACK_IMPORTED_MODULE_12__["AdvisorHeaderTopComponent"],
    _components_sidebar_top_sidebar_top_component__WEBPACK_IMPORTED_MODULE_13__["SidebarTopComponent"],
    _components_sidenav_sidenav_component__WEBPACK_IMPORTED_MODULE_21__["SidenavComponent"],
    _components_notifications_notifications_component__WEBPACK_IMPORTED_MODULE_20__["NotificationsComponent"],
    _components_sidebar_side_sidebar_side_component__WEBPACK_IMPORTED_MODULE_9__["SidebarSideComponent"],
    _components_header_side_header_side_component__WEBPACK_IMPORTED_MODULE_8__["HeaderSideComponent"],
    _components_layouts_admin_layout_admin_layout_component__WEBPACK_IMPORTED_MODULE_15__["AdminLayoutComponent"],
    _components_layouts_advisor_layout_advisor_layout_component__WEBPACK_IMPORTED_MODULE_16__["AdvisorLayoutComponent"],
    _components_layouts_auth_layout_auth_layout_component__WEBPACK_IMPORTED_MODULE_17__["AuthLayoutComponent"],
    _components_layouts_customer_layout_customer_layout_component__WEBPACK_IMPORTED_MODULE_18__["CustomerLayoutComponent"],
    _components_layouts_landing_layout_landing_layout_component__WEBPACK_IMPORTED_MODULE_19__["LandingLayoutComponent"],
    _components_breadcrumb_breadcrumb_component__WEBPACK_IMPORTED_MODULE_22__["BreadcrumbComponent"],
    _services_app_confirm_app_confirm_component__WEBPACK_IMPORTED_MODULE_23__["AppComfirmComponent"],
    _services_app_loader_app_loader_component__WEBPACK_IMPORTED_MODULE_24__["AppLoaderComponent"],
    _components_customizer_customizer_component__WEBPACK_IMPORTED_MODULE_14__["CustomizerComponent"],
    _directives_font_size_directive__WEBPACK_IMPORTED_MODULE_25__["FontSizeDirective"],
    _directives_scroll_to_directive__WEBPACK_IMPORTED_MODULE_26__["ScrollToDirective"],
    _directives_dropdown_directive__WEBPACK_IMPORTED_MODULE_27__["AppDropdownDirective"],
    _directives_dropdown_anchor_directive__WEBPACK_IMPORTED_MODULE_28__["DropdownAnchorDirective"],
    _directives_dropdown_link_directive__WEBPACK_IMPORTED_MODULE_29__["DropdownLinkDirective"],
    _directives_egret_side_nav_toggle_directive__WEBPACK_IMPORTED_MODULE_30__["EgretSideNavToggleDirective"],
    _pipes_relative_time_pipe__WEBPACK_IMPORTED_MODULE_31__["RelativeTimePipe"],
    _pipes_excerpt_pipe__WEBPACK_IMPORTED_MODULE_32__["ExcerptPipe"],
    _pipes_get_value_by_key_pipe__WEBPACK_IMPORTED_MODULE_33__["GetValueByKeyPipe"]
];
var SharedModule = /** @class */ (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"],
                _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__["FlexLayoutModule"],
                _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatSidenavModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatTooltipModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatOptionModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatSelectModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatMenuModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatSnackBarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatGridListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatToolbarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatIconModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatRadioModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatCheckboxModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatProgressSpinnerModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatRippleModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatDialogModule"],
                ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_6__["PerfectScrollbarModule"]
            ],
            entryComponents: [_services_app_confirm_app_confirm_component__WEBPACK_IMPORTED_MODULE_23__["AppComfirmComponent"], _services_app_loader_app_loader_component__WEBPACK_IMPORTED_MODULE_24__["AppLoaderComponent"]],
            providers: [
                _services_theme_service__WEBPACK_IMPORTED_MODULE_34__["ThemeService"],
                _services_layout_service__WEBPACK_IMPORTED_MODULE_35__["LayoutService"],
                _services_navigation_service__WEBPACK_IMPORTED_MODULE_36__["NavigationService"],
                _services_customer_nav_links_service__WEBPACK_IMPORTED_MODULE_37__["CustNavService"],
                _services_advisor_nav_links_service__WEBPACK_IMPORTED_MODULE_38__["AdvisorNavService"],
                _services_route_parts_service__WEBPACK_IMPORTED_MODULE_39__["RoutePartsService"],
                _services_auth_auth_guard__WEBPACK_IMPORTED_MODULE_40__["AuthGuard"],
                _services_app_confirm_app_confirm_service__WEBPACK_IMPORTED_MODULE_41__["AppConfirmService"],
                _services_app_loader_app_loader_service__WEBPACK_IMPORTED_MODULE_42__["AppLoaderService"]
                // LandingPageService
            ],
            declarations: classesToInclude,
            exports: classesToInclude
        })
    ], SharedModule);
    return SharedModule;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false,
    apiURL: 'developmentApi'
};


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! E:\Dinesh\Github\LegacyLIfePlans\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map