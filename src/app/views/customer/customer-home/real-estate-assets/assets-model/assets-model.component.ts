import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
@Component({
  selector: 'app-assets-model',
  templateUrl: './assets-model.component.html',
  styleUrls: ['./assets-model.component.scss']
})
export class AssetsModelComponent implements OnInit {
  row: any
  userId: string
  assetsForm: FormGroup;
  selectedProfileId: string;
  profileIdHiddenVal: boolean = false;

  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.assetsForm = this.fb.group({
      assetType: new FormControl(''),
      assetValue: new FormControl(''),
      location: new FormControl(''),
      comments: new FormControl(''),
      profileId: new FormControl('')
    });

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'real-estate-assets') {
      this.selectedProfileId = "";
    }
  }

}
