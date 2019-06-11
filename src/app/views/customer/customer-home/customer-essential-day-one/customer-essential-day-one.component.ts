import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { EssenioalIdBoxComponent } from '../essenioal-id-box/essenioal-id-box.component';
import { PersonalProfileModalComponent } from '../personal-profile-modal/personal-profile-modal.component';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';


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
  userId: string;
  essentialProfileList:any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getEssentialProfileList();
  }

  getEssentialProfileList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId }, query)
    }
    this.userapi.apiRequest('post', 'customer/essential-profile-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.essentialProfileList = result.data.essentialList
        if(this.essentialProfileList.length > 0){
          this.showProfileListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
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

}
