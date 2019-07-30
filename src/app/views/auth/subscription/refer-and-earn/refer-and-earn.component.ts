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
  constructor(private userapi: UserAPIService, private router: Router) {
  }

  ngOnInit() {
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
