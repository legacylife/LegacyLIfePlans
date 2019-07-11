import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { PetsModalComponent } from './../pets-modal/pets-modal.component';
import { s3Details } from '../../../../../config';
const filePath = s3Details.url+'/'+s3Details.petsFilePath;
@Component({
  selector: 'app-customer-home',
  templateUrl: './pets-details.component.html',
  styleUrls: ['./pets-details.component.scss'],
  animations: [egretAnimations]
})
export class PetsDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  userType:string;
  selectedProfileId: string = "";
  selectedLegaciesURL:string= "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  docPath: string; 
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    this.docPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getPetsView();
    if (localStorage.getItem("endUserType") == "customer") {
      this.userType = "customer";
    } else {
      this.userType = "advisor";
    }
    this.selectedLegaciesURL = locationArray[locationArray.length - 3];
  }

  //function to get all events
  getPetsView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'pets/view-pets-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          this.row = result.data;        
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openPetsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(PetsModalComponent, {     
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getPetsView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deletePets(customerId='') {
    var redirectModule = ''
    if(this.userType == 'advisor'){
      redirectModule = customerId
    }
    var statMsg = "Are you sure you want to delete pet details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'pets/delete-pets', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', this.userType , this.selectedLegaciesURL,  'pets', redirectModule])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

}
