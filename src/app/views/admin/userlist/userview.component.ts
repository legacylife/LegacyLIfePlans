import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';

@Component({
  selector: 'userview',
  templateUrl: './userview.component.html'
})
export class userviewComponent implements OnInit {
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row : any;
  selectedUserId:string = "";
  adminSections = [];
  loggedInUserDetails : any;

 constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }   
  ngOnInit() {
    if(!this.api.isLoggedIn()){
      this.router.navigate(['/', 'llp-admin', 'signin'])
    }

	  const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections
    this.getUser()
  }

  //function to get all events
  getUser = (query = {}, search = false) => {
  
    const req_vars = {
      query: Object.assign({_id:this.selectedUserId}, query),
    }
 
    this.api.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if(result.status == "error"){
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
  

}