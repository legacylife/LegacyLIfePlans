(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["views-advisor-advisor-module"],{

/***/ "./src/app/views/advisor/advisor.module.ts":
/*!*************************************************!*\
  !*** ./src/app/views/advisor/advisor.module.ts ***!
  \*************************************************/
/*! exports provided: AdvisorModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdvisorModule", function() { return AdvisorModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _swimlane_ngx_datatable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @swimlane/ngx-datatable */ "./node_modules/@swimlane/ngx-datatable/release/index.js");
/* harmony import */ var _swimlane_ngx_datatable__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_swimlane_ngx_datatable__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var ng2_charts_ng2_charts__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ng2-charts/ng2-charts */ "./node_modules/ng2-charts/ng2-charts.js");
/* harmony import */ var ng2_charts_ng2_charts__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(ng2_charts_ng2_charts__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var ng2_file_upload_ng2_file_upload__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ng2-file-upload/ng2-file-upload */ "./node_modules/ng2-file-upload/ng2-file-upload.js");
/* harmony import */ var ng2_file_upload_ng2_file_upload__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(ng2_file_upload_ng2_file_upload__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _app_blank_app_blank_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./app-blank/app-blank.component */ "./src/app/views/advisor/app-blank/app-blank.component.ts");
/* harmony import */ var _legacies_legacies_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./legacies/legacies.component */ "./src/app/views/advisor/legacies/legacies.component.ts");
/* harmony import */ var _advisor_routing__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./advisor.routing */ "./src/app/views/advisor/advisor.routing.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};













var AdvisorModule = /** @class */ (function () {
    function AdvisorModule() {
    }
    AdvisorModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatCardModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatMenuModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatGridListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatChipsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatCheckboxModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatRadioModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatTabsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatInputModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatProgressBarModule"],
                _angular_flex_layout__WEBPACK_IMPORTED_MODULE_5__["FlexLayoutModule"],
                _swimlane_ngx_datatable__WEBPACK_IMPORTED_MODULE_6__["NgxDatatableModule"],
                ng2_charts_ng2_charts__WEBPACK_IMPORTED_MODULE_7__["ChartsModule"],
                ng2_file_upload_ng2_file_upload__WEBPACK_IMPORTED_MODULE_8__["FileUploadModule"],
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_9__["SharedModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(_advisor_routing__WEBPACK_IMPORTED_MODULE_12__["AdviserRoutes"])
            ],
            declarations: [
                _app_blank_app_blank_component__WEBPACK_IMPORTED_MODULE_10__["AppBlankComponent"],
                _legacies_legacies_component__WEBPACK_IMPORTED_MODULE_11__["LegaciesComponent"]
            ]
        })
    ], AdvisorModule);
    return AdvisorModule;
}());



/***/ }),

/***/ "./src/app/views/advisor/advisor.routing.ts":
/*!**************************************************!*\
  !*** ./src/app/views/advisor/advisor.routing.ts ***!
  \**************************************************/
/*! exports provided: AdviserRoutes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AdviserRoutes", function() { return AdviserRoutes; });
/* harmony import */ var _app_blank_app_blank_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app-blank/app-blank.component */ "./src/app/views/advisor/app-blank/app-blank.component.ts");
/* harmony import */ var _legacies_legacies_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./legacies/legacies.component */ "./src/app/views/advisor/legacies/legacies.component.ts");


var AdviserRoutes = [
    {
        path: '',
        component: _app_blank_app_blank_component__WEBPACK_IMPORTED_MODULE_0__["AppBlankComponent"]
    },
    {
        path: 'legacies',
        component: _legacies_legacies_component__WEBPACK_IMPORTED_MODULE_1__["LegaciesComponent"]
    }
];


/***/ }),

/***/ "./src/app/views/advisor/app-blank/app-blank.component.css":
/*!*****************************************************************!*\
  !*** ./src/app/views/advisor/app-blank/app-blank.component.css ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3ZpZXdzL2Fkdmlzb3IvYXBwLWJsYW5rL2FwcC1ibGFuay5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/views/advisor/app-blank/app-blank.component.html":
/*!******************************************************************!*\
  !*** ./src/app/views/advisor/app-blank/app-blank.component.html ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<p class=\"m-333\">\r\n  This is a adviser blank component.\r\n</p>\r\n"

/***/ }),

/***/ "./src/app/views/advisor/app-blank/app-blank.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/views/advisor/app-blank/app-blank.component.ts ***!
  \****************************************************************/
/*! exports provided: AppBlankComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppBlankComponent", function() { return AppBlankComponent; });
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

var AppBlankComponent = /** @class */ (function () {
    function AppBlankComponent() {
    }
    AppBlankComponent.prototype.ngOnInit = function () {
    };
    AppBlankComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-blank',
            template: __webpack_require__(/*! ./app-blank.component.html */ "./src/app/views/advisor/app-blank/app-blank.component.html"),
            styles: [__webpack_require__(/*! ./app-blank.component.css */ "./src/app/views/advisor/app-blank/app-blank.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], AppBlankComponent);
    return AppBlankComponent;
}());



/***/ }),

/***/ "./src/app/views/advisor/legacies/legacies.component.css":
/*!***************************************************************!*\
  !*** ./src/app/views/advisor/legacies/legacies.component.css ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3ZpZXdzL2Fkdmlzb3IvbGVnYWNpZXMvbGVnYWNpZXMuY29tcG9uZW50LmNzcyJ9 */"

/***/ }),

/***/ "./src/app/views/advisor/legacies/legacies.component.html":
/*!****************************************************************!*\
  !*** ./src/app/views/advisor/legacies/legacies.component.html ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<p class=\"m-333\">\r\n  This is a legacies\r\n</p>\r\n"

/***/ }),

/***/ "./src/app/views/advisor/legacies/legacies.component.ts":
/*!**************************************************************!*\
  !*** ./src/app/views/advisor/legacies/legacies.component.ts ***!
  \**************************************************************/
/*! exports provided: LegaciesComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LegaciesComponent", function() { return LegaciesComponent; });
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

var LegaciesComponent = /** @class */ (function () {
    function LegaciesComponent() {
    }
    LegaciesComponent.prototype.ngOnInit = function () {
    };
    LegaciesComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'legacies-blank',
            template: __webpack_require__(/*! ./legacies.component.html */ "./src/app/views/advisor/legacies/legacies.component.html"),
            styles: [__webpack_require__(/*! ./legacies.component.css */ "./src/app/views/advisor/legacies/legacies.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], LegaciesComponent);
    return LegaciesComponent;
}());



/***/ })

}]);
//# sourceMappingURL=views-advisor-advisor-module.js.map