import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.css']
})
export class AddManagementComponent implements OnInit {
  aceessSection : any;
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('addmanagement')
  }

}
