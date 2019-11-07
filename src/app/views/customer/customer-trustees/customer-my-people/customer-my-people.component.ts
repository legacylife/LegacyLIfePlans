import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { HireAdvisorComponent } from '../../hire-advisor-modal/hire-advisor-modal.component';
import { addTrusteeModalComponent } from './../../customer-home/add-trustee-modal/add-trustee-modal.component';
import { s3Details } from '../../../../config';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { ExecutorModalComponent } from './../../../executor-modal/executor-modal.component';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-my-people.component.html',
  styleUrls: ['./customer-my-people.component.scss'],
  animations: [egretAnimations]
})
export class CustomerMyPeopleComponent implements OnInit {
  allPeoples: any[];
  advisorListing: any[];
  showallPeoplesListing: boolean = true;
  showallPeoplesListingCnt: any;
  userId: string;
  listingAsc: boolean = true;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
  profileUrl = s3Details.url + '/profilePictures/';
  searchMessage : string = "";
  constructor(private route: ActivatedRoute, private router: Router, private dialog: MatDialog, private userapi: UserAPIService,
     private loader: AppLoaderService, private snack: MatSnackBar,
     private confirmService: AppConfirmService){
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getMyPeoplesList('All', -1);
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
        this.getMyPeoplesList('All', -1);
      },2000);           
    }
  }

  getMyPeoplesList = (search, sort, advquery: any = {}, trustquery: any = {}) => {
    let req_vars = {};    
    if (search == 'All'){
      req_vars = {
        //query: Object.assign({ customerId: this.userId, status: "Active" }, query),status: { $nin:['Deleted'] }  //'Rejected',
        trustquery: Object.assign({ customerId: this.userId, status: { $nin: ['Deleted'] } }, trustquery),
        advquery: Object.assign({ customerId: this.userId, status: { $nin: ['Deleted', 'Rejected'] } }, advquery),
        fields: {},
        order: { "modifiedOn": -1 },
      }
    } else {
      let custSearch = { $nin: ['Deleted'] };
      let advSearch = { $nin: ['Deleted', 'Rejected'] }
      
      if(search!=''){
        custSearch = search;
        advSearch = search;  
      }
      req_vars = {
        //query: Object.assign({ customerId: this.userId, status: "Active" }, query),status: { $nin:['Deleted'] }  //'Rejected',
        trustquery: Object.assign({ customerId: this.userId, status: custSearch }, trustquery),
        advquery: Object.assign({ customerId: this.userId, status: advSearch }, advquery),
        fields: {},
        order: { "modifiedOn": sort },
      }
    }

    this.userapi.apiRequest('post', 'advisor/myPeoplesListing', req_vars).subscribe(result => {  //hireAdvisorListing
      if (result.status == "error") {
        //console.log(result.data)
      } else {
        if(sort==1){
          this.listingAsc = false;
        }else{
          this.listingAsc = true;
        }
        this.allPeoples = result.data.myPeoples;
        this.showallPeoplesListingCnt = result.data.totalPeoplesRecords;
        if (result.data.totalPeoplesRecords > 0) {
          this.showallPeoplesListing = true;
        } else {
          if(search !='' && search !='All' && result.data.totalPeoplesRecords == 0){
            this.searchMessage = "No records found"
          }
          else {
            this.searchMessage = "Currently you do not have any trustee associated"
          }
          this.showallPeoplesListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }


  openHireAdvisorModal(id: any = {}, update: any = {}, isNew?, hireFullName='') {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
        update: update,
        hireFullName:hireFullName
      },
    })
  }


  openAddTrusteeModal(id, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {
      width: '720px',
      data: {
        id: id,
      },
      disableClose: true,
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getMyPeoplesList('All', '-1');
        if (!res) {
          return;
        }
      })
  }

  resendInvitation(id) {
    let query = {};
    const req_vars = {
      query: Object.assign({ _id: id }, query),
      extrafields: Object.assign({ inviteByName: localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName") })
    }
    this.userapi.apiRequest('post', 'trustee/resend-invitation', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err);
    })
  }

  getAdvisorSpecilities(businessType){
    if(businessType)
      return businessType.join(", ")
    else
      return ""
  }

  removeTrusteeAdvisor(peopleObj){
    var statMsg = "Are you sure you want remove?"
    var userType = peopleObj.type
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};
          if(userType == 'advisor'){
            req_vars = {customerId:localStorage.getItem("endUserId"), advisorId:peopleObj.advisorId._id, userType : userType}
          }else{   
            req_vars = {customerId:localStorage.getItem("endUserId"), trustId:peopleObj.trustId._id, userType : userType}
          }
          this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();
            this.getMyPeoplesList('All', -1);
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
           
        }
      })       
  }


markAsExecutor(type,docId,userid,firstName,lastName) {
  let dialogRef: MatDialogRef<any> = this.dialog.open(ExecutorModalComponent, {
    width: '720px',
    data: {
      type: type,
      docId: docId,
      userid: userid,
      firstName: firstName,
      lastName: lastName,
      for: 'setExecutor',
    },
    disableClose: true,
  });
  dialogRef.afterClosed()
    .subscribe(res => {
      this.getMyPeoplesList('All', '-1');
      if (!res) {
        return;
      }
    })
}


removeAsExecutor(type,docId,userid,firstName,lastName) {
  let dialogRef: MatDialogRef<any> = this.dialog.open(ExecutorModalComponent, {
    width: '720px',
    data: {
      type: type,
      docId: docId,
      userid: userid,
      firstName: firstName,
      lastName: lastName,
      for: 'removeExecutor',
    },
    disableClose: true,
  });
  dialogRef.afterClosed()
    .subscribe(res => {
      this.getMyPeoplesList('All', '-1');
      if (!res) {
        return;
      }
    })
}


  
}
