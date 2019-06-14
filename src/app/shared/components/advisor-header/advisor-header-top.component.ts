import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';

import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { UserAPIService } from './../../../userapi.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-advisor-header-top',
  templateUrl: './advisor-header-top.component.html'
})
export class AdvisorHeaderTopComponent implements OnInit, OnDestroy {
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
    private picService : ProfilePicService
  ) { }

  ngOnInit() {
    
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })

    if (localStorage.getItem('endUserProfilePicture') && localStorage.getItem('endUserProfilePicture') != 'assets/images/arkenea/default.jpg') {
      this.profilePicture = localStorage.getItem('endUserProfilePicture') 
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
}
