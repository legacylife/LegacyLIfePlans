import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";


@Component({
  selector: 'customerlist',
  templateUrl: './customerlist.component.html',
  styleUrls: ['./customerlist.component.scss'],
  animations: egretAnimations
})
export class customerlistComponent implements OnInit {
  userId: string;
  closeResult: string;
  userType: string = ""
  totalRecords: number = 0
  showOrgSugg: boolean = true  
  rows = [];
  columns = [];
  temp = [];  
  
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router,  private snack: MatSnackBar,  private confirmService: AppConfirmService, private loader: AppLoaderService) { }   
  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")
	if(!this.userId || !this.userType || this.userType!='AdminWeb'){
		 this.router.navigate(['/', 'admin', 'signin'])
	}else{	
     this.getLists();
	 //this.loader.open();
	}
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ userType: "TeamMember" }, query)
    }
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
	  this.loader.close();
      if(result.status == "error"){
	  this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
		this.rows = this.temp = result.data.userList		
		this.columns = this.getDataConf();
       	this.totalRecords = result.data.totalUsers       	
      }
    }, (err) => {
      console.error(err)
    })
  }
  statusChange(row) {  
    this.confirmService.confirm({message: `Do you want to update status for "${row.username}?"`})
      .subscribe(res => {
        if (res) {
          this.loader.open();
		  var query = {};
		  const req_vars = {
			  query: Object.assign({_id:row._id}, query)
			}
			this.api.apiRequest('post', 'userlist/updatestatus',req_vars).subscribe(result => {
			  if(result.status == "error"){
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
  
    //function to hide alerts
  hideAlert() {
    setTimeout(()=>{

    },5000)
  }
  
  
 getDataConf(){
    return [     
      {
        prop: 'fullName',
        name: 'Name'
      },
      {
        prop: 'username',
        name: 'Email'
      },
      {
        prop: 'userType',
        name: 'Type'
      },
      {
        prop: 'status',
        name: 'Status'
      },
      {
        prop: 'lastLoggedInOn',
        name: 'Last Login date'
      }
    ];
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
  
}