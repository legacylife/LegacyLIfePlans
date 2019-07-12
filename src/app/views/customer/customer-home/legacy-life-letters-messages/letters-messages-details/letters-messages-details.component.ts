import { Component, OnInit,ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { LettersMessagesModelComponent } from '../letters-messages-model/letters-messages-model.component';
import { s3Details } from '../../../../../config';
const filePath = s3Details.url+'/'+s3Details.letterMessageDocumentsPath;
@Component({
  selector: 'app-letters-messages-details',
  templateUrl: './letters-messages-details.component.html',
  styleUrls: ['./letters-messages-details.component.scss']
})
export class LettersMessagesDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  docPath: string; 
  trusteeLegaciesAction:boolean=true;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    this.docPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getLettersMessageView();
    let urlData = this.userapi.getURLData();
this.trusteeLegaciesAction = urlData.trusteeLegaciesAction

  }

//function to get all events
getLettersMessageView = (query = {}, search = false) => {
  let profileIds = '';
  let req_vars = {}
  if (this.selectedProfileId) {
    profileIds = this.selectedProfileId;
    req_vars = {
      query: Object.assign({ _id: profileIds })
    }
  }
  this.userapi.apiRequest('post', 'lettersMessages/view-lettersMessages-details', req_vars).subscribe(result => {     
    if (result.status == "error") {
      console.log(result.data)
    } else {
      if (result.data) {
        this.row = result.data;
      }
    }  
  }, (err) => {
    console.error(err);
  })
}

openLettersMessageModal() {
  let dialogRef: MatDialogRef<any> = this.dialog.open(LettersMessagesModelComponent, {     
    width: '720px',
    disableClose: true,
  })
  dialogRef.afterClosed()
    .subscribe(res => {
      this.getLettersMessageView();
      if (!res) {
        // If user press cancel
        return;
      }
    })
}

deleteLettersMessage() {
  var statMsg = "Are you sure you want to delete letters message details?"
  this.confirmService.confirm({ message: statMsg })
    .subscribe(res => {
      if (res) {
        this.loader.open();
        var query = {};
        const req_vars = {
          query: Object.assign({ _id: this.selectedProfileId }, query)
        }
        this.userapi.apiRequest('post', 'lettersMessages/delete-lettersMessages', req_vars).subscribe(result => {
          if (result.status == "error") {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.loader.close();
            this.router.navigate(['/', 'customer', 'dashboard', 'letters-messages'])
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          console.error(err)
          this.loader.close();
        })
      }
    })
}

}
