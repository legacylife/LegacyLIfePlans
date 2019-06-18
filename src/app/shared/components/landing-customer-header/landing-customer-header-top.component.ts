import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
//import { LandingCustomerNavService } from '../../../shared/services/pre-login-cust-landing-nav-links.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-landing-customer-header-top',
  templateUrl: './landing-customer-header-top.component.html',
  styleUrls: ['./landing-customer-header-top.component.scss']
})
export class LandingCustomerHeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
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
    private navService: NavigationService,//LandingCustomerNavService,
    public themeService: ThemeService,
    public translate: TranslateService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
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

    const locArray = location.href.split("#")
    this.contentScroll(locArray[1])
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
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  contentScroll(scrolldivid) {
    var content = document.getElementById("customer-home-content")
    console.log(content)
    console.log(scrolldivid)
    var scrolldiv = document.getElementById(scrolldivid)
    var topPos = scrolldiv.offsetTop;
    content.scrollTop = topPos;
    
    // var scrolldiv = document.getElementById(scrolldivid)
    // scrolldiv.scrollIntoView()
  }
}
