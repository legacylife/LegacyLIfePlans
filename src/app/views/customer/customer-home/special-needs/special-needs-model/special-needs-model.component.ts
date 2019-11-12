import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';

@Component({
  selector: 'app-special-needs-model',
  templateUrl: './special-needs-model.component.html',
  styleUrls: ['./special-needs-model.component.scss']
})
export class SpecialNeedsModelComponent implements OnInit {
  row: any
  userId: string
  specialNeedsForm: FormGroup;
  selectedProfileId: string;
  profileIdHiddenVal: boolean = false;
  folderName: any;
  folderNameHidden: string="";
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer'
  trusteeLegaciesAction:boolean=true;
  toUserId:string = ''
  subFolderName:string = ''
  LegacyPermissionError:string="You don't have access to this section";
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService,
    private userapi: UserAPIService,private sharedata: DataSharingService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.folderNameHidden = data.folderName;

    if (data.folderName == "Young_Children") {
      this.folderName = "Young Children";
    } else if (data.folderName == "Child_Parent") {
      this.folderName = "Child/Parent with Disability";
    } else {
      this.folderName = "Friend/Neighbor you provide or care for";
    }
    this.subFolderName = this.folderName
  }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.specialNeedsForm = this.fb.group({
      title: new FormControl('', Validators.required),
      comments: new FormControl(''),
      folderName: new FormControl(''),
      profileId: new FormControl('')
    });
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'special-needs') {
      this.selectedProfileId = "";
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'special-needs') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType =  this.urlData.userType;
      this.userId = this.urlData.lastOne;          
      this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
        if((this.folderName=='Young_Children' && (userAccess.YoungChildrenManagement!='now' || userAccess.YoungChildrenManagement!='')) || (this.folderName=='Child_Parent' && userAccess.ChildParentDisabilityManagement!='now') || (this.folderName=='Friend_Neighbor' && userAccess.FriendNeighborCareManagement!='now')){
        this.trusteeLegaciesAction = false;
       }           
       }); 
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId
    this.getSpecialNeedsDetails();
  }

  getSpecialNeedsDetails = (query = {}, search = false) => {
    let req_vars = {
      query: Object.assign({ customerId: this.userId,status:"Pending" })
    }
   
    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId })
      }
    }

    this.userapi.apiRequest('post', 'specialNeeds/view-special-needs', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;
        if(this.row){
          this.specialNeedsForm.controls['profileId'].setValue(this.row._id);
          this.specialNeedsForm.controls['title'].setValue(this.row.title ? this.row.title : "");
          this.specialNeedsForm.controls['comments'].setValue(this.row.comments);
          this.specialNeedsForm.controls['folderName'].setValue(this.row.folderName);
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  specialNeedsFormSubmit(snData) {
    var query = {};
    var proquery = {};
    let profileIds = this.specialNeedsForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    
    let newData = snData
    newData.folderName =  this.folderNameHidden
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'special-needs') {
      newData.customerLegacyId = this.customerLegaciesId
      newData.customerLegacyType = this.customerLegacyType
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(newData),
      from: Object.assign({ customerId: this.userId }),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:'Special Needs',
      subFolderName:this.subFolderName
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'specialNeeds/special-needs', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.dialog.closeAll();
      }
    }, (err) => {
      console.error(err)
    })
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }

  checkSpecialChar(event) {
    var key;
    key = event.charCode;
    return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57));
  }

  trimInput(formData)
  {
    this.specialNeedsForm.controls['comments'].setValue(formData.value.comments.trim());
  }

}