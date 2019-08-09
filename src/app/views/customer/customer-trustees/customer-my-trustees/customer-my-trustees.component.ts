import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { addTrusteeModalComponent } from './../../customer-home/add-trustee-modal/add-trustee-modal.component';
import { serverUrl, s3Details } from '../../../../config';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
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
  showTrustyListing : boolean = true;
  listingAsc : boolean = true;
  showTrustyListingCnt: any;
  profileUrl = s3Details.url+'/profilePictures/';
  testImg = '/pk.png';
  docPath: string; 
  searchMessage:string = ""
  urlData:any={};
  constructor(private userapi: UserAPIService,
    private dialog: MatDialog,
    private confirmService: AppConfirmService,
    private loader: AppLoaderService, 
    private snack: MatSnackBar,
    private router: Router) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.docPath = filePath;
 
    this.getTrusteeList('All','-1');
    this.urlData = this.userapi.getURLData();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      setTimeout(()=>{
        this.getTrusteeList('All','-1');
      },2000);           
    }
  }

  getTrusteeList = (search,sort) => {
    if(sort){
      localStorage.setItem("trustee_sort", sort);
    }
    let query = {};
    let req_vars = {};
    if(search=='All'){
       req_vars = {
        query: Object.assign({ customerId: this.userId, status: { $nin:['Deleted'] }}, query),
        fields: {},
        order: {"createdOn": sort},
      }
    }else{
        let custSearch = { $nin: ['Deleted'] };    
        if(search!=''){
          custSearch = search;
        }
       req_vars = {
        query: Object.assign({ customerId: this.userId, status: custSearch }, query),
        fields: {},
        order: {"createdOn": sort},
      }
    }
    this.userapi.apiRequest('post', 'trustee/listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(sort==1){
          this.listingAsc = false;
        }else{
          this.listingAsc = true;
        }
        this.trustyListing = result.data.trustList;

        this.showTrustyListingCnt = this.trustyListing.length;  
        if (this.showTrustyListingCnt>0) {
          this.showTrustyListing = true;
        }else{
          if(search !='' && search !='All' && this.showTrustyListingCnt == 0){
            this.searchMessage = "No records found"
          }
          else {
            this.searchMessage = "Currently you do not have any trustee associated"
          }
          this.showTrustyListing = false;
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
  this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
  this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
    var newBlob = new Blob([res])
    var downloadURL = window.URL.createObjectURL(newBlob);
    let filePath = downloadURL;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    this.snack.dismiss();
  });
}

FolderSize = () => {    
  let query = {};
  let req_vars = {
    query: Object.assign({ userId: this.userId}, query)
  }
  this.userapi.download('documents/checkFolderSize', req_vars).subscribe(res => {
    console.log(res);
  });
}

removeTrusteeAdvisor(removeCustomerId){
    var statMsg = "Are you sure you want remove?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};          
          req_vars = {customerId:localStorage.getItem("endUserId"), trustId:removeCustomerId, userType : 'customer'}
          this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();
            this.getTrusteeList('All','-1');
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
      }
    })
  }

}
