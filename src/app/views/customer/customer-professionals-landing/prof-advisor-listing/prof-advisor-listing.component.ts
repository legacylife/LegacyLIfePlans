import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';


@Component({
  selector: 'app-prof-advisor-listing',
  templateUrl: './prof-advisor-listing.component.html',
  styleUrls: ['./prof-advisor-listing.component.scss'],
  animations: [egretAnimations]
})
export class ProfAdvisorListingComponent implements OnInit {
  adListings: any[];
  qualityAdvisor: any[];
  userId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService,
    private snack: MatSnackBar
  ) { }


  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
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

  abc() {
    alert("hi")
  }

  hireAdvisor() {
    let hirestatus = 'pending';

    let query = {};
    let proquery = { status: hirestatus, customerId: this.userId, advisorId: "5cedf29691d8be19f467093a" };

    const req_vars = {
      query: Object.assign({ customerId: this.userId, advisorId: "5cedf29691d8be19f467093a" }),
      proquery: Object.assign(proquery),
      from: Object.assign({ logId: "" })
    }
    this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
      this.loader.close();
    })
  }




}
