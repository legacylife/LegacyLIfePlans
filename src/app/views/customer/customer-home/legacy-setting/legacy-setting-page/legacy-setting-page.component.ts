import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { legacySettingModalComponent } from './../legacy-setting-modal/legacy-setting-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './legacy-setting-page.component.html',
  styleUrls: ['./legacy-setting-page.component.scss'],
  animations: [egretAnimations]
})
export class legacySettingPageComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showPetsListing = true;
  showPetsListingCnt: any;
  userId: string;
  petsListing:any = [];
  modifiedDate:any;
  PetList:any = [];
  customerData:any = [];
  trusteePetsCnt:any;
  urlData:any={};
	dynamicRoute:string;
  customerLegaciesId: string;
  customerLegacyType:string='customer';														
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  PetsManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,
    private sharedata: DataSharingService) { }
  ngOnInit() { 
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.customerLegaciesId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction;    
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.getCustomerDetails();
        this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
          this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
          this.PetsManagementSection = userAccess.PetsManagement
        });
      this.showTrusteeCnt = false;
      this.shareLegacFlag = true;
    }else{      
      this.userapi.getFolderInstructions('pets', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    } 
  }

  openPetsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  getCustomerDetails(query = {}){
    const req_vars = {
      query: Object.assign({ _id: this.customerLegaciesId }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.customerData = result.data;
      }
    }, (err) => {
      console.error(err)
    })
  }

}