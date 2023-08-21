import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { RoutePartsService } from "./shared/services/route-parts.service";
import { ThemeService } from './shared/services/theme.service';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  appTitle = 'LLP';
  pageTitle = '';
  userId: string
  userType: string
  
  constructor(
    public title: Title, 
    private router: Router, 
    private activeRoute: ActivatedRoute,
    private routePartsService: RoutePartsService,
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {
  /*
  this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
  this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")

  if(!this.userId || !this.userType) {
     console.log('asdasd2345 2345235235');
      const url = window.location.href;
      const urlArray = url.split('/admin');
      if(urlArray.indexOf('auth') === -1) {
        router.navigate(['auth/','admin/' 'signin']);
      }
    }*/
   }

  ngOnInit() {
    this.changePageTitle();
  }

  ngAfterViewInit() {
    this.themeService.applyMatTheme(this.renderer)
  }
  changePageTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
      var routeParts = this.routePartsService.generateRouteParts(this.activeRoute.snapshot);
      if (!routeParts.length)
        return this.title.setTitle(this.appTitle);
      // Extract title from parts;
      this.pageTitle = routeParts
                      .reverse()
                      .map((part) => part.title )
                      .reduce((partA, partI) => {return `${partA} > ${partI}`});
      this.pageTitle += ` | ${this.appTitle}`;
      this.title.setTitle(this.pageTitle);
    });
  }
  
}
