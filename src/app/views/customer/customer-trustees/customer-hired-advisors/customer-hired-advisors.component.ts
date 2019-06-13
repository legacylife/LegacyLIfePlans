import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';


@Component({
  selector: 'app-customer-hired-advisors',
  templateUrl: './customer-hired-advisors.component.html',
  styleUrls: ['./customer-hired-advisors.component.scss'],
  animations: [egretAnimations]
})
export class CustomerHiredAdvisorComponent implements OnInit {
  allPeoples: any[];

  constructor(
  ) { }


  ngOnInit() {
    this.allPeoples = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        totalFiles: '24 Files',
        totalFolders: '9 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        totalFiles: '4 Files',
        totalFolders: '1 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      }
    ];
  }




}
