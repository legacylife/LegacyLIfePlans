import { Component, OnInit } from '@angular/core';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-our-plan',
  templateUrl: './our-plan.component.html',
  styleUrls: ['./our-plan.component.scss']
})
export class OurPlanComponent implements OnInit {
/**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""
  constructor( private userapi: UserAPIService, private loader: AppLoaderService ) { }

  ngOnInit() {
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/getproductdetails', {}).subscribe(result => {
      const plans = result.data.plans
      let returnArr = {}
      if( plans && result.status=="success" && plans.data.length>0 ) {
        plans.data.forEach( obj => {
          if( obj.id == 'A_MONTHLY' ) {
            this.productId =  obj.product
            this.planId = obj.id
            this.planInterval = obj.interval
            this.planAmount = ( obj.amount / 100 )
            this.planCurrency = (obj.currency).toLocaleUpperCase()
          }
        }) 
        this.loader.close();
      }
    },
    (err) => {
      this.loader.close();
    })
  }
}
