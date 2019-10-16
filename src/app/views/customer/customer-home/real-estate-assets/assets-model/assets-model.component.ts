import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { RealEstateAssetsType } from 'app/selectList';

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
  typeOfRealEstateAssetsType: any[];
  assetNewToggle: boolean = false;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  toUserId:string = ''
  subFolderName:string = 'Assets'
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.assetsForm = this.fb.group({
      asset: new FormControl('', Validators.required),
      assetNew: new FormControl(''),
      assetType: new FormControl(''),
      assetValue: new FormControl(''),
      location: new FormControl(''),
      comments: new FormControl(''),
      profileId: new FormControl('')
    });

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'real-estate-assets' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'real-estate-assets') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
         if(userAccess.AssetsManagement!='now'){
          this.trusteeLegaciesAction = false;
         }           
        });    
        this.selectedProfileId = "";        
    }
    this.typeOfRealEstateAssetsType = RealEstateAssetsType
    this.getRealEstateAssetsDetails();    
  }

  assetsFormSubmit(assetsData) {
    var query = {};
    var proquery = {};
    let profileIds = this.assetsForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'real-estate-assets') {
      assetsData.customerLegacyId = this.customerLegaciesId
      assetsData.customerLegacyType = this.customerLegacyType
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(assetsData),
      from: Object.assign({ customerId: this.userId }),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:'Real Estates Vehicles & Assets',
      subFolderName: this.subFolderName
    }

    this.loader.open();
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-assets', req_vars).subscribe(result => {
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

  getRealEstateAssetsDetails(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.toUserId = this.userId
    this.userapi.apiRequest('post', 'realEstateAssets/view-real-estate-asset', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.toUserId = this.row.customerLegacyId ? this.row.customerLegacyId : this.row.customerId
        this.assetsForm.controls['profileId'].setValue(this.row._id);
        this.assetsForm.controls['asset'].setValue(this.row.asset);
        this.assetsForm.controls['assetNew'].setValue(this.row.assetNew);
        this.assetsForm.controls['assetType'].setValue(this.row.assetType);
        this.assetsForm.controls['assetValue'].setValue(this.row.assetValue);
        this.assetsForm.controls['location'].setValue(this.row.location);
        this.assetsForm.controls['comments'].setValue(this.row.comments);
        if (this.row.asset == 10) {
          this.assetNewToggle = true
        } else {
          this.assetNewToggle = false
        }
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

  assetChange(event) {
    if (event.value == 10) {
      this.assetNewToggle = true
      this.assetsForm.get('assetNew').setValidators(Validators.required);      
    } else {
      this.assetNewToggle = false
    }
  }
}
