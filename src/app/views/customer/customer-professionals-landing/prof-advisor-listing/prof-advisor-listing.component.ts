import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';


@Component({
  selector: 'app-prof-advisor-listing',
  templateUrl: './prof-advisor-listing.component.html',
  styleUrls: ['./prof-advisor-listing.component.scss'],
  animations: [egretAnimations]
})
export class ProfAdvisorListingComponent implements OnInit {
  adListings: any[];
  qualityAdvisor: any[];

  constructor(
  ) { }


  ngOnInit() {
    this.adListings = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        position: 'CFA, CIC',
        emailId: 'barryallen@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        position: 'CFA, CIC',
        emailId: 'emilydoe@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        position: 'CFA, CIC',
        emailId: 'johnson.smith@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        position: 'CFA, CIC',
        emailId: 'barryallen@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        position: 'CFA, CIC',
        emailId: 'emilydoe@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        position: 'CFA, CIC',
        emailId: 'johnson.smith@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
    ];

    this.qualityAdvisor = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        position: 'CFA, CIC',
        emailId: 'barryallen@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        position: 'CFA, CIC',
        emailId: 'emilydoe@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        position: 'CFA, CIC',
        emailId: 'johnson.smith@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        position: 'CFA, CIC',
        emailId: 'barryallen@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        position: 'CFA, CIC',
        emailId: 'emilydoe@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        position: 'CFA, CIC',
        emailId: 'johnson.smith@gmail.com',
        schoolName: 'Insurance Agent, Attorney, Accountant.',
        yearsOfServices: '10 years of service',
      },
    ];
  }




}
