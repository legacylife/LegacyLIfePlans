import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'referral-program',
  templateUrl: './referral-program.component.html',
  styleUrls: ['./referral-program.component.css']
})
export class ReferralProgramComponent implements OnInit {
  aceessSection : any;
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('referral')
  }

}
