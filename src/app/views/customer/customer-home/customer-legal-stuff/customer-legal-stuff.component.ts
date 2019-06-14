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
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';

@Component({
  selector: 'app-customer-legal-stuff',
  templateUrl: './customer-legal-stuff.component.html',
  styleUrls: ['./customer-legal-stuff.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffComponent implements OnInit {
  showEstateListingCnt: any;
  showEstateListing = false;
  showaffairsListingCnt: any;
  showaffairsListing = false;
  showhealthcareListingCnt: any;
  showhealthcareListing = false;
  estateList: any = [];
  healthcareList: any = [];
  affairsList: any = [];
  legaStuffList: any = [];
  selectedProfileId:string = "";
  typeOfDocumentList: any[];

  userId: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.showEstateListingCnt = 0;    
    this.getEstateList();
  }



  getEstateList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }

    this.userapi.apiRequest('post', 'customer/legal-estate-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {

        this.legaStuffList = result.data.legalList;

        this.estateList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Estate'
        }).map(el => el)
        this.showEstateListingCnt = this.estateList.length
        if (this.showEstateListingCnt > 0) {
          this.showEstateListing = true;
        }

        this.healthcareList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Healthcare'
        }).map(el => el)
        this.showhealthcareListingCnt = this.healthcareList.length
        if (this.showhealthcareListingCnt > 0) {
          this.showhealthcareListing = true;
        }

        this.affairsList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Personal Affairs'
        }).map(el => el)
        this.showaffairsListingCnt = this.affairsList.length
        if (this.showaffairsListingCnt > 0) {
          this.showaffairsListing = true;
        }

      }
    }, (err) => {
      console.error(err);
    })
  }


  openLegalStuffModal(FolderName, isNew?) {

    let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent, {
      data: {
        FolderName: FolderName,
      },
      width: '720px',
      disableClose: true,
    });

    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEstateList();
      if (!res) {
        // If user press cancel
        return;
      }
    })

  }

  getType(key, folderName) {
    
        if (folderName) {
    
          if(folderName=='Estate'){
            this.typeOfDocumentList = EstateTypeOfDocument;
          }else if(folderName=='Healthcare'){
            this.typeOfDocumentList = HealthcareTypeOfDocument;
          }else if(folderName=='Personal Affairs'){
            this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
          }    
    
          let filteredTyes = this.typeOfDocumentList.filter(dtype => {
            return dtype.opt_code === key
          }).map(el => el.opt_name)[0]
          return filteredTyes
        }
    
      }

}
