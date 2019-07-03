import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';

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
  constructor(private userapi: UserAPIService
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
    this.getTrusteeList();
  }

  getTrusteeList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'trustee/trustListing', req_vars).subscribe(result => {
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


}
