import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { LandingAdvisorNavService } from '../../../shared/services/pre-login-advisor-landing-nav-links.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Router } from '@angular/router';
// import { AdvisorNavigationService } from '../../../shared/services/pre-login-advisor.service';

@Component({
  selector: 'app-landing-advisor-header-top',
  templateUrl: './landing-advisor-header-top.component.html',
  styleUrls: ['./landing-advisor-header-top.component.scss']
})
export class LandingAdvisorHeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
  menuItems: any;
  menuItemSub: Subscription;
  headerOff : boolean = true
  egretThemes: any[] = [];
  currentLang = 'en'; routeParts: any[];
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
    private navService: LandingAdvisorNavService,
    public themeService: ThemeService,
    public translate: TranslateService,
    private renderer: Renderer2,private router: Router, 
  ) { }

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.egretThemes;
    this.menuItemSub = this.navService.menuItems$
      .subscribe(res => {
        res = res.filter(item => item.type !== 'icon' && item.type !== 'separator');
        let limit = 4
        let mainItems: any[] = res.slice(0, limit)
        if (res.length <= limit) {
          return this.menuItems = mainItems
        }
        let subItems: any[] = res.slice(limit, res.length - 1)
        mainItems.push({
          name: 'More',
          type: 'dropDown',
          tooltip: 'More',
          icon: 'more_horiz',
          sub: subItems
        })
        this.menuItems = mainItems
      })
    const locArray = location.href.split("#");
    if(locArray[1]==undefined){
      const locationArray = location.href.split("/");
      if(locationArray[3]=='coachs-corner'){
          this.headerOff = false;
      }
    }

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
    if (this.layoutConf.sidebarStyle === 'closed') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  contentScroll(scrolldivid) {
    var content = document.getElementById("advisor-home-content")
    // console.log(content)
    var scrolldiv = document.getElementById(scrolldivid);
    if(scrolldivid=='ad-home'){
      const locationArray = location.href.split("/");
      console.log('locations',locationArray)
      if(locationArray[3]=='coachs-corner' || (locationArray[3]=='advisor' && locationArray[4]=='our-plan')){
        console.log('locations>>>>>',locationArray[2],locationArray[3],locationArray[4])
          this.headerOff = false;
          this.router.navigateByUrl('/');
      }
    }
    var topPos = scrolldiv ? scrolldiv.offsetTop : 0;
    if(content) {
      content.scrollTop = topPos;
    }
    // var scrolldiv = document.getElementById(scrolldivid)
    // scrolldiv.scrollIntoView()
  }

}
