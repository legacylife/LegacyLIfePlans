import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
console.log("App module .....")
import {
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatGridListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatExpansionModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatDialogModule,
  GestureConfig,
} from '@angular/material';

/** Import Alyle UI */
import {LyThemeModule,LY_THEME,LY_THEME_GLOBAL_VARIABLES} from '@alyle/ui';
/** Import the component modules */
import { LyButtonModule } from '@alyle/ui/button';
import { LyToolbarModule } from '@alyle/ui/toolbar';
import { LyResizingCroppingImageModule } from '@alyle/ui/resizing-cropping-images';
/** Import themes */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
export class GlobalVariables {
  testVal = '#00bcd4';
  Quepal = {
    default: `linear-gradient(135deg,#11998e 0%,#38ef7d 100%)`,
    contrast: '#fff',
    shadow: '#11998e'
  };
  SublimeLight = {
    default: `linear-gradient(135deg,#FC5C7D 0%,#6A82FB 100%)`,
    contrast: '#fff',
    shadow: '#B36FBC'
  };
  Amber = {
    default: '#ffc107',
    contrast: 'rgba(0, 0, 0, 0.87)'
  };
}
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
//import { AdvisorLandingLayoutComponent } from './shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { rootRouterConfig } from './app.routing';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { APIService } from './api.service';
import { UserAPIService } from './userapi.service';
import { InviteComponent } from './views/invite-modal/invite-modal.component';
import { TodosComponent } from './views/todos/todos.component';
import { ReferAndEarnModalComponent } from './views/refer-and-earn-modal/refer-and-earn-modal.component';
import { LyIconModule } from '@alyle/ui/icon';
import { FileUploadModule } from 'ng2-file-upload';
///import { ImageCropperComponent, ImageCropperModule } from "ngx-img-cropper";
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
// AoT requires an exported function for factories
import { ChangePicComponent } from './views/change-pic/change-pic.component';
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  imports: [
  FlexLayoutModule,
  MatListModule,
  FormsModule,
  ReactiveFormsModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatGridListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatExpansionModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatDialogModule,
  BrowserModule,
  BrowserAnimationsModule,
  SharedModule,
  HttpClientModule,
  PerfectScrollbarModule,
  MatDialogModule,
  MatIconModule,
 // ImageCropperModule,
  MatFormFieldModule,
  FileUploadModule,

  LyThemeModule.setTheme('minima-light'),
  LyButtonModule,
  LyToolbarModule,
  LyResizingCroppingImageModule,
  LyIconModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
    RouterModule.forRoot(rootRouterConfig, { useHash: false })
  ],
  exports: [ChangePicComponent],
  bootstrap: [AppComponent], 
  providers: [
    APIService, UserAPIService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    { provide: LY_THEME, useClass: MinimaLight, multi: true }, // name: `minima-light`
    { provide: LY_THEME, useClass: MinimaDark, multi: true },// name: `minima-dark`
    { provide: LY_THEME_GLOBAL_VARIABLES,useClass: GlobalVariables    } 
  ],
  declarations: [AppComponent, ChangePicComponent, InviteComponent, ReferAndEarnModalComponent,
    TodosComponent],
  entryComponents: [ChangePicComponent, InviteComponent, ReferAndEarnModalComponent, TodosComponent],
})
export class AppModule { }