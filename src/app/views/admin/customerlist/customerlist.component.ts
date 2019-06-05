import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import "./customerlist.component.css";

@Component({
  selector: 'customerlist',
  templateUrl: './customerlist.component.html',
  styleUrls: ['./customerlist.component.css'],
  animations: egretAnimations
})
export class customerlistComponent implements OnInit {
  userId: string;
  closeResult: string;
  userType: string = ""
  showOrgSugg: boolean = true
  public rows: any[];
  temp = [];
  aceessSection: any;
  my_messages:any;
  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('cms')
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };
  
    this.getLists();
    //this.loader.open();
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ userType: "customer" }, query),
      order: {"createdOn": -1},
    }
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.rows = this.temp = result.data.userList
      }
    }, (err) => {
      console.error(err)
    })
  }
  statusChange(row) {
    var statMsg = "Are you sure you want to re-activate this user, "+row.username+" Access to the website account for the customer, trustees and advisors will be re-opened as per the subscription status of this customer."
    if(row.status == 'Active'){
	 statMsg = "Are you sure you want to deactivate this user, "+row.username+" Access to the website account will be locked for the customer, trustees and advisors. This does not affect the data uploaded by the customer."
	}
     this.confirmService.confirm({message: statMsg})
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