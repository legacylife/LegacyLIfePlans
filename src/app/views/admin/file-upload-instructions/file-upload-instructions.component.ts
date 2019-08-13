import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
@Component({
  selector: 'file-upload-instructions',
  templateUrl: './file-upload-instructions.component.html',
  styleUrls: ['./file-upload-instructions.component.scss'],
  animations: egretAnimations
})
export class fileUploadInstructionsListComponent implements OnInit {
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
  advisorlistdata = [];
  aceessSection : any;
  my_messages:any;
 constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }   
  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('cms')
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };

    this.getLists()
  }

  //function to get all cms pages
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ }, query),
      order: {"createdOn": -1},
    }
    
    this.api.apiRequest('post', 'cmsFolderInst/list', req_vars).subscribe(result => {
      if(result.status == "error"){
		  console.log(result.data)        
      } else {
		    this.advisorlistdata = this.rows = this.temp = result.data.cmsList			
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