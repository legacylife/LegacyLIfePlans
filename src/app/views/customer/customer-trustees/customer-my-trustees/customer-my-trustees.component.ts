import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { addTrusteeModalComponent } from './../../customer-home/add-trustee-modal/add-trustee-modal.component';
import { serverUrl, s3Details } from '../../../../config';

@Component({
  selector: 'app-customer-my-trustees',
  templateUrl: './customer-my-trustees.component.html',
  styleUrls: ['./customer-my-trustees.component.scss'],
  animations: [egretAnimations]
})
export class CustomerMyTrusteeComponent implements OnInit {
  allPeoples: any[];
  userId: string;
  trustyListing:any = [];
  fileActivityLogList:any;
  showTrustyListing = false;
  showTrustyListingCnt: any;
  profileUrl = s3Details.url+'/profilePictures/';
  constructor(private userapi: UserAPIService,private dialog: MatDialog,private snack: MatSnackBar,
  ) { }


  ngOnInit() {
    // profilePic: 'assets/images/arkenea/ca.jpg',
    // userName: 'Allen Barry',
    // emailId: 'barryallen@gmail.com',
    // totalFiles: '24 Files',
    // totalFolders: '9 Folders',
    // position: 'CFA, CIC',
    // status: 'assigned'
    this.userId = localStorage.getItem("endUserId");
    this.getTrusteeList('All','-1');
  }

  getTrusteeList = (search,sort) => {
    if(sort){
      localStorage.setItem("trustee_sort", sort);
    }
    let query = {};
    let req_vars = {};
    if(search=='All'){
       req_vars = {
        query: Object.assign({ customerId: this.userId}, query),
        fields: {},
        order: {"createdOn": sort},
      }
    }else{
       req_vars = {
        query: Object.assign({ customerId: this.userId, status: search }, query),
        fields: {},
        order: {"createdOn": sort},
      }
    }
    this.userapi.apiRequest('post', 'trustee/listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.trustyListing = result.data.trustList;

        console.log("Image :- ",this.trustyListing);

        this.showTrustyListingCnt = this.trustyListing.length;  
        if (this.showTrustyListingCnt>0) {
          this.showTrustyListing = true;
        }
      }
    }, (err) => {
      console.error(err);
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
      this.getTrusteeList('All','-1');
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
