import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { UserIdleService } from 'angular-user-idle';
import { lockscreenModalComponent } from '../../lockscreen-modal/lockscreen-modal.component';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'], 
  animations: [egretAnimations]
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view'; 
  public currentPage: any;
  dayFirst = true;
  daySeco = false;
  layout = null;
  isProUser: boolean = false
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  
  public products: any[];
  public categories: any[];
  public activeCategory: string = 'all';
  public filterForm: FormGroup;
  public cart: any[];
  public cartData: any;
  customerLegaicesId:string=''
  activeHeading: string = "";
  myLegacy:boolean = true
  sharedLegacies:boolean = false
  constructor(private layoutServ: LayoutService,
    private fb: FormBuilder,private snackBar: MatSnackBar,
    private userapi:UserAPIService,
    private dialog: MatDialog,
    private userIdle: UserIdleService
  ) {
    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
    this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    // this.categories$ = this.shopService.getCategories();
    this.categories = ["My essentials", "Pets"]
    this.products = []
    this.cartData = []
    this.filterForm = this.fb.group({
      search: ['']
    })
    
    let urlData = this.userapi.getURLData();
    if(urlData.lastThird == 'legacies' && urlData.lastOne){
      this.customerLegaicesId = urlData.lastOne
      this.myLegacy= false
      this.sharedLegacies =true 
    }

    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   

     //For autolock functionality
     //https://www.npmjs.com/package/angular-user-idle
     this.userIdle.startWatching();    
     // Start watching when user idle is starting.
     this.userIdle.onTimerStart().subscribe(
       //count => console.log("home here",count)
     );    
     // Start watch when time is up.
    // this.userIdle.onTimeout().subscribe(() => this.stopWatching());
 //For autolock functionality
  }

 @HostListener('document:click', ['$event']) clickedOutside(event){
    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   
 }
  
 //start For autolock functionality
stop() {
 // console.log("signin stop");
  this.userIdle.stopTimer();
}

stopWatching() {
 // console.log("Signin stop watching");
  let dialogRef: MatDialogRef<any> = this.dialog.open(lockscreenModalComponent, {
    width: '720px',
    disableClose: true, 
    panelClass: 'lock--panel',
    backdropClass: 'lock--backdrop'   
  }) 
  dialogRef.afterClosed()
  .subscribe(res => {
    if (!res) {
      // If user press cancel
      return;
    }
  })
  this.userIdle.stopWatching();
}

startWatching() {
 // console.log("signin startWatching");
  this.userIdle.startWatching();
}

restart() {
 // console.log("signin restart");
  this.userIdle.resetTimer();
}
//End For autolock functionality


  showSecoDay() {
    this.dayFirst = false;
    this.daySeco = true;
  }
  
  ngOnDestroy() {

  }

  setActiveCategory(category) {
    this.activeCategory = category;
    this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }
}
