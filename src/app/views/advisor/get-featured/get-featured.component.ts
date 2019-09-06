import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav,MatInputModule  } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { SubmitEnquiryModalComponent } from './submit-enquiry-modal/submit-enquiry-modal.component';
@Component({
  selector: 'app-get-featured',
  templateUrl: './get-featured.component.html',
  styleUrls: ['./get-featured.component.scss']
})
export class GetFeaturedComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  legacyDayTwo = false;
  legacyDayOne = true;
  userId = localStorage.getItem("endUserId");
  rows:any = [];
  panelOpenState = true;
  recordsFound = false;
  constructor(
    private snack: MatSnackBar,private matInput: MatInputModule,private dialog: MatDialog,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,private userapi: UserAPIService
  ) { }

  ngOnInit() {
    this.enquiryList();
  }

  enquiryList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({customerId:this.userId}, query),
      order: {"createdOn": -1}	  
    }
    this.userapi.apiRequest('post', 'advertisement/enquiryList', req_vars).subscribe(result => {
      if(result.status == "error"){
      console.log(result.data)        
      this.snack.open(result.data, 'OK', { duration: 4000 })
      } else {
      this.rows = result.data.advertisementList;	
        if(this.rows.length>0){
          this.recordsFound = true;
        }
      }
    }, (err) => {
      console.error(err)      
    })
  }

  openSubmitEnqModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SubmitEnquiryModalComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.enquiryList();
    this.legacyDayTwo = true;
    this.legacyDayOne = false;
    });
  }

  arrayToString(array) {
    return array.join(", ");
  }

}
