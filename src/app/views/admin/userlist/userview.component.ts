import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

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
  //public getItemSub: Subscription;

 constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }   
  ngOnInit() {
    if(!this.api.isLoggedIn()){
      this.router.navigate(['/', 'llp-admin', 'signin'])
    }

    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")   

	  const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.getUser()

    this.adminSections = [{
      name: 'User Management',
      status: 0
    }, {
      name: 'Advisor Management',
      status: 0
    }, {
      name: 'Activity Log',
      status: 1
    }, {
      name: 'Zip Code map',
      status: 1
    }, {
      name: 'CMS pages',
      status: 1
    },{
      name: 'Referral program',
      status: 0
    }, {
      name: 'Advertisement management',
      status: 1
    }, {
      name: 'Deceased requests',
      status: 1
    }, {
      name: 'Admin Management',
      status: 1
    }]
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