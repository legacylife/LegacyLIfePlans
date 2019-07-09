import { Component, OnInit} from '@angular/core';
import {  MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { s3Details } from '../../../../config';
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
  showAdvisorListing = false;
  showAdvisorListingCnt: any;
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
  abc: string;
  interval: any
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.allPeoples = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        totalFiles: '24 Files',
        totalFolders: '9 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        totalFiles: '4 Files',
        totalFolders: '1 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      }
    ];
    this.userId = localStorage.getItem("endUserId");
    this.getAdvisorList();
  }

  getAdvisorList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields:{},
      limit: 6,
      order:{"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'advisor/hireAdvisorListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.advisorListing = result.data.advisorList;        
        this.showAdvisorListingCnt = this.advisorListing.length;  
        if (this.showAdvisorListingCnt>0) {
          this.showAdvisorListing = true;
        }
      }
    }, (err) => {
      console.error(err);
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

}
