import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { s3Details } from '../../../../config';
import { HireAdvisorComponent } from '../../hire-advisor-modal/hire-advisor-modal.component';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;
@Component({
  selector: 'app-prof-advisor-listing',
  templateUrl: './prof-advisor-listing.component.html',
  styleUrls: ['./prof-advisor-listing.component.scss'],
  animations: [egretAnimations]
})
export class ProfAdvisorListingComponent implements OnInit {
  adListings: any[];
  qualityAdvisor: any[];
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getAdvisorLists();    
  }

  getProfileImage(fileName) {
    if (fileName) {
      return profileFilePath + fileName;
    }
    else {
      return this.profilePicture;
    }
  }

  //function to send contact details of advisor
  sendContactDetails = (advisorDetails, query = {}) => {
    let search = false;
    const req_vars = {
      query: Object.assign({ _id: this.userId }, query),
      advisorDetails: {
        "advisorFullname": advisorDetails.firstName + ' ' + advisorDetails.lastName,
        "advisorEmail": advisorDetails.username,
        "advisorPhone": advisorDetails.businessPhoneNumber,
        "advisorAddress": advisorDetails.addressLine1 + ' ' + advisorDetails.city + ' ' + advisorDetails.state + ' ' + advisorDetails.zipcode,
        "advisorId": advisorDetails._id
      }
    }
    this.userapi.apiRequest('post', 'advisor/contactadvisor', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.status == "error") {
          this.loader.close();
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
          this.loader.close();
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  //function to get all events
  getAdvisorLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ userType: "advisor", status: "Active" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "createdOn": -1 },
    }
    this.userapi.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        let advisorData = result.data.userList;
        this.adListings = advisorData.filter(dtype => {
          return dtype.sponsoredAdvisor == 'yes'
        }).map(el => el)

        this.qualityAdvisor = advisorData.filter(dtype => {
          return dtype.sponsoredAdvisor == 'no'
        }).map(el => el)
      }
    }, (err) => {
      console.error(err)
    })
  }

  // hireAdvisor(ids) {
  //   let hirestatus = 'pending';

  //   let query = {};
  //   let proquery = { status: hirestatus, customerId: this.userId, advisorId: ids };

  //   const req_vars = {
  //     query: Object.assign({ customerId: this.userId, advisorId: ids }),
  //     proquery: Object.assign(proquery),
  //     from: Object.assign({ logId: "" })
  //   }
  //   this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
  //     if (result.status == "error") {
  //       this.loader.close();
  //       this.snack.open(result.data.message, 'OK', { duration: 4000 })
  //     } else {
  //       this.loader.close();
  //       this.snack.open(result.data.message, 'OK', { duration: 4000 })
  //     }
  //   }, (err) => {
  //     console.error(err)
  //     this.loader.close();
  //   })
  // }

  openHireAdvisorModal(id: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
      },
    })
  }



}
