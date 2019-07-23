import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { SendAnEmailComponent } from './send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from '../hire-advisor-modal/hire-advisor-modal.component';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'app-customer-professionals',
  templateUrl: './customer-professionals.component.html',
  styleUrls: ['./customer-professionals.component.scss'],
  animations: [egretAnimations]
})
export class CustomerProfessionalComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profilePicture: any = "assets/images/arkenea/default.jpg"  
  selectedProfileId:string;
  row: any;
  profileData: any;
  about: string;
  userId : string;
  constructor(
    private route: ActivatedRoute,private userapi: UserAPIService, 
    private router: Router, private dialog: MatDialog, 
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");

    // this.profileData = {
    //   proName: 'Mary, Jason & Hodge of Attorney',
    //   proDomain: 'www.mjhattorenys.com',
    //   proJob: 'Attorney, Insurance Agent',
    //   proExp: '12 years',
    //   proPhone: '+8654321234',
    //   proLocation: '12  street, Silicon Valley,Avenue NE, Huntsville',
    // };
    
    // this.about = "Lawyer James Anderson once made his mark on the football field as a highschool All - State; and All - American football player.Today he isknown for his courtroom skills as partner with Mary, Jason & Hodge of Attorney Huntsville, Alabama.Morris is a lifelong Alabamian who has been practicing law in Huntsville since earning his law degree from the Attorneys High School."
    

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
        this.profileData = this.row = result.data;  
        //console.log(this.row);      
        if(result.data.profilePicture){
          this.profilePicture = filePath + result.data.profilePicture;
        }        
        this.leadsCount();
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
  }

  leadsCount(query = {}) {
    const req_vars = {
      query: Object.assign({customerId:this.userId,advisorId:this.selectedProfileId}, query)
    }
    this.userapi.apiRequest('post', 'lead/lead-submit', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
                    
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
  }

  openSendEmailModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SendAnEmailComponent, {
      width: '720px',
      disableClose: true,
    })
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  openHireAdvisorModal(id: any = {},update: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
        update: update,
      },
    })
  }

  getAdvisorSpecilities(businessType){
    let types = String(businessType)
    return types.replace(",",", ")
  }
}