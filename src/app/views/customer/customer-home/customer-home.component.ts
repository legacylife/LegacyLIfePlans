import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { MarkAsDeceasedComponent } from './../../../views/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'], 
  animations: [egretAnimations]
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
  userId = localStorage.getItem("endUserId");
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
  documentId: string = "";
  revokeId: string = "";
  myLegacy:boolean = true
  sharedLegacies:boolean = false;
  markAsDeceased:boolean = false;
  revokeAsDeceased:boolean = false;
  alreadyRevokeAsDeceased:boolean = false;
  finallyDeceased:boolean = false;
  datas: any;
  constructor(private layoutServ: LayoutService,
    private fb: FormBuilder,private snack: MatSnackBar,
    private userapi:UserAPIService,
    private loader: AppLoaderService,
    private dialog: MatDialog,private confirmService: AppConfirmService,
  ) {
    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
    this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    // this.categories$ = this.shopService.getCategories();
    // this.categories = ["My essentials", "Pets"]
    // this.products = []
    // this.cartData = []
    // this.filterForm = this.fb.group({
    //   search: ['']
    // })
    
    let urlData = this.userapi.getURLData();
    if(urlData.lastThird == 'legacies' && urlData.lastOne){
      this.customerLegaicesId = urlData.lastOne
      this.myLegacy= false
      this.sharedLegacies =true 
      this.checkDeceasedStatus();
    }

    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
      const loc = location.href;
      const locArray = loc.split('/')
      this.activeHeading = '';
      if(locArray && locArray[5]){
        this.activeHeading = locArray[5];
      }   
  }
  
  checkDeceasedStatus(query = {},){
    let req_vars = {};
    if(localStorage.getItem("endUserType")=='customer'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaicesId,trustId:this.userId,status:"Active" })
      }
    }else if(localStorage.getItem("endUserType")=='advisor'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaicesId,advisorId:this.userId,status:"Active" })
      }
    }
    //this.loader.open(); 
    this.userapi.apiRequest('post', 'deceased/viewDeceaseDetails', req_vars).subscribe(result => {
    //this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.documentId = '';
        this.markAsDeceased = true;
        this.revokeAsDeceased = false;
        this.revokeId = this.userId;
        if(result.data.deceasedData){    
            this.datas = result.data.deceasedData;       
            this.documentId = this.datas._id;
            this.markAsDeceased = false;
            this.revokeAsDeceased = true;
            if(this.datas.customerId.deceased && this.datas.customerId.deceased.status=='Active'){
              this.revokeAsDeceased = false;
              this.finallyDeceased = true;
            }
        }

        if(result.data.alreadyDeceased){    
          this.documentId = result.data.alreadyDeceased._id;
          //this.alreadyRevokeAsDeceased = true;
          this.revokeAsDeceased = true;
          if(result.data.alreadyDeceased.customerId.deceased && result.data.alreadyDeceased.customerId.deceased.status=='Active'){
            this.revokeAsDeceased = false;
            this.finallyDeceased = true;
          }
        }
      }
    }, (err) => {
      console.error(err);
    })

  }

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

  markAsDeceasedModal(data: any = {}) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.checkDeceasedStatus();
      if (!res) {
        return;
      }
    })
  }

  revokeAsDeceasedModal() {
    if(!this.documentId){
      this.snack.open("Something wrong, Please try again", 'OK', { duration: 4000 })
    }else{
    var statMsg = "Are you sure you want to revoke the deceased request?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};var deceasedFromName = {};
          const req_vars = {
            query: Object.assign({_id:this.documentId}, query),
            revokeId:this.revokeId,
            userType:localStorage.getItem("endUserType"),
            deceasedFromName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName")
          }
          this.userapi.apiRequest('post', 'deceased/revokeAsDeceased', req_vars).subscribe(result => {
            if (result.status == "error") {              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.checkDeceasedStatus();              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            this.loader.close();
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
    }
  }
}
