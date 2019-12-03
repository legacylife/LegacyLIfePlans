import { Component, OnInit, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { UserAPIService } from './../../../userapi.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { NavigationService } from '../../services/navigation.service';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { ReferAndEarnModalComponent } from '../../../views/refer-and-earn-modal/refer-and-earn-modal.component';
import { TodosComponent } from '../../../views/todos/todos.component';
import { Router } from '@angular/router';
import { serverUrl, s3Details } from '../../../config';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import * as moment from 'moment'
import * as io from 'socket.io-client';
@Component({
  selector: 'app-advisor-header-top',
  templateUrl: './advisor-header-top.component.html'
})
export class AdvisorHeaderTopComponent implements OnInit, OnDestroy {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId:string;
  userType:string;
  layoutConf: any;
  menuItems:any;
  menuItemSub: Subscription;
  egretThemes: any[] = [];
  currentLang = 'en';
  profilePicture: any = "assets/images/arkenea/default.jpg"
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
    private dialog: MatDialog,
    private router: Router,
    private subscription: SubscriptionService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem('endUserId');
    this.userType = localStorage.getItem('endUserType');
    var socket = io(serverUrl);
    socket.emit('loginforonline',{userId: this.userId,userType:this.userType});
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })

    if (localStorage.getItem('endUserProfilePicture') != "undefined" && localStorage.getItem('endUserProfilePicture') != 'assets/images/arkenea/default.jpg') {
      this.profilePicture = localStorage.getItem('endUserProfilePicture') 
    }    
    else {
      this.profilePicture = 'assets/images/arkenea/default.jpg' 
    }
    
    // console.log()
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
      this.navService.publishNavigationChange('advisor')
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
    let subscriptionEndDate = localStorage.getItem('endUserSubscriptionEndDate')
    let getDiff = subscriptionEndDate ? this.subscription.getDateDiff( moment().toDate(), moment(subscriptionEndDate).toDate() ) : 0
    console.log("localStorage >>>>>> ",localStorage)
    if( localStorage.getItem('endisReferAndEarn') === 'Yes' || localStorage.getItem('isSubscribedBefore') === 'true' ) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
        width: '720px',
        disableClose: true,
      })
    }
    else if( getDiff <= 0) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
        width: '720px',
        disableClose: true,
      })
    }
    else{
      this.router.navigate(['/subscription'])
    }
  }

  openTodosModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(TodosComponent, {
      width: '1100px',
      disableClose: true,
    })
  }
}
