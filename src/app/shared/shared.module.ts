import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { 
  MatSidenavModule,
  MatListModule,
  MatTooltipModule,
  MatOptionModule,
  MatSelectModule,
  MatMenuModule,
  MatSnackBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatCardModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatTabsModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatExpansionModule,
  MatSliderModule
} from '@angular/material';
// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './components/header-side/header-side.component';
import { SidebarSideComponent } from './components/sidebar-side/sidebar-side.component';

// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './components/header-top/header-top.component';
import { customerHeaderTopComponent } from './components/customer-header/customer-header-top.component';
import { AdvisorHeaderTopComponent } from './components/advisor-header/advisor-header-top.component';
import { LandingAdvisorHeaderTopComponent } from './components/landing-advisor-header/landing-advisor-header-top.component';
import { LandingCustomerHeaderTopComponent } from './components/landing-customer-header/landing-customer-header-top.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';

// ONLY FOR DEMO (Removable without changing any layout configuration)
import { CustomizerComponent } from './components/customizer/customizer.component';

// ALL TIME REQUIRED 
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { AdvisorLayoutComponent } from './components/layouts/advisor-layout/advisor-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { CustomerLayoutComponent } from './components/layouts/customer-layout/customer-layout.component';
import { LandingLayoutComponent } from './components/layouts/landing-layout/landing-layout.component';
import { AdvisorLandingLayoutComponent } from './components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AppComfirmComponent } from './services/app-confirm/app-confirm.component';
import { AppLoaderComponent } from './services/app-loader/app-loader.component';

// DIRECTIVES
import { FontSizeDirective } from './directives/font-size.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { AppDropdownDirective } from './directives/dropdown.directive';
import { DropdownAnchorDirective } from './directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from './directives/dropdown-link.directive';
import { EgretSideNavToggleDirective } from './directives/egret-side-nav-toggle.directive';

// PIPES
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { GetValueByKeyPipe } from './pipes/get-value-by-key.pipe';

// SERVICES
import { ThemeService } from './services/theme.service';
import { LayoutService } from './services/layout.service';
import { NavigationService } from './services/navigation.service';
import { AdvisorNavigationService } from './services/pre-login-advisor.service';
import { CustNavService } from './services/customer-nav-links.service';
import { AdvisorNavService } from './services/advisor-nav-links.service';
import { LandingAdvisorNavService } from './services/pre-login-advisor-landing-nav-links.service';
import { LandingCustomerNavService } from './services/pre-login-cust-landing-nav-links.service';
import { RoutePartsService } from './services/route-parts.service';
import { AuthGuard } from './services/auth/auth.guard';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { TodosListingComponent } from './../views/todos-listing/todos-listing.component';
import { TodosComponent } from './../views/todos/todos.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CardDetailsComponent } from './components/card-details-modal/card-details-modal.component';
import { PetsListComponent } from 'app/views/customer/customer-home/pets/pets-list/pets-list.component';
import { PetsDetailsComponent } from 'app/views/customer/customer-home/pets/pets-details/pets-details.component';
import { PetsModalComponent } from 'app/views/customer/customer-home/pets/pets-modal/pets-modal.component';
import { FileUploadModule } from 'ng2-file-upload';

/* 
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/
// import { LandingPageService } from '../shared/services/landing-page.service';

const classesToInclude = [
  HeaderTopComponent,
  customerHeaderTopComponent,
  AdvisorHeaderTopComponent,
  LandingAdvisorHeaderTopComponent,
  LandingCustomerHeaderTopComponent,
  SidebarTopComponent,
  SidenavComponent,
  NotificationsComponent,
  SidebarSideComponent,
  HeaderSideComponent,
  AdminLayoutComponent,
  AdvisorLayoutComponent,
  AuthLayoutComponent,
  CustomerLayoutComponent,
  LandingLayoutComponent,
  AdvisorLandingLayoutComponent,
  BreadcrumbComponent,
  AppComfirmComponent,
  AppLoaderComponent,
  CustomizerComponent,
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  EgretSideNavToggleDirective,
  RelativeTimePipe,
  ExcerptPipe,
  GetValueByKeyPipe,
  TodosListingComponent,
  TodosComponent,
  CardDetailsComponent,
  PetsListComponent,
  PetsDetailsComponent,
  PetsModalComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    TranslateModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatDialogModule,
    PerfectScrollbarModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTabsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatSliderModule,
    DragDropModule,
    FileUploadModule
  ],
  entryComponents: [AppComfirmComponent, AppLoaderComponent,TodosComponent, CardDetailsComponent,PetsModalComponent],
  providers: [
    ThemeService,
    LayoutService,
    NavigationService,
    AdvisorNavigationService,
    CustNavService,
    AdvisorNavService,
    LandingAdvisorNavService,
    LandingCustomerNavService,
    RoutePartsService,
    AuthGuard,
    ProfilePicService,
    AppConfirmService,
    AppLoaderService
    // LandingPageService
  ],
  declarations: classesToInclude,
  exports: classesToInclude
})
export class SharedModule { }
