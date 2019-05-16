import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";


@Component({
  selector: 'email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],
  animations: egretAnimations
})
export class EmailTemplateComponent implements OnInit {
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
    
 constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }   
  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")

    this.getLists()
  }

  //function to get all email template List pages
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ }, query)	  
    }
    this.api.apiRequest('post', 'emailtemp/list', req_vars).subscribe(result => {
      if(result.status == "error"){
		  console.log(result.data)        
      } else {
		  this.rows = this.temp = result.data.templateList			
      }
    }, (err) => {
      console.error(err)      
    })
  }

  
  
//table
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    columns.splice(columns.length - 1);

    if (!columns.length)
      return;
    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });
    this.rows = rows;
  }


}