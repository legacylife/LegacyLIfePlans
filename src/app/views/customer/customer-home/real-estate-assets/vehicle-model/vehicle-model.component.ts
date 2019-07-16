import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';

@Component({
  selector: 'app-vehicle-model',
  templateUrl: './vehicle-model.component.html',
  styleUrls: ['./vehicle-model.component.scss']
})
export class VehicleModelComponent implements OnInit {
  row: any
  userId: string
  vehiclesForm: FormGroup;  
  selectedProfileId: string;  
  profileIdHiddenVal: boolean = false;

  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.vehiclesForm = this.fb.group({
      model: new FormControl('',Validators.required),
      year: new FormControl(''),
      make: new FormControl(''),
      titleLocation: new FormControl(''),
      financeCompanyName: new FormControl(''),
      accountNumber: new FormControl(''),
      payment: new FormControl(''),
      comments: new FormControl(''),
      profileId: new FormControl('')
    });

    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'real-estate-assets') {
      this.selectedProfileId = "";
    }
    this.getRealEstateVehiclesDetails();
  }

  vehiclesFormSubmit(vehicleData) {
    var query = {};
    var proquery = {};
    let profileIds = this.vehiclesForm.controls['profileId'].value;
    if (profileIds) {
      this.selectedProfileId = profileIds;
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(vehicleData),
      from: Object.assign({ customerId: this.userId })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-vehicle', req_vars).subscribe(result => {
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

  //function to get all events
  getRealEstateVehiclesDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'realEstateAssets/view-real-estate-vehicle', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.vehiclesForm.controls['profileId'].setValue(this.row._id);        
        this.vehiclesForm.controls['model'].setValue(this.row.model);
        this.vehiclesForm.controls['year'].setValue(this.row.year);
        this.vehiclesForm.controls['make'].setValue(this.row.make);
        this.vehiclesForm.controls['titleLocation'].setValue(this.row.titleLocation);
        this.vehiclesForm.controls['financeCompanyName'].setValue(this.row.financeCompanyName);
        this.vehiclesForm.controls['accountNumber'].setValue(this.row.accountNumber);
        this.vehiclesForm.controls['payment'].setValue(this.row.payment);
        this.vehiclesForm.controls['comments'].setValue(this.row.comments);        
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
