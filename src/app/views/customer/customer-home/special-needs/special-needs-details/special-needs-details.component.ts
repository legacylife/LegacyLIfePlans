import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { SpecialNeedsModelComponent } from '../special-needs-model/special-needs-model.component';


@Component({
  selector: 'app-special-needs-details',
  templateUrl: './special-needs-details.component.html',
  styleUrls: ['./special-needs-details.component.scss']
})
export class SpecialNeedsDetailsComponent implements OnInit {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  title: string;
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  toUserId:string = ''
  subFolderName:string = ''

  constructor(
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId =  this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getSpecialNeedsDetails();    
  }

  //function to get all events
  getSpecialNeedsDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.toUserId = this.userId
    this.userapi.apiRequest('post', 'specialNeeds/view-special-needs', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
          this.trusteeLegaciesAction = false;
        }
        this.row = result.data
        this.toUserId = this.row.customerLegacyId ? this.row.customerLegacyId : this.row.customerId
        if (result.data.folderName == "Young_Children") {
          this.title = "Young Children"
        } else if (result.data.folderName == "Child_Parent") {
          this.title = "Child/Parent with Disability"
        } else {
          this.title = "Friend/Neighbor you provide or care for"
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  deleteSpecialNeeds(customerId='',folderName) {
    var statMsg = "Are you sure you want to delete this record?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            fromId:localStorage.getItem('endUserId'),
            toId:this.toUserId,
            folderName:'Special Needs',
            subFolderName:folderName
          }
          this.userapi.apiRequest('post', 'specialNeeds/delete-special-needs', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'special-needs', customerId])
                }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'special-needs'])
                }
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }


  openModal(folderName, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SpecialNeedsModelComponent, {
      data:{
        folderName:folderName
      },
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getSpecialNeedsDetails();
        if (!res) {
          return;
        }
      })
  }

  checkSpecialChar(event) {
    var key;
    key = event.charCode;
    return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57));
  }
   
}