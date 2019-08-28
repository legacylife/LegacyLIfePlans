import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
  animations: egretAnimations
})
export class ActivityLogComponent implements OnInit {
  aceessSection : any
  allActivities: any
  rows:any
  temp:any
  my_messages:any

  constructor(private api: APIService, private route: ActivatedRoute, private router:Router) {
    this.getActivityLogs()
  }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('activitylog')
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };
  }

  async getActivityLogs() {
    let results = await this.api.apiRequest('post','activity/get-activity-logs',{}).toPromise()
    this.allActivities = this.rows = this.temp = results.data
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    if (!columns.length)
      return;

    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;
  }
}
