/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Post Management Component
 * @description: Component for execute the all user operations on coach corner post management
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CoachCornerPopupComponent } from './coach-corner-listing-popup/coach-corner-listing-popup.component';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'coach-corner-listing-management',
  templateUrl: './coach-corner-listing-management.component.html',
  styleUrls: ['./coach-corner-listing-management.component.scss'],
  animations: egretAnimations
})

export class CoachCornerListingManagementComponent implements OnInit {
  userId: string
  closeResult: string;
  showOrgSugg: boolean = true
  checkedData: any = []
  userType: string = ""
  selectedUserId: string = ""
  totalRecords: number = 0
  rows = [];
  columns = [];
  temp = [];
  loggedInUserDetails: any;
  aceessSection: any;
  public items: any[];
  my_messages:any;
  //public getItemSub: Subscription;

  constructor(
    private api: APIService, private route: ActivatedRoute, 
    private router: Router, private dialog: MatDialog, 
    private snack: MatSnackBar, private confirmService: AppConfirmService, 
    private loader: AppLoaderService) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('adminmanagement');
    this.userId = this.api.getUser();
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };
    this.getLists()
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: {},
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }
    this.api.apiRequest('post', 'coach-corner-post/list', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.items = [];
      }
      else {
        this.items = this.rows = this.temp = result.data.postList
      }
    }, (err) => {
      console.error(err)
    })
  }

  //table
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);
    if (!columns.length)
      return;
    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });
    this.rows = rows;
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Add Post' : 'Update Post';
    let dialogRef: MatDialogRef<any> = this.dialog.open(CoachCornerPopupComponent, {
      width: '1280px',
      disableClose: true,
      data: { title: title, payload: data }
    })
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      else{
        this.snack.open(res, 'OK', { duration: 4000 })
      }
      this.getLists()
    })
  }

  openDeletePopUp(data) {
    this.confirmService.confirm({ message: 'Are you sure you want to delete this post' }).subscribe(res => {
      if (res) {
        this.loader.open();
        var query = {};
        const req_vars = {
          query: Object.assign({ _id: data._id}, query),
          fromId:localStorage.getItem('userId')
        }
        this.api.apiRequest('post', 'coach-corner-post/delete', req_vars).subscribe(result => {
          if (result.status == "error") {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.getLists()
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          console.error(err)
          this.loader.close();
        })
      }
    })
  }
}