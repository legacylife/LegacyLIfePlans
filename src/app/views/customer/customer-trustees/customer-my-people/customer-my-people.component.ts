import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  showallPeoplesListing  : boolean = false;
  showallPeoplesListingCnt: any;
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
  profileUrl = s3Details.url+'/profilePictures/';
  constructor( private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getMyPeoplesList('All','-1');
  }

  getMyPeoplesList = (search,sort,advquery:any = {},trustquery:any = {}) => {
   
    let req_vars = {};
    if(search=='All'){
     req_vars = {
     //query: Object.assign({ customerId: this.userId, status: "Active" }, query),status: { $nin:['Deleted'] }  //'Rejected',
     trustquery: Object.assign({customerId:this.userId, status: {$nin:['Deleted']}}, trustquery),
     advquery: Object.assign({customerId:this.userId, status:{ $nin:['Deleted','Rejected'] } }, advquery),
     fields: {},
     order: {"createdOn": sort},
     }
    }else{
      req_vars = {
        //query: Object.assign({ customerId: this.userId, status: "Active" }, query),status: { $nin:['Deleted'] }  //'Rejected',
        trustquery: Object.assign({customerId:this.userId, status: search}, trustquery),
        advquery: Object.assign({customerId:this.userId, status:search}, advquery),
        fields: {},
        order: {"createdOn": sort},
        }
    }

   this.userapi.apiRequest('post', 'advisor/myPeoplesListing', req_vars).subscribe(result => {  //hireAdvisorListing
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.allPeoples = result.data.myPeoples;
        this.showallPeoplesListingCnt = result.data.totalPeoplesRecords;
        if (result.data.totalRecords>'0') {
          this.showallPeoplesListing = true;
        }else{ 
           this.showallPeoplesListing = false;
          }
      }
    }, (err) => {
      console.error(err);
    })
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

  
  openAddTrusteeModal(id,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {     
      width: '720px',
      data: {
        id: id,
      },
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getMyPeoplesList('All','-1');
      if (!res) {
        return;
      }
    })
  }

  resendInvitation(id){
    let query = {};
     const req_vars = {
       query: Object.assign({_id: id}, query),   
       extrafields: Object.assign({inviteByName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName")})
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
  
}
