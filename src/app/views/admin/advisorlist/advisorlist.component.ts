import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";

@Component({
  selector: 'advisorlist',
  templateUrl: './advisorlist.component.html',
  styleUrls: ['./advisorlist.component.scss'],
  animations: egretAnimations

})
export class advisorlistComponent implements OnInit {
  userId: string
  userType: string = ""
  rows = [];
  columns = [];
  temp = [];
  advisorlistdata = [];
  aceessSection: any

  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService) { }
  ngOnInit() {
    if (!this.api.isLoggedIn()) {
      this.router.navigate(['/', 'llp-admin', 'signin'])
    }
    this.aceessSection = this.api.getUserAccess('advisormanagement')
    this.getLists()
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ userType: "advisor" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: {},
    }
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.advisorlistdata = this.rows = this.temp = result.data.userList
      }
    }, (err) => {
      console.error(err)
    })
  }
  statusChange(row) {
    var stat = 'activate';
    if (row.status == 'Active')
      stat = 'deactivate';

    this.confirmService.confirm({ message: `Are you sure you want to ${stat}? this account?` })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: row._id }, query)
          }
          this.api.apiRequest('post', 'userlist/updatestatus', req_vars).subscribe(result => {
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


}