import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { SendAnEmailComponent } from './send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from '../hire-advisor-modal/hire-advisor-modal.component';
//import { ProfilePicService } from 'app/shared/services/profile-pic.service';private picService: ProfilePicService,
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'app-customer-professionals',
  templateUrl: './customer-professionals.component.html',
  styleUrls: ['./customer-professionals.component.scss']
})
export class CustomerProfessionalComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profilePicture: any = "assets/images/arkenea/default.jpg"  
  selectedProfileId:string;
  row: any;
  constructor(
    private route: ActivatedRoute,private userapi: UserAPIService, 
    private router: Router, private dialog: MatDialog, 
  ) { }

  ngOnInit() {
    // this.picService.itemValue.subscribe((nextValue) => {
    //   this.profilePicture =  nextValue
    // })
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getAdvisorView();
  }

  getAdvisorView = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }

    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;
        console.log("pic",result.data.profilePicture)
        if(result.data.profilePicture){
          this.profilePicture = filePath + result.data.profilePicture;
        }        
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
  }


  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  openSendEmailModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SendAnEmailComponent, {
      width: '720px',
      disableClose: true,
    })
  }

  openHireAdvisorModal(id: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
      },
    })
  }
}
