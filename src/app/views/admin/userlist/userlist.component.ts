import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { NgxTablePopupComponent } from './ngx-table-popup/ngx-table-popup.component';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
  animations: egretAnimations
})
export class userlistComponent implements OnInit {
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
  processing: boolean = false
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
    this.loader.open();
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.items = [];
        console.log(result.data)
      } else {
        this.items = this.rows = this.temp = result.data.userList;
        this.processing = true;

        //this.getItemSub = this.totalRecords = result.data.totalUsers
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
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(NgxTablePopupComponent, {
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
       //8 this.loader.open();
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
  statusChange(row) {
    var statMsg = 'Are you sure you want to re-activate this user, ' + row.username + ' Access to the admin panel account for the user.'
    if (row.status == 'Active') {
      statMsg = 'Are you sure you want to deactivate this user, ' + row.username + ' Access to the admin panel account will be locked for the user.'
    }

    this.confirmService.confirm({ message: statMsg }).subscribe(res => {
   
      if (res) {
        this.loader.open();
        var query = {};
        const req_vars = {
          query: Object.assign({ _id: row._id, userType: "sysadmin" }, query),
          fromId:localStorage.getItem('userId')
        }
        this.api.apiRequest('post', 'userlist/updatestatus', req_vars).subscribe(result => {
          this.loader.close();
          if (result.status == "error") {
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.getLists()         
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          this.loader.close();
          console.error(err)
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