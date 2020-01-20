import { Component, OnInit,AfterViewInit, OnDestroy, ViewChild,HostListener ,Input, EventEmitter } from '@angular/core';
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
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { PetsDetailsComponent } from './pets/pets-details/pets-details.component';
//import { ChatService } from 'app/shared/components/app-chats/chat.service';
//import { AppChatsModule } from '../../../shared/components/app-chats/app-chats.module';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'], 
  animations: [egretAnimations]
})
export class CustomerHomeComponent implements OnInit,AfterViewInit, OnDestroy {
  userId = localStorage.getItem("endUserId");
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view'; 
  public currentPage: any;
  layout = null;
  isProUser: boolean = false
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  @ViewChild(PetsDetailsComponent) childReferance;
  
  customerLegaicesId:string=''
  activeHeading: string = "";
  documentId: string = "";
  revokeId: string = "";
  shareDeathFileCount: string = "0";
  myLegacy:boolean = true
  sharedLegacies:boolean = false;
  markAsDeceased:boolean = false;
  revokeAsDeceased:boolean = false;
  alreadyRevokeAsDeceased:boolean = false;
  finallyDeceased:boolean = false;
  settingFlag:boolean = false;
  datas: any;
  @Input() private customerLegacyId: EventEmitter<string>;

  constructor(private layoutServ: LayoutService,
    private fb: FormBuilder,private snack: MatSnackBar,
    private userapi:UserAPIService,
    private loader: AppLoaderService,
    private dialog: MatDialog,private confirmService: AppConfirmService,
    private shareData: DataSharingService   
  ) {
    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
    this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    this.settingFlag = localStorage.getItem("endUserlegacySetting") == 'yes' ? false : true
    let urlData = this.userapi.getURLData();
    
      if(urlData.lastThird == 'legacies' && urlData.lastOne){
        this.customerLegaicesId = urlData.lastOne;
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
  
  ngAfterViewInit() {
    //  console.log(" data 1 >>>>>>>",this.childReferance)
    //  this.customerLegaicesId = this.childReferance.legacyCustomerId;
    //  console.log(" data 2 >>>>>>>",this.customerLegaicesId)
  }
 
  checkDeceasedStatus(query = {}){
    console.log(" here we are >>>>>>>",this.customerLegaicesId,'--------',this.customerLegacyId);
    if( this.customerLegacyId ) {
      this.customerLegacyId.subscribe(data => {
        console.log(" data >>>>>>>",data)
        if( data ) {
          console.log(this.customerLegaicesId,'>>>>data<<<<<',data)
          this.customerLegaicesId = data;
        }
      })
    }
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
          //this.documentId = result.data.alreadyDeceased._id;
          //this.alreadyRevokeAsDeceased = true;
          //result.data.alreadyDeceased.customerId.lockoutLegacyDate
          this.revokeAsDeceased = true;
          if(result.data.alreadyDeceased.customerId.deceased && result.data.alreadyDeceased.customerId.deceased.status=='Active'){
            this.markAsDeceased = false;
            this.revokeAsDeceased = false;
            this.finallyDeceased = true;
          }
        }
        //console.log('Here I am 1st ')
        this.shareData.userShareDataDeathFileSource.subscribe((shareDeathFileCount) => {
          this.shareDeathFileCount = shareDeathFileCount;
          //console.log('Here I am 2nd',this.shareDeathFileCount)
        })
      }
    }, (err) => {
      console.error(err);
    })
  }


  ngOnDestroy() {

  }

  toggleSideNav() {
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }

  markAsDeceasedModal(data: any = {}) {
   
    // if( this.customerLegacyId || this.customerLegacyId==undefined ) {  
    //     this.customerLegacyId.subscribe(data => {
    //       console.log(" data >>>>>>>",data)
    //       if( data ) {
    //         console.log(this.customerLegaicesId,'>>>>data<<<<<',data)
    //         this.customerLegaicesId = data;
    //       }
    //     })
    //   }
    this.customerLegaicesId = this.childReferance.legacyCustomerId;
    console.log(" data markAsDeceasedModal",this.customerLegaicesId)
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
      data: {
        customerLegaicesId: this.customerLegaicesId,
      }
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
    // if(!this.documentId){
    //   this.snack.open("Something wrong, Please try again", 'OK', { duration: 4000 })
    // }else{
    var statMsg = "Are you sure you want to revoke the deceased request?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          let criteria = {};
          if(this.documentId){
            criteria = {_id:this.documentId};
          }else{
            criteria = {customerId:this.customerLegaicesId,status:'Active'};
          }

          const req_vars = {
            query: Object.assign(criteria, query),
            revokeId:this.revokeId,
            userType:localStorage.getItem("endUserType"),
            deceasedFromName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName"),
            fromId:this.userId,
            toId:this.customerLegaicesId,
            folderName:'',
            subFolderName:''
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
   // }
  }
}
