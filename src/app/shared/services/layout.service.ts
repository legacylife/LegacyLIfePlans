import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { getQueryParam } from '../helpers/url.helper';

interface ILayoutConf {
  navigationPos?: string;   // side, top
  sidebarStyle?: string;    // full, compact, closed
  dir?: string;             // ltr, rtl
  layoutInTransition?: boolean;
  isMobile?: boolean,
  useBreadcrumb?: boolean,
  breadcrumb?: string,      // simple, title
  topbarFixed?: boolean
}
interface ILayoutChangeOptions {
  duration?: number,
  transitionClass?: boolean
}
interface IAdjustScreenOptions {
  browserEvent?: any,
  route?: string
}


@Injectable()
export class LayoutService {
  public layoutConf: ILayoutConf;
  layoutConfSubject = new BehaviorSubject<ILayoutConf>(this.layoutConf);
  layoutConf$ = this.layoutConfSubject.asObservable();
  public isMobile: boolean;
  public currentRoute: string;
  public fullWidthRoutes = ['shop'];
  displayLocationInfo: any;
  handleLocationError: any;
  constructor(
    private router: Router
  ) {
    this.setAppLayout();
   // navigator.geolocation.getCurrentPosition(this.displayLocationInfo,this.handleLocationError, { timeout: 0 });
  }

  // getCurrentPosition(position) {
  //   console.log('position >>>',position);
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(this.displayLocationInfo,this.handleLocationError, { timeout: 0 });

  //     const lng = position.coords.longitude;
  //     const lat = position.coords.latitude;
  //     console.log(`longitude: ${ lng } | latitude: ${ lat }`);
  //   }
  // }

  // displayLocationInfo1(position) {
  //   console.log('position >>>',position);
  //   const lng = position.coords.longitude;
  //   const lat = position.coords.latitude;
  
  //   console.log(`longitude: ${lng} | latitude: ${lat}`);
  // }
  
  // handleLocationError(error) {
  //   console.log('position >>>',error);
  //   switch (error.code) {
  //     case 3:
  //       // timeout was hit, meaning nothing's in the cache
  //       // let's provide a default location:
  //       console.log('3',error)
  //       this.displayLocationInfo({ coords: { longitude: 33.631839, latitude: 27.380583 } });  
  //       // now let's make a non-cached request to get the actual position
  //       navigator.geolocation.getCurrentPosition(this.displayLocationInfo, this.handleLocationError);
  //       break;
  //     case 2:
  //      console.log('2',error)
  //       break;
  //     case 1:
  //       console.log('1',error)
  //   }
  // }

  setAppLayout() {
    //******** SET YOUR LAYOUT OPTIONS HERE *********
    this.layoutConf = {
      "navigationPos": "top",    // side, top
      "sidebarStyle": "full",     // full, compact, closed
      "dir": "ltr",               // ltr, rtl
      "useBreadcrumb": true,
      "topbarFixed": false,
      "breadcrumb": "title"       // simple, title
    }    
    //******* Only for demo purpose ***
    this.setLayoutFromQuery();
    //**********************
  }

  publishLayoutChange(lc: ILayoutConf, opt: ILayoutChangeOptions = {}) {
    let duration = opt.duration || 250;
    if (!opt.transitionClass) {
      this.layoutConf = Object.assign(this.layoutConf, lc);
      return this.layoutConfSubject.next(this.layoutConf);
    }

    this.layoutConf = Object.assign(this.layoutConf, lc, { layoutInTransition: true });
    this.layoutConfSubject.next(this.layoutConf);

    setTimeout(() => {
      this.layoutConf = Object.assign(this.layoutConf, { layoutInTransition: false });
      this.layoutConfSubject.next(this.layoutConf);
    }, duration);
  }

  setLayoutFromQuery() {
    let layoutConfString = getQueryParam('layout');
    try {
      this.layoutConf = JSON.parse(layoutConfString);
    } catch (e) { }
  }

  
  adjustLayout(options: IAdjustScreenOptions = {}) {
    let sidebarStyle: string;
    this.isMobile = this.isSm();
    this.currentRoute = options.route || this.currentRoute;
    sidebarStyle = this.isMobile ? 'closed' : this.layoutConf.sidebarStyle;
    
    if (this.currentRoute) {
      this.fullWidthRoutes.forEach(route => {
        if(this.currentRoute.indexOf(route) !== -1) {
          sidebarStyle =  'open';
        }
      })
    }

    this.publishLayoutChange({
      isMobile: this.isMobile,
      sidebarStyle: sidebarStyle
    });
  }
  isSm() {
    return window.matchMedia(`(max-width: 959px)`).matches;
  }
}