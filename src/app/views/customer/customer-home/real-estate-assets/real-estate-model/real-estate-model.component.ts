import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { RealEstateType } from 'app/selectList';

@Component({
  selector: 'app-real-estate-model',
  templateUrl: './real-estate-model.component.html',
  styleUrls: ['./real-estate-model.component.scss']
})
export class RealEstateModelComponent implements OnInit {
  row: any
  userId: string
  realEstateForm: FormGroup;  
  selectedProfileId: string;  
  profileIdHiddenVal: boolean = false;
  typeOfRealEstateType: any[];
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) {

  }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.realEstateForm = this.fb.group({
      estateType: new FormControl('', Validators.required),
      address: new FormControl(''),
      mortgageHolder: new FormControl(''),
      accountNumber: new FormControl(''),
      phoneContact: new FormControl(''),
      deedLocation: new FormControl(''),
      comments: new FormControl(''),
      profileId: new FormControl('')
    });

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'real-estate-assets') {
      this.selectedProfileId = "";
    }
    this.getRealEstateDetails();
    this.typeOfRealEstateType = RealEstateType;
  }

  //function to get all events
  getRealEstateDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-real-estate', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.realEstateForm.controls['profileId'].setValue(this.row._id);
        this.realEstateForm.controls['estateType'].setValue(this.row.estateType);
        this.realEstateForm.controls['address'].setValue(this.row.address);
        this.realEstateForm.controls['mortgageHolder'].setValue(this.row.mortgageHolder);
        this.realEstateForm.controls['accountNumber'].setValue(this.row.accountNumber);
        this.realEstateForm.controls['deedLocation'].setValue(this.row.deedLocation);
        this.realEstateForm.controls['phoneContact'].setValue(this.row.phoneContact);
        this.realEstateForm.controls['comments'].setValue(this.row.comments);
      }
    }, (err) => {
      console.error(err)
    })
  }
  
  realEstateFormSubmit(realEstateData) {
    var query = {};
    var proquery = {};
    let profileIds = this.realEstateForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(realEstateData),
      from: Object.assign({ customerId: this.userId })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/real-estate', req_vars).subscribe(result => {
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

}