import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserAPIService } from "app/userapi.service";
import { s3Details } from "app/config";
import { AppConfirmService } from "app/shared/services/app-confirm/app-confirm.service";
import { MatDialog, MatSnackBar } from "@angular/material";
import { AppLoaderService } from "app/shared/services/app-loader/app-loader.service";

@Component({
  selector: "advisor-legacy-details",
  templateUrl: "./advisor-legacy-details.component.html",
  styleUrls: ["./advisor-legacy-details.component.scss"]
})
export class AdvisorLegacyDetailsComponent implements OnInit {
  userId: string;
  urlData:any={};  
  customerData:any=[];
  userAs:string='Trustee';
  profilePicture: any = "assets/images/arkenea/default.jpg"
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private confirmService: AppConfirmService,
    private userapi: UserAPIService, 
    private loader: AppLoaderService, 
    private snack: MatSnackBar    
  ) {

  }

  ngOnInit() {
    this.urlData = this.userapi.getURLData();
    if (this.urlData.lastThird == "legacies") {
      if(this.urlData.userType == "advisor"){
        this.userAs = 'Advisor'; 
      }
      this.getCustomerDetails();
    }
  }
  
  getCustomerDetails(query = {}){
    const req_vars = {
      query: Object.assign({ _id: this.urlData.lastOne }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.customerData = result.data;
        if(this.customerData.profilePicture){
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.customerData.profilePicture;
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  remove() {
    var statMsg = "Are you sure you want remove?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};          
          if(this.urlData.userType == 'advisor'){
            req_vars = {
              query: Object.assign({customerId:this.urlData.lastOne, advisorId:localStorage.getItem("endUserId"), userType : this.urlData.userType})
            }
          }else{
            req_vars = {
              query: Object.assign({customerId:this.urlData.lastOne, trusteeId:localStorage.getItem("endUserId"), userType : this.urlData.userType})
            }
          }
          this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();            
            if(this.urlData.userType == 'advisor'){
              this.router.navigate(['/', 'advisor', 'shared-legacies'])
            }else{
              this.router.navigate(['/', 'customer','dashboard', 'shared-legacies'])
            }
            this.snack.open(result.data.message, 'OK', { duration: 4000 })            
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }        
      })
  }
}