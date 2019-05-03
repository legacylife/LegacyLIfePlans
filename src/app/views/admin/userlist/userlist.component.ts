import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { NgxTablePopupComponent } from './ngx-table-popup/ngx-table-popup.component';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
  animations: egretAnimations
})
export class userlistComponent implements OnInit {
  userId: string
  closeResult: string;
  showLoading: boolean
  successMessage: string = ""
  errorMessage: string = ""
  showOrgSugg: boolean = true
  checkedData: any = []
  userType: string = ""
  selectedUserId: string = "" 
  totalRecords: number = 0
  rows = [];
  columns = [];
  temp = [];
  public items: any[];
  //public getItemSub: Subscription;

 constructor(private api: APIService, private route: ActivatedRoute, private router:Router,  private dialog: MatDialog, private snack: MatSnackBar,  private confirmService: AppConfirmService, private loader: AppLoaderService) { }   
  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")
	
	if(!this.userId || !this.userType || this.userType!='AdminWeb'){
		 this.router.navigate(['/', 'admin', 'signin'])
	}	
    this.getLists()
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    this.showLoading = false
    const req_vars = {
      query: Object.assign({ userType: "AdminWeb" }, query),
	  fields: {},
      offset: '',
	  limit: '',
	  order: {},
    }
    this.api.apiRequest('post', 'userlist/list',req_vars).subscribe(result => {
      if(result.status == "error"){
		  this.items = [];
		  console.log(result.data)        
      } else {
		this.items = this.rows = this.temp = result.data.userList		
		//this.getItemSub = this.totalRecords = result.data.totalUsers
      }
    }, (err) => {
      console.error(err)
      this.showLoading = false
    })
  }

 //function to hide alerts
  hideAlert() {
    setTimeout(()=>{
      this.successMessage = ""
      this.errorMessage = ""
    },5000)
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
    const rows = this.temp.filter(function(d) {
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
        if(!res) {
          // If user press cancel
          return;
        }
        this.loader.open();
        if (isNew) {
          this.addItem(res)
            .subscribe(data => {
              this.items = data;
              this.loader.close();			  
              this.snack.open('Member Added!', 'OK', { duration: 4000 })
            })
        } else {
          this.updateItem(data._id, res)
            .subscribe(data => {
              this.items = data;
              this.loader.close();
              this.snack.open('Member Updated!', 'OK', { duration: 4000 })
            })
        }
      })
  }
  deleteItem(row) {
    this.confirmService.confirm({message: `Delete ${row.name}?`})
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.removeItem(row)
            .subscribe(data => {
              this.items = data;
              this.loader.close();
              this.snack.open('Member deleted!', 'OK', { duration: 4000 })
            })
        }
      })
  }

   
  addItem(item): Observable<any> {
    item._id = Math.round(Math.random() * 10000000000).toString();
    this.items.unshift(item);
    return of(this.items.slice()).pipe(delay(1000));
  }
  updateItem(id, item) {
    this.items = this.items.map(i => {
      if(i._id === id) {
        return Object.assign({}, i, item);
      }
      return i;
    })
    return of(this.items.slice()).pipe(delay(1000));
  }
  removeItem(row) {
    let i = this.items.indexOf(row);
    this.items.splice(i, 1);
    return of(this.items.slice()).pipe(delay(1000));
  }
}