import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { LettersMessagesModelComponent } from '../letters-messages-model/letters-messages-model.component';

@Component({
  selector: 'app-letters-messages-listing',
  templateUrl: './letters-messages-listing.component.html',
  styleUrls: ['./letters-messages-listing.component.scss']
})
export class LettersMessagesListingComponent implements OnInit {
  userId: string;
  showListing = false;
  lettersMessagesList: any = [];
  selectedProfileId:string = "";
  showListingCnt: any;
  dynamicRoute:string;
trusteeLegaciesAction:boolean=true;
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) {  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getLetterMessageList();
    let urlData = this.userapi.getURLData();
    this.dynamicRoute = urlData.dynamicRoute;
    this.trusteeLegaciesAction = urlData.trusteeLegaciesAction
  }

  getLetterMessageList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'lettersMessages/letters-message-listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.lettersMessagesList = result.data.lettersMessagesList;
        this.showListingCnt = this.lettersMessagesList.length;  
        if (this.showListingCnt>0) {
          this.showListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }
  
  openLettersMessagesModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(LettersMessagesModelComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getLetterMessageList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
 
}
