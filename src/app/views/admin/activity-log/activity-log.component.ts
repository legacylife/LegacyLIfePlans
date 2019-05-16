import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  aceessSection : any

  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('activitylog')
  }

}
