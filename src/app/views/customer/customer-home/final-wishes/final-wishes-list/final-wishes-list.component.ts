import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
//import { Subscription, Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { FinalWishesFormModalComponent } from './../final-wishes-form-modal/final-wishes-form-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './final-wishes-list.component.html',
  styleUrls: ['./final-wishes-list.component.scss'],
  animations: [egretAnimations]
})
export class FinalWishesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showFuneralPlansListing = true;
  showFuneralPlansCnt: any;
  showObituaryListing = true;
  showObituaryListingCnt: any;
  showCelebrationLifesListing = true;
  showCelebrationLifesListingCnt: any;
  userId: string;
  FuneralPlansList:any = [];
  ObituaryList:any = [];
  CelebrationLifesList:any = [];
  modifiedDate:any;
  WishesList:any = [];
  urlData:any={};	  
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  trusteeFuneralCnt:any;
  trusteeObituaryCnt:any;
  trusteeCelebrationCnt:any;
  FuneralPlansManagementSection:string='now';
  ObituaryManagementSection:string='now';
  CelebrationLifeManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.FuneralPlansManagementSection = userAccess.FuneralPlansManagement
        this.ObituaryManagementSection= userAccess.ObituaryManagement
        this.CelebrationLifeManagementSection= userAccess.CelebrationLifeManagement
      });
      this.showTrusteeCnt = false; this.shareLegacFlag = true;
    }else{      
      this.userapi.getFolderInstructions('final_wishes', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    }   
    this.getWishList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
     setTimeout(()=>{
        this.getWishList();
      },2000);  
    }
  }

  getWishList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'finalwish/finalListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.WishesList = result.data.wishList;
        this.FuneralPlansList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Funeral Plans'
        }).map(el => el)
        this.showFuneralPlansCnt = this.FuneralPlansList.length        
        if (this.showFuneralPlansCnt>0) {
          this.showFuneralPlansListing = true;
        } else {
          this.showFuneralPlansListing = false;
        }

        this.ObituaryList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Obituary'
        }).map(el => el)
        this.showObituaryListingCnt = this.ObituaryList.length
        if (this.showObituaryListingCnt > 0) {
          this.showObituaryListing = true;
        } else {
          this.showObituaryListing = false;
        }

        this.CelebrationLifesList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Celebration of Life'
        }).map(el => el)
        this.showCelebrationLifesListingCnt = this.CelebrationLifesList.length

        if(this.shareLegacFlag){
          let funeralPlans = '';let obituary = '';let celebrationLifes = '';
          if(this.FuneralPlansManagementSection=='now'){
            funeralPlans = this.FuneralPlansList;
          }
          if(this.ObituaryManagementSection=='now'){
           obituary = this.ObituaryList;
          }
          if(this.CelebrationLifeManagementSection=='now'){
            celebrationLifes = this.CelebrationLifesList;
          }
          let shareFinalWishes = {funeralPlans:funeralPlans,obituary:obituary,celebrationLifes:celebrationLifes };        
          this.sharedata.shareLegacyData(shareFinalWishes);
        }

        this.trusteeFuneralCnt = result.data.totalFuneralTrusteeRecords;
        this.trusteeObituaryCnt = result.data.totalObituaryTrusteeRecords
        this.trusteeCelebrationCnt = result.data.totalCelebrTrusteeRecords;

        if (this.showCelebrationLifesListingCnt > 0) {
          this.showCelebrationLifesListing = true;
        }
        else {
          this.showCelebrationLifesListing = false;
        }

      }
    }, (err) => {
      console.error(err);
    })
  }

  openFinalWishModal(FolderName, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(FinalWishesFormModalComponent, {
      data: {
        FolderName: FolderName,
      },
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getWishList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  openManageTrusteeModal(title,code,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ManageTrusteeModalComponent, {
      width: '720px',
      disableClose: true, 
      data: {
        title: title,
        code:code
      }
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
       this.getWishList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
}
}