import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';

@Component({
  selector: 'app-customer-professionals-details',
  templateUrl: './customer-professionals-details.component.html',
  styleUrls: ['./customer-professionals-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerProfDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profileData: any;
  about: string;
  selectedProfileId:string;
  row: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,private userapi: UserAPIService, 
  ) { }

  ngOnInit() {
  
    // const locationArray = location.href.split('/')
    // this.selectedProfileId = locationArray[locationArray.length - 1];
   // this.getAdvisorView();

    this.profileData = {
      proName: 'Mary, Jason & Hodge of Attorney',
      proDomain: 'www.mjhattorenys.com',
      proJob: 'Attorney, Insurance Agent',
      proExp: '12 years',
      proPhone: '+8654321234',
      proLocation: '12  street, Silicon Valley,Avenue NE, Huntsville',
    };

    this.about = "Lawyer James Anderson once made his mark on the football field as a highschool All - State; and All - American football player.Today he isknown for his courtroom skills as partner with Mary, Jason & Hodge of Attorney Huntsville, Alabama.Morris is a lifelong Alabamian who has been practicing law in Huntsville since earning his law degree from the Attorneys High School."
  };


  // getAdvisorView = (query = {}, search = false) => {
  //   const req_vars = {
  //     query: Object.assign({ _id: this.selectedProfileId }, query)
  //   }

  //   this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
  //     if (result.status == "error") {
  //       console.log(result.data)
  //     } else {
  //       this.row = result.data;      
  //       console.log("here",this.row)     
  //     }
  //   }, (err) => {
  //     console.error(err)
  //     //this.showLoading = false
  //   })
  // }



}
