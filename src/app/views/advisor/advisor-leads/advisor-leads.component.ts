import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import  * as moment  from 'moment'
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-advisor-leads',
  templateUrl: './advisor-leads.component.html',
  styleUrls: ['./advisor-leads.component.scss']
})
export class AdvisorLeadsComponent implements OnInit {
  leadsListings: any = [];
  showLeadsListing = true;
  showLeadsListingCnt: any;  
  userId: string;
  ProfilePic: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";

  searchKey = 'All'
  nextOffset = 0;
  resultLimit = 12;
  
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

  filterResult( filterVal ) {
    this.searchKey = filterVal
    this.nextOffset = 0
    this.resultLimit = 12
    this.leadsListings = []
    this.getLeadsLists( {}, this.searchKey, (this.nextOffset*this.resultLimit), this.resultLimit)
  }

  //function to get all events
  getLeadsLists = (query = {}, search = this.searchKey, offset = this.nextOffset, limit= this.resultLimit) => {
    /**
     * Get leads based on filter
     */
    if( search !='All') {
      let startOfMonth, endOfMonth
      if( search == 'day') {
        startOfMonth = moment().startOf('day').format('YYYY-MM-DD HH:mm');
        endOfMonth   = moment().endOf('day').format('YYYY-MM-DD HH:mm');
      }
      else if( search == 'week' ) {
        startOfMonth = moment().startOf('week').format('YYYY-MM-DD HH:mm');
        endOfMonth   = moment().endOf('week').format('YYYY-MM-DD HH:mm');
      }
      else{
        startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm');
        endOfMonth   = moment().endOf('month').format('YYYY-MM-DD HH:mm');
      }
      
      query = Object.assign( {createdOn: { $gte: new Date(startOfMonth) , $lte: new Date(endOfMonth) } })
    }
    console.log("queryqueryquery",query,"offsetoffset",offset,"limitlimit",limit)
    const req_vars = {
      query: Object.assign({ advisorId: this.userId, status: "Active" }, query),
      fields: {},
      offset: offset,
      limit: limit,
      order: { "createdOn": -1 },
    }
    this.userapi.apiRequest('post', 'lead/listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        //console.log(result.data)
      } else {
        if(this.leadsListings.length>0) {
          this.leadsListings =  this.leadsListings.concat(result.data.leadList);
        }
        else{
          this.leadsListings =  result.data.leadList;
        }
        
        //console.log("Here ",this.leadsListings)
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

  onScrollDown (ev) {
    this.nextOffset++;
    this.getLeadsLists( {}, this.searchKey, (this.nextOffset*this.resultLimit) , this.resultLimit)
  }

  onScrollUp(ev) {
  }
}
