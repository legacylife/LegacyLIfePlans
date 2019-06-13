import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { EssenioalIdBoxComponent } from '../essenioal-id-box/essenioal-id-box.component';
import { PersonalProfileModalComponent } from '../personal-profile-modal/personal-profile-modal.component';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { essentialsMyProfessionalsComponent } from './../../customer-home/essentials-my-professionals/essentials-my-professionals.component';
import { documentTypes } from '../../../../selectList';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-essential-day-one.component.html',
  styleUrls: ['./customer-essential-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerEssentialDayOneComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showProfileListing = false;
  showIdProofListing = false;
  showProfessionalsListing = false;
  userId: string;
  essentialProfileList:any = [];
  essentialIDList:any = [];
  essentialProfessionalList:any = [];
  showProfessionalCnt:any;
  showProfileListingCnt:any;
  showIDListingCnt:any;
  documentTypeList: any[] = documentTypes;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.showProfileListingCnt = 0;
    this.showIDListingCnt = 0;
    this.getEssentialProfileList();
    this.getEssentialIdList();
    this.getEssentialProfessionalList();
  }

  getEssentialProfileList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query)
    }   
    this.userapi.apiRequest('post', 'customer/essential-profile-list', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.essentialProfileList = result.data.essentialList;        
        if(result.data.totalRecords > 0){
          this.showProfileListingCnt = result.data.totalRecords;
          this.showProfileListing = true;
        }        
      }
    }, (err) => {
      console.error(err);
    })
  }
  
  getEssentialIdList = (query = {}, search = false) => { 
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query)
    }
    this.userapi.apiRequest('post', 'customer/essential-id-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.essentialIDList = result.data.essentialIDList;        
        if(result.data.totalIDRecords > 0){         
          this.showIDListingCnt = result.data.totalIDRecords;
          this.showIdProofListing = true;
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  getEssentialProfessionalList = (query = {}, search = false) => { 
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query)
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/essential-professional-list', req_vars).subscribe(result => {
    
    if (result.status == "error") {
      console.log(result.data)
    } else {
      this.essentialProfessionalList = result.data.essentialProfessionalList;
      if(result.data.totalProfessionalRecords > 0){         
        this.showProfessionalCnt = result.data.totalProfessionalRecords;
        this.showProfessionalsListing = true;
      }       
    }
    this.loader.close();
  }, (err) => {
    console.error(err);
  })
}

  openAddIdBoxModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(EssenioalIdBoxComponent, {
      width: '720px',
      disableClose: true,
    })
  }
  openProfileModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(PersonalProfileModalComponent, {
      width: '720px',
      disableClose: true,
    })
  }
  openProfessionalBoxModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add professionals' : 'Update professionals';
    let dialogRef: MatDialogRef<any> = this.dialog.open(essentialsMyProfessionalsComponent, {
      width: '720px',
      disableClose: true,
    })
  }

  getDocType(key){
    let filteredTyes =this.documentTypeList.filter(dtype =>{
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
  }

}
