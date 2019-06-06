import { Component, OnInit, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header-side',
  templateUrl: './header-side.template.html'
})
export class HeaderSideComponent implements OnInit {
  @Input() notificPanel;
  currentLang = 'en';
  firstName: string
  lastName: string = "";
  shortname:any;
  public availableLangs = [{
    name: 'English',
    code: 'en',
  }, {
    name: 'Spanish',
    code: 'es',
  }]
  public egretThemes;
  public layoutConf:any;
  constructor(
    private themeService: ThemeService,
    private layout: LayoutService,
    public translate: TranslateService,
    private renderer: Renderer2,
    private api: APIService,
    private userapi: UserAPIService,
    private route: ActivatedRoute,
    private router:Router
  ) {}
  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.firstName = localStorage.getItem("firstName") || sessionStorage.getItem("firstName");
    this.lastName = localStorage.getItem("lastName") || sessionStorage.getItem("lastName");

    this.shortname = this.firstName.charAt(0)+this.lastName.charAt(0);

    this.egretThemes = this.themeService.egretThemes;
    
    if(!this.api.isLoggedIn()){
      this.router.navigate(['/', 'llp-admin', 'signin'])
    }
    else {
      this.translate.use(this.currentLang);
    }
  }
  
  changeTheme(theme) {
    this.themeService.changeTheme(this.renderer, theme);
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

  toggleCollapse() {
    // compact --> full
    if(this.layoutConf.sidebarStyle === 'compact') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      }, {transitionClass: true})
    }

    // * --> compact
    this.layout.publishLayoutChange({
      sidebarStyle: 'compact'
    }, {transitionClass: true})
  }

  logout = () => {
    this.api.logout();
  }
}