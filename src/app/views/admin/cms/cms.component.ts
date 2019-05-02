import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
@Component({
  selector: 'cms',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.scss'],
})
export class cmslistComponent implements OnInit {
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
  advisorlistdata = [];
    
 constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }   
  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")
    this.getLists()
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    this.showLoading = false
    const req_vars = {
      query: Object.assign({ userType: "TeamMember" }, query),
	  fields: {},
      offset: '',
	  limit: '',
	  order: {},
    }
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      if(result.status == "error"){
		  console.log(result.data)        
      } else {
		this.advisorlistdata = this.rows = this.temp = result.data.userList		
		this.columns = this.getDataConf();
       	this.totalRecords = result.data.totalUsers
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