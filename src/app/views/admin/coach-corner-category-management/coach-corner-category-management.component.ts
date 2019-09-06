import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { CoachCornerPopupComponent } from './coach-corner-popup/coach-corner-popup.component';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'coach-corner-category-management',
  templateUrl: './coach-corner-category-management.component.html',
  styleUrls: ['./coach-corner-category-management.component.scss'],
})

export class CoachCornerCategoryManagementComponent implements OnInit {
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
      query: Object.assign({ userType: "sysadmin", "_id": { $ne: this.userId } }, query),
      fields: {},
      offset: '',
      limit: '',
      order: {"createdOn": -1},
    }
    this.api.apiRequest('post', 'coach-corner-category/list', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.items = [];
      }
      else {
        this.items = this.rows = this.temp = result.data.userList
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

    // console.log(columns);
    if (!columns.length)
      return;
    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });
    this.rows = rows;
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Add new category' : 'Update category';
    let dialogRef: MatDialogRef<any> = this.dialog.open(CoachCornerPopupComponent, {
      width: '720px',
      disableClose: true,
      data: { title: title, payload: data }
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
        this.loader.open();
        if (isNew) {
          this.addItem(res)
            .subscribe(data => {
              this.items = data;
              this.getLists()
              this.loader.close();
              this.snack.open('Admin Member Added!', 'OK', { duration: 4000 })
            })
        } else {
          this.updateItem(data._id, res)
            .subscribe(data => {
              this.items = data;
              this.getLists()
              this.loader.close();
              this.snack.open('Admin Member Updated!', 'OK', { duration: 4000 })
            })
        }
      })
  }
  
  updateStatus(row) {
    let i = this.items.indexOf(row);
    this.items.splice(i, 1);
    return of(this.items.slice()).pipe(delay(1000));
  }
  addItem(item): Observable<any> {
    item._id = Math.round(Math.random() * 10000000000).toString();
    this.items.unshift(item);
    return of(this.items.slice()).pipe(delay(1000));
  }
  updateItem(id, item) {
    this.items = this.items.map(i => {
      if (i._id === id) {
        return Object.assign({}, i, item);
      }
      return i;
    })
    return of(this.items.slice()).pipe(delay(1000));
  }
}