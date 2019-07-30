import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor() { }
  userId = localStorage.getItem("endUserId");
  userType = localStorage.getItem("endUserType");
  loginFlag:boolean = false;
  link:any;
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
    if(this.userId){
      this.loginFlag = false;
      this.link = '/'+this.userType+'/dashbaord';console.log('links=>',this.link);
    }else{
      this.loginFlag = true;
    }    
  }

}
