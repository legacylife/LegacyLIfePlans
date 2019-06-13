import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';


@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-my-people.component.html',
  styleUrls: ['./customer-my-people.component.scss'],
  animations: [egretAnimations]
})
export class CustomerMyPeopleComponent implements OnInit {
  allPeoples: any[];

  constructor(
  ) { }


  ngOnInit() {
    this.allPeoples = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        emailId: 'barryallen@gmail.com',
        totalFiles: '24 Files',
        totalFolders: '9 Folders',
        position: 'CFA, CIC',
        status: 'assigned'
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        emailId: 'emilydoe@gmail.com',
        totalFiles: '4 Files',
        totalFolders: '1 Folders',
        position: 'CFA, CIC',
        status: 'pending'
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        emailId: 'johnson.smith@gmail.com',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/user-male.png',
        userName: 'James Anderson',
        emailId: 'james.anderson@gmail.com',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'assigned'
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        emailId: 'barryallen@gmail.com',
        totalFiles: '24 Files',
        totalFolders: '9 Folders',
        position: 'CFA, CIC',
        status: 'assigned'
      },
      {
        profilePic: 'assets/images/arkenea/emily.png',
        userName: 'Emily Doe',
        emailId: 'emilydoe@gmail.com',
        totalFiles: '4 Files',
        totalFolders: '1 Folders',
        position: 'CFA, CIC',
        status: 'pending'
      },
      {
        profilePic: 'assets/images/arkenea/john.png',
        userName: 'Johnson Smith',
        emailId: 'johnson.smith@gmail.com',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'advisor'
      },
      {
        profilePic: 'assets/images/arkenea/user-male.png',
        userName: 'James Anderson',
        emailId: 'james.anderson@gmail.com',
        totalFiles: '15 Files',
        totalFolders: '6 Folders',
        position: 'CFA, CIC',
        status: 'assigned'
      },
    ];
  }




}
