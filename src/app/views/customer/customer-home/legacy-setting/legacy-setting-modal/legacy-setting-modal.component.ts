import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './legacy-setting-modal.component.html',
  styleUrls: ['./legacy-setting-modal.component.scss']
})
export class legacySettingModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  urlData:any={};
  settingFlag:string = 'no'  
  constructor(private snack: MatSnackBar,public dialog: MatDialog,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService, private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();

    if(localStorage.getItem("endUserlegacySetting") && localStorage.getItem("endUserlegacySetting")!=''){
      this.settingFlag = localStorage.getItem("endUserlegacySetting");
    }
  }

}