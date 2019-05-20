import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'userview',
  templateUrl: './userview.component.html'
})
export class userviewComponent implements OnInit {
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row: any;
  selectedUserId: string = "";
  adminSections = [];
  loggedInUserDetails: any;
  statMsg = "";

  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService) { }
  ngOnInit() {
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections
    this.getUser()
  }

  //function to get all events
  getUser = (query = {}, search = false) => {

    const req_vars = {
      query: Object.assign({ _id: this.selectedUserId }, query),
    }

    this.api.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        console.log(this.row)
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })


  }

  statusChange(row) {
    this.statMsg = "Are you sure you want to activate this user, " + row.username + " Access to the website account for the customers and trustees will be opened as per the subscription status of this advisor."
    this.confirmService.confirm({ message: this.statMsg })
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
              this.getUser()
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