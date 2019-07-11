import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { addTrusteeModalComponent } from './../../customer-home/add-trustee-modal/add-trustee-modal.component';
import { serverUrl, s3Details } from '../../../../config';
const filePath = 'https://s3.amazonaws.com/llp-test';

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
  showTrustyListing : boolean = false;
  showTrustyListingCnt: any;
  profileUrl = s3Details.url+'/profilePictures/';
  testImg = '/pk.png';
  docPath: string; 
  
  constructor(private userapi: UserAPIService,private dialog: MatDialog,private snack: MatSnackBar,) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.docPath = filePath;
 
    this.getTrusteeList('All','-1');
  }

  createDirectory = () => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ folderName: this.userId }, query)
    }
    this.userapi.download('documents/createUserDir', req_vars).subscribe(res => {
        console.log(res);
    });
  }

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query)
    }
    this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
      window.open(window.URL.createObjectURL(res));
      this.downloadFiles(filename)
    });
  }

  downloadFiles(filePath){
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
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
