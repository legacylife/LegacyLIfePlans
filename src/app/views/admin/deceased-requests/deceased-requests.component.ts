import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'deceased-requests',
  templateUrl: './deceased-requests.component.html',
  styleUrls: ['./deceased-requests.component.css']
})
export class DeceasedRequestsComponent implements OnInit {
  aceessSection : any
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    if(!this.api.isLoggedIn()){
      this.router.navigate(['/', 'llp-admin', 'signin'])
    } 
    this.aceessSection = this.api.getUserAccess('deceasedrequest')
  }

}
