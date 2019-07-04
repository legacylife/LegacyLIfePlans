import { Component, OnInit, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { UserAPIService } from './../../../userapi.service';

import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { InviteComponent } from '../../../views/invite-modal/invite-modal.component';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { serverUrl, s3Details } from '../../../config';
import { TodosComponent } from 'app/views/todos/todos.component';

@Component({
  selector: 'app-customer-header-top',
  templateUrl: './customer-header-top.component.html'
})
export class customerHeaderTopComponent implements OnInit, OnDestroy {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  layoutConf: any;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  menuItems:any;
  menuItemSub: Subscription;
  egretThemes: any[] = [];
  currentLang = 'en';
  availableLangs = [{
    name: 'English',
    code: 'en',
  }, {
    name: 'Spanish',
    code: 'es',
  }]
  @Input() notificPanel;
  constructor(
    private layout: LayoutService,
    private navService: NavigationService,
    public themeService: ThemeService,
    public translate: TranslateService,
    private renderer: Renderer2,
    private userapi: UserAPIService,
    private picService : ProfilePicService,
    private router: Router, private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })

    if (localStorage.getItem('endUserProfilePicture') && localStorage.getItem('endUserProfilePicture') != 'assets/images/arkenea/default.jpg') {
      this.profilePicture = localStorage.getItem('endUserProfilePicture') 
    }


    
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.egretThemes;
    this.menuItemSub = this.navService.menuItems$
    .subscribe(res => {
      res = res.filter(item => item.type !== 'icon' && item.type !== 'separator');
      let limit = 4
      let mainItems:any[] = res.slice(0, limit)
      if(res.length <= limit) {
        return this.menuItems = mainItems
      }
      let subItems:any[] = res.slice(limit, res.length - 1)
      mainItems.push({
        name: 'More',
        type: 'dropDown',
        tooltip: 'More',
        icon: 'more_horiz',
        sub: subItems
      })
      this.menuItems = mainItems
    })
  }
  ngOnDestroy() {
    this.menuItemSub.unsubscribe()
  }
  setLang() {
    this.translate.use(this.currentLang)
  }
  changeTheme(theme) {
    this.themeService.changeTheme(this.renderer, theme);
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if(this.layoutConf.sidebarStyle === 'closed') {
      this.navService.publishNavigationChange('customer');
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  logout = () => {
    this.userapi.userLogout();
  }
  openInviteModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(InviteComponent, {
      width: '720px',
      disableClose: true,
    })
  }

  openTodosModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(TodosComponent, {
      width: '1100px',
      disableClose: true,
    })
  }
}
