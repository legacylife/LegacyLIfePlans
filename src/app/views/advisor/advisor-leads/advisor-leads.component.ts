import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-advisor-leads',
  templateUrl: './advisor-leads.component.html',
  styleUrls: ['./advisor-leads.component.scss']
})
export class AdvisorLeadsComponent implements OnInit {
  leadsListings: any[];
  showLeadsListing = true;
  showLeadsListingCnt: any;  
  userId: string;
  ProfilePic: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService,
    private snack: MatSnackBar
  ) { }


  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getLeadsLists();
  }

  //function to get all events
  getLeadsLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ advisorId: this.userId, status: "Active" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "createdOn": -1 },
    }
    this.userapi.apiRequest('post', 'lead/listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.leadsListings =  result.data.leadList;
        console.log("Here ",this.leadsListings)
        this.showLeadsListingCnt = this.leadsListings.length;  
        if (this.showLeadsListingCnt>0) {
          this.showLeadsListing = true;
        }
        else {
          this.showLeadsListing = false;
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

}
