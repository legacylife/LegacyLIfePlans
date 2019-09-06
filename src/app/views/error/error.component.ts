import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute) { }
  userId = localStorage.getItem("endUserId");
  userType = localStorage.getItem("endUserType");
  loginFlag:boolean = false;
  link:any;
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
    if(this.userId){
      this.loginFlag = false;
      console.log('type',this.userType,'id',this.userId);
      if(this.userType=='sysadmin'){//this.userType!='undefined' && this.userType!='customer' && this.userType!='advisor' && 
        this.router.navigate(['/', 'admin', 'dashboard'])
      }
    //  this.link = '/'+this.userType+'/dashbaord';console.log('links=>',this.link);
    }else{
      this.loginFlag = true;
    }    
  }

}
