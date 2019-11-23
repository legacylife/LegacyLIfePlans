import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss'],
  animations: egretAnimations
})
export class AddManagementComponent implements OnInit {
  aceessSection : any;
  rows : any;
  userId : string;
  zipcodeList : any;
  my_messages : any;
  userType : string;
  columns = [];
  temp = [];
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }
ngOnInit() {
    this.aceessSection = this.api.getUserAccess('addmanagement');
    this.userId = localStorage.getItem("userId");
    this.userType = localStorage.getItem("userType");
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };
    this.enquiryList();    
}

enquiryList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ }, query),
      order: {"createdOn": -1}	  
    }
    this.api.apiRequest('post', 'advertisement/enquiryList', req_vars).subscribe(result => {
      if(result.status == "error"){
		  console.log(result.data)        
      } else {
      this.rows = result.data.advertisementList;
      this.temp = result.data.advertisementList;
      }
    }, (err) => {
      console.error(err)      
    })
}

getzipcodes(stringVal){
  return stringVal.replace(/,/g,', ');     
}

manageSponsored(status,id) {
    const query = {};const proquery = {};
    const req_vars = {
      query: Object.assign({_id:id}, query),
      proquery: Object.assign({status:status}, proquery)
    }

    if(status=='remove'){ 
    }

    this.api.apiRequest('post', 'advertisement/manage-sponsored-status', req_vars).subscribe(result => {
      if(result.status == "error"){
        console.log(result.data)        
      } else {
        console.log('status',result.data);
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
