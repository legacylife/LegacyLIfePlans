import { Component, OnInit } from '@angular/core';
import { UserAPIService } from 'app/userapi.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-refer-and-earn',
  templateUrl: './refer-and-earn.component.html',
  styleUrls: ['./refer-and-earn.component.scss']
})
export class ReferAndEarnComponent implements OnInit {
  userId = "";
  description: any;
  constructor(private userapi: UserAPIService, private router: Router) {
  }

  ngOnInit() {
      this.getView();
  }

  getView = (query = {}, search = false) => { 
    let req_vars = {
      query: Object.assign({ aliasName:"edit-refer-earn-settings"})
    }
    this.userapi.apiRequest('post', 'referearnsettings/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data.description){
          this.description = result.data.description;
        }       
      }
    }, (err) => {
      console.error(err);
    })
  } 

  referAndEarnParticipate(){
    let req_vars = {
      'userId': localStorage.getItem("endUserId")
    }
    this.userapi.apiRequest('post', 'customer/refer-and-earn-participate', req_vars).subscribe(result => {
      this.router.navigate(['/', 'advisor', 'dashboard'])
    })
  }
}
