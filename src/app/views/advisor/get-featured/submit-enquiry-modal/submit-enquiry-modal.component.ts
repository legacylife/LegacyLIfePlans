import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
//https://ej2.syncfusion.com/angular/demos/#/material/multi-select/custom-value
@Component({
  selector: 'app-submit-enquiry-modal',
  templateUrl: './submit-enquiry-modal.component.html',
  styleUrls: ['./submit-enquiry-modal.component.scss']
})
export class SubmitEnquiryModalComponent implements OnInit {
  userId: string
  enquiryForm: FormGroup
  userFullName: string
  endUserType: string
  emailHiddenVal:boolean = false;
  minDate = new Date()

  public locationList: { [key: string]: Object }[] = []

    // define the JSON of data
  public locationList1: { [key: string]: Object }[] = [
      { Id: '', Game: 'Select Zipcodes' }
  ];
  // map the appropriate columns to fields property
  public fields: object = {text: 'ZIP', value: '_id'};
  // set the placeholder to MultiSelect input element
  public waterMark: string = 'What location or zip codes are you planning to target?';
  // set the type of mode for how to visualized the selected items in input element.
  public box : string = 'Box';
  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService) {
  }

  ngOnInit() {
      this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
      this.userId = localStorage.getItem("endUserId");
      this.endUserType = localStorage.getItem("endUserType");
      this.enquiryForm = this.fb.group({
        zipcodes: new FormControl(''),
        fromDate: new FormControl(''),
        toDate: new FormControl(''),
        message: new FormControl('')
      });
      this.getAllZipcodes();
    }

    enquiryFormSubmit(formData = null) {
      let enquiryData = {
        query: Object.assign({ userType: this.endUserType,customerId: this.userId }),
        proquery: Object.assign(formData)  
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'advertisement/submitEnquiry', enquiryData).subscribe(result => {
      this.loader.close();
        if (result.status=="success") {      
          this.dialog.closeAll(); 
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }     
      }, (err) => {
        this.snack.open(err, 'OK', { duration: 4000 })
      })
    }

    toggleSearchSuggestion(event) {
      console.log('searchValue here',event)
      let searchValue = this.enquiryForm.controls['zipcodes'].value;
      if(searchValue.trim().length > 3){
        //this.enquiryForm.controls['zipcodes'].setValue(value);
        console.log('searchValue',searchValue)
        //this.getAllZipcodes();
      }
    }

    getAllZipcodes() {
      let enquiryData = {
        query: Object.assign({}),
        limit: 10,
      }
      this.userapi.apiRequest('post', 'zipcodes/getAllZipcodes', enquiryData).subscribe(result => {
        if (result.status=="success") {      
          this.locationList = result.data.locationList;
        }     
      }, (err) => {
        this.snack.open(err, 'OK', { duration: 4000 })
      })
    }

  }

