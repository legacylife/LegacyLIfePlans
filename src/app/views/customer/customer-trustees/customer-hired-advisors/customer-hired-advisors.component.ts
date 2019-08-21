import { Component, OnInit} from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { HireAdvisorComponent } from '../../hire-advisor-modal/hire-advisor-modal.component';
import { s3Details } from '../../../../config';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { ExecutorModalComponent } from './../../../executor-modal/executor-modal.component';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-customer-hired-advisors',
  templateUrl: './customer-hired-advisors.component.html',
  styleUrls: ['./customer-hired-advisors.component.scss'],
  animations: [egretAnimations]
})
export class CustomerHiredAdvisorComponent implements OnInit {
  allPeoples: any[];
  advisorListing: any[];
  showAdvisorListing  : boolean = true;
  listingAsc  : boolean = true;
  showAdvisorListingCnt: any;
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
  abc: string;
  searchMessage:string = "";
  interval: any
  urlData:any={};
  constructor(
    private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, 
    private loader: AppLoaderService,private snack: MatSnackBar,private confirmService: AppConfirmService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    //this.getAdvisorList();
    this.getAdvisorList('All','-1');
    this.urlData = this.userapi.getURLData();
  }

  getAdvisorList = (search,sort) => {
    if(sort){
      localStorage.setItem("trustee_sort", sort);
    }
    let query = {};
    let req_vars = {};
    if(search=='All'){
      req_vars = {
        //query: Object.assign({ customerId: this.userId, status: "Active" }, query),//'Rejected',
        query: Object.assign({customerId:this.userId, status: { $nin:['Deleted', 'Rejected'] }}),
       fields: {},
       order: {"modifiedOn": sort},
     }
   }else{
      let custSearch = { $nin: ['Deleted', 'Rejected'] };
      if(search!=''){
        custSearch = search;
      }
      req_vars = {
       query: Object.assign({ customerId: this.userId, status: custSearch }, query),
      // query: Object.assign({customerId:this.userId, status: { $nin:['Deleted'] }}),
       fields: {},
       order: {"modifiedOn": sort},
     }
   }
   
   this.userapi.apiRequest('post', 'advisor/hireAdvisorListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(sort==1){
          this.listingAsc = false;
        }else{
          this.listingAsc = true;
        }
        this.advisorListing = result.data.advisorList;
        this.showAdvisorListingCnt = this.advisorListing.length;
        if (result.data.totalRecords>'0') {
          this.showAdvisorListing = true;
        }else{
          if(search !='' && search !='All' && result.data.totalRecords == 0){
            this.searchMessage = "No records found"
          }
          else {
            this.searchMessage = "Currently you do not have any advisor associated"
          } 
           this.showAdvisorListing = false;
          }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openHireAdvisorModal(id: any = {},update: any = {}, isNew?, hireFullName='') {
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

  getProfileImage(fileName) {
    if (fileName) {
      return profileFilePath + fileName;
    }
    else {
      return this.profilePicture;
    }
  }

  getAdvisorSpecilities(businessType){
    if(businessType)
      return businessType.join(", ")
    else
      return ""
  }

  removeTrusteeAdvisor(removeCustomerId){
    var statMsg = "Are you sure you want remove?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};          
          req_vars = {customerId:localStorage.getItem("endUserId"), advisorId:removeCustomerId, userType : 'advisor'}
          this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();
            this.getAdvisorList('All','-1');
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
      this.getAdvisorList('All', -1);
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
      this.getAdvisorList('All', -1);
      if (!res) {
        return;
      }
    })
}
//   markAsExecutor(type,docId,userid,firstName,lastName) {
//     let  advisorId = '';let trustId = '';
//     if(type === 'advisor'){
//       advisorId = userid;
//       }else{
//       trustId = userid;
//     }
//     var statMsg = "Are you sure you want mark as executor to '"+firstName+' '+lastName+"'?"
//     var userType = type
//     this.confirmService.confirm({ message: statMsg })
//       .subscribe(res => {
//         if (res) {
//           this.loader.open();
//           let req_vars = {};
//           if(userType == 'advisor'){
//             req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,advisorId:advisorId,userType : userType}
//           }else{   
//             req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,trustId:trustId,userType : userType}
//           }
//           this.userapi.apiRequest('post', 'executor/addAsExecutor', req_vars).subscribe(result => {
//             this.loader.close();
//             this.getAdvisorList('All', -1);
//             this.snack.open(result.data.message, 'OK', { duration: 4000 })
//           }, (err) => {
//             console.error(err)
//             this.loader.close();
//           })           
//         }
//       })    
//   }

//  removeAsExecutor(type,docId,userid,firstName,lastName) {
//     let  advisorId = '';let trustId = '';
//     if(type === 'advisor'){
//       advisorId = userid;
//       }else{
//       trustId = userid;
//     }
//     var statMsg = "Are you sure you want remove as executor to '"+firstName+' '+lastName+"'?"
//     var userType = type
//     this.confirmService.confirm({ message: statMsg })
//       .subscribe(res => {
//         if (res) {
//           this.loader.open();
//           let req_vars = {};
//           if(userType == 'advisor'){
//             req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,advisorId:advisorId,userType : userType}
//           }else{   
//             req_vars = {customerId:localStorage.getItem("endUserId"),docId:docId,trustId:trustId,userType : userType}
//           }
//           this.userapi.apiRequest('post', 'executor/removeAsExecutor', req_vars).subscribe(result => {
//             this.loader.close();
//             this.getAdvisorList('All', -1);
//             this.snack.open(result.data.message, 'OK', { duration: 4000 })
//           }, (err) => {
//             console.error(err)
//             this.loader.close();
//           })           
//         }
//       })    
//   }
}
