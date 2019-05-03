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
  row = [];
  selectedUserId:string = ""
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
  }

  //function to get all events
  getUser = (query = {}, search = false) => {
  
    const req_vars = {
      query: Object.assign({_id:this.selectedUserId}, query),
    }
 
    this.api.apiRequest('post', 'userlist/view', req_vars).subscribe(result => {
      if(result.status == "error"){
		  console.log(result.data)        
      } else {
	 	 this.row = result.data		
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
	
	
  }

}