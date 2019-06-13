import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { legalStuffModalComponent } from '../legal-stuff-modal/legal-stuff-modal.component';

@Component({
  selector: 'app-customer-legal-stuff',
  templateUrl: './customer-legal-stuff.component.html',
  styleUrls: ['./customer-legal-stuff.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffComponent implements OnInit {
  showEstateListingCnt:any;
  showEstateListing = false;
  estateList:any = [];

  showhealthcareListingCnt:any;
  showhealthcareListing= false;
  healthcareList:any = [];
  
  userId: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.showEstateListingCnt = 0;
    this.getEstateList('Estate');
    this.getEstateList('Healthcare');
  }



  getEstateList = (FolderName,query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId,subFolderName:FolderName, status:"Active" }, query)
    }
    this.userapi.apiRequest('post', 'customer/legal-estate-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {

       if(FolderName=='Estate') {
          this.estateList = result.data.legalList;      
          if(result.data.totalRecords > 0){
            this.showEstateListingCnt = result.data.totalRecords;
            this.showEstateListing = true;
          }     
       } else if(FolderName=='Healthcare') {
        this.healthcareList = result.data.legalList;      
        if(result.data.totalRecords > 0){
          this.showhealthcareListingCnt = result.data.totalRecords;
          this.showhealthcareListing = true;
        }     
     }
        
        
        
      }
    }, (err) => {
      console.error(err);
    })
  }


  openLegalStuffModal(FolderName, isNew?) {

    // let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent,{
    //   width: '720px',
    //   disableClose: true
    // })

    this.dialog.open(legalStuffModalComponent, {
      data: {
        FolderName: FolderName,       
      },
      width: '720px',
      disableClose: true,
    });

  }

}
