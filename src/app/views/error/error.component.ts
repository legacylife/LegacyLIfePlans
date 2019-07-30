import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor() { }
  userId = localStorage.getItem("endUserId");
  loginFlag:boolean = false;

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    if(this.userId){
      this.loginFlag = false;
    }else{
      this.loginFlag = true;
    }    
  }

}
