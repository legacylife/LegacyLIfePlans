import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog, MatDatepickerInputEvent } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager, WebApiAdaptor, UrlAdaptor, ODataV4Adaptor} from '@syncfusion/ej2-data';
import { EmitType } from '@syncfusion/ej2-base';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { serverUrl } from '../../../../config';
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
  dateError: string = '';
  emailHiddenVal:boolean = false;
  minDate = new Date();
  minDateTo = new Date();
  zipcode: string;
  events: string[] = [];
  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService) {
  }

  public searchData: any = new DataManager({
    url: serverUrl+'/api/zipcodes/getAllZipcodes',
    adaptor: new ODataV4Adaptor,
    crossDomain: true
  });

  public query: any  = new Query().select(['ZIP']).take(100);
  public fields: object = {text: 'ZIP', value: 'ZIP'};
  public waterMark: string = 'What location or zip codes are you planning to target?'; 
  public box : string = 'Box';
  public sorting: string = 'Ascending';

  public onFiltering: EmitType<any> =  (e: FilteringEventArgs) => {
    if(e.text == '') e.updateData(this.searchData);
    else{
      let query: any = new Query().select(['_id', 'ZIP']);
      query = (e.text !== '') ? query.where('ZIP', 'endswith', e.text, true) : query;
      e.updateData(this.searchData, query);
    }
  };
    
  ngOnInit() {
        this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
        this.userId = localStorage.getItem("endUserId");
        this.endUserType = localStorage.getItem("endUserType");
        this.enquiryForm = this.fb.group({
          zipcodes: new FormControl('', Validators.required),
          fromDate: new FormControl('', Validators.required),
          toDate: new FormControl('', Validators.required),
          message: new FormControl('')
        });
       // this.getAllZipcodes();
    }


    enquiryFormSubmit(formData = null) {
      var date = new Date(this.enquiryForm.controls['toDate'].value).toDateString();
      if(new Date(this.enquiryForm.controls['toDate'].value) < new Date(this.enquiryForm.controls['fromDate'].value)) {
          this.dateError = 'To date should be greater than From date';
      }else{     
        this.dateError = '';
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

  }

