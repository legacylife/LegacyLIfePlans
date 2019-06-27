import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'app-advisor-leads-details',
  templateUrl: './advisor-leads-details.component.html',
  styleUrls: ['./advisor-leads-details.component.scss']
})
export class AdvisorLeadsDetailsComponent implements OnInit {
  allPeoples: any[];

  constructor(
  ) { }


  ngOnInit() {
    this.allPeoples = [
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        emailId: 'barryallen@gmail.com',
        totalFiles: 'Pune, Wakad, Maharashtra',
        totalFolders: '+1 9876543210',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Johnson Smith',
        emailId: 'jonathancolon@gmail.com',
        totalFiles: 'Hadpsar, Pune Colony, Maharashtra',
        totalFolders: '+1 9876543210',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'John Doe',
        emailId: 'johnson.smith@gmail.com',
        totalFiles: 'Wakad, Maharashtra',
        totalFolders: '+1 9876543210',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        emailId: 'barryallen@gmail.com',
        totalFiles: 'Pune, Maharashtra',
        totalFolders: '+1 9876543210',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Allen Barry',
        emailId: 'barryallen@gmail.com',
        totalFiles: 'Pune, Wakad, Maharashtra',
        totalFolders: '+1 9876543210',
      },
      {
        profilePic: 'assets/images/arkenea/ca.jpg',
        userName: 'Johnson Smith',
        emailId: 'jonathancolon@gmail.com',
        totalFiles: 'Hadpsar, Pune Colony, Maharashtra',
        totalFolders: '+1 9876543210',
      }
    ];
  }




}
