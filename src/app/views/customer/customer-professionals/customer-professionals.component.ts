import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { SendAnEmailComponent } from './send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from '../hire-advisor-modal/hire-advisor-modal.component';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'app-customer-professionals',
  templateUrl: './customer-professionals.component.html',
  styleUrls: ['./customer-professionals.component.scss'],
  animations: [egretAnimations]
})
export class CustomerProfessionalComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profilePicture: any = "assets/images/arkenea/default.jpg"  
  selectedProfileId:string;
  row: any;
  profileData: any;
  about: string;
  userId : string;
  advisorStatus : string='';
  constructor(
    private route: ActivatedRoute,private userapi: UserAPIService, 
    private router: Router, private dialog: MatDialog, 
    private loader: AppLoaderService,private snack: MatSnackBar,private confirmService: AppConfirmService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getAdvisorView();
  }

  getAdvisorView = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.profileData = this.row = result.data;  
        if(result.data.profilePicture){
          this.profilePicture = filePath + result.data.profilePicture;
        }        
        this.leadsCount();
        this.checkAdvisorView(this.profileData._id)
      }
    }, (err) => {
      console.error(err)
    })
  }

  leadsCount(query = {}) {
    const req_vars = {
      query: Object.assign({customerId:this.userId,advisorId:this.selectedProfileId}, query)
    }
    this.userapi.apiRequest('post', 'lead/lead-submit', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
                    
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
  }

  openSendEmailModal(id: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SendAnEmailComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id
      },
    })
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  openHireAdvisorModal(id: any = {},update: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
        update: update,
      },
    })
  }

  getAdvisorSpecilities(businessType){
    if(businessType)
      return businessType.join(", ")
    else
      return ""
  }

  removeAdvisor(advisorId){
      var statMsg = "Are you sure you want remove?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            let req_vars = {};          
            req_vars = {customerId:this.userId, advisorId:advisorId, userType : 'advisor'}
            this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
              this.loader.close();
              this.router.navigate(["customer", "professionals-landing","prof-advisor-listing"])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })              
            }, (err) => {
              console.error(err)
              this.loader.close();
            })
        }
      })
  }

  checkAdvisorView(advisorId='') {
    const req_vars = {
      query: Object.assign({customerId:this.userId,advisorId:advisorId})
    }
    this.userapi.apiRequest('post', 'advisor/checkHireAdvisor', req_vars).subscribe(result => {
        if(result.status == "success" && result.data.RequestData){
          this.advisorStatus  = result.data.RequestData.status
          console.log("advisorStatus :", this.advisorStatus);
        }
      }, (err) => {
      console.error(err)
    })
  }

}