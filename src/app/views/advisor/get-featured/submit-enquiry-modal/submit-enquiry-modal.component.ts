import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';

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

  }

