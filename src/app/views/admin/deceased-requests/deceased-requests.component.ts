import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { SubscriptionService } from 'app/shared/services/subscription.service';

@Component({
  selector: 'deceased-requests',
  templateUrl: './deceased-requests.component.html',
  styleUrls: ['./deceased-requests.component.scss'],
  animations: egretAnimations
})
export class DeceasedRequestsComponent implements OnInit {
  aceessSection : any
  data : any;
  temp = [];
  my_messages:any;
  constructor(private api: APIService, private route: ActivatedRoute, private router:Router, private snack: MatSnackBar,
     private confirmService: AppConfirmService,private loader: AppLoaderService, private subscriptionservice:SubscriptionService) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('deceasedrequest')
      if (this.aceessSection) {
        this.my_messages = {
          'emptyMessage': 'No records Found'
        };
        this.getDeceasedList();
      }
  }

  getDeceasedList = (query = {}, search = false) => { 
    let req_vars = {
      query: Object.assign({ status:{$ne : "Pending"} }),
      order: { "modifiedOn": -1 },
    }    
     this.loader.open(); 
    this.api.apiRequest('post', 'deceased/deceaseList', req_vars).subscribe(result => {
    this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        var tempData = [];
        if (result.data.deceasedData) {
          result.data.deceasedData.forEach(element => {
              tempData.push({
                firstName :  element.customerId.firstName,
                lastName :  element.customerId.lastName,
                username:  element.customerId.username,
                modifiedOn:  element.modifiedOn,
                status: ( (element.customerId.deceased && element.customerId.deceased.status) =='Active' ? 'Deceased' :  element.customerId.deceased.status ),
                _id:  element._id
              });
          });
          this.data = this.temp = tempData;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }  

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]); 
    if(this.temp[0].customerId){
       columns = Object.keys(this.temp[0].customerId);  
    }
    columns.splice(columns.length - 1);
    if (!columns.length){
      return;
    }
    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
            return true;
        }
      }
    });
    this.data = rows;
  }

}
