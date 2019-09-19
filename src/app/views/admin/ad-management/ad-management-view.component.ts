import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { serverUrl, s3Details } from '../../../config';
import { LayoutService } from 'app/shared/services/layout.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'userview',
  templateUrl: './ad-management-view.component.html',
  styleUrls: ['./ad-management.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
  animations: egretAnimations
})
export class AddManagementViewComponent implements OnInit {
  layoutConf: any;
  userId: string
  successMessage: string = "" 
  errorMessage: string = ""
  userType: string = ""
  row: any;

  selectedUserId: string = "";
  docPath:string;
  adminSections = [];
  replyData = [];
  loggedInUserDetails: any;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  statMsg = "";
  fullname: string = ''
  mailBody: string = ''
  data: any
  userCreateOn: any
  my_messages:any;
  userSubscriptionDate: any
  templateData: any
  showPage:boolean = false
  isExpired:boolean = false
  enquiryFormReply: FormGroup
  zipcodeList:[];
  showReplyEnquiryForm:Boolean = false
  paymentLink:String = ''

  constructor(
    private layout: LayoutService,
    private api: APIService, private route: ActivatedRoute, private fb: FormBuilder, 
    private router: Router, private snack: MatSnackBar, private dialog: MatDialog,
    private confirmService: AppConfirmService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections;
    this.userId = localStorage.getItem("userId");
    this.enquiryFormReply = this.fb.group({
      zipcodes: new FormControl('', Validators.required),
      cost: new FormControl('', [Validators.required,Validators.pattern(/^[0-9]*$/)]),
      message: new FormControl(''),
      stripePaymentLink: new FormControl('')
    });
    this.my_messages = {'emptyMessage': 'No records Found'};    
    this.getUser()
  }

  //function to get all events
  getUser = (query = {}, search = false) => {
    
    const req_vars = {
      query: Object.assign({_id:this.selectedUserId},query)
    }
    this.loader.open()
    this.api.apiRequest('post', 'advertisement/viewEnquiry', req_vars).subscribe(result => {
    this.loader.close()
      if (result.status == "error") {
        console.log(result.data)
        this.showPage = true
      } else {
        this.data = result.data.enquirydata;
        this.row = result.data.enquirydata.customerId;
        if(result.data.enquirydata.adminReply){
          this.replyData = result.data.enquirydata.adminReply;
          let currentRecord = this.replyData.slice(-1)[0]
          this.showReplyEnquiryForm = currentRecord['status'] === 'Done' ? false : true

          let encryptedCustomerId = btoa(this.data.customerId._id),
              encryptedInvoiceId  = btoa(currentRecord.paymentDetails.invoiceId)

          this.paymentLink = serverUrl+'/advertisement-payment/'+encryptedCustomerId+'/'+encryptedInvoiceId+'/'+this.data.uniqueId
        }
        
        this.fullname = '';
        if(this.row.firstName && this.row.firstName!=='undefined' && this.row.lastName && this.row.lastName!=='undefined'){
          this.fullname = this.row.firstName+' '+this.row.lastName;
        }
        if(this.row.profilePicture){
           this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.row.profilePicture;
        }
        var zipcodes = this.data.zipcodes;
        this.zipcodeList = zipcodes.split(',');
        this.showPage = true;
      }
    }, (err) => {
      console.error(err)
      this.showPage = true
    })
  }


  enquiryFormReplySubmit(formData = null) {
    let enquiryData = {
      query: Object.assign({_id:this.data._id,adminId:this.userId}),
      proquery: Object.assign(formData)  
    }
    this.loader.open();
    this.api.apiRequest('post', 'advertisement/submitEnquiryReply', enquiryData).subscribe(result => {
    this.loader.close();
      if (result.status=="success") {     
        this.enquiryFormReply.reset(); 
        this.getUser();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }     
    }, (err) => {
      this.snack.open(err, 'OK', { duration: 4000 })
    })
  }

  onChange(event) {
    console.log(event)
  }

  arrayToString(array) {
      return array.join(", ");
  }

  async createPaymentLink() {
    let cost = this.enquiryFormReply.controls['cost'].value;
    let zipcodeList = this.enquiryFormReply.controls['zipcodes'].value;
    if(zipcodeList) {
        if(cost) {
          /*
          let result = await this.api.apiRequest('post', 'advertisement/generate-invoice-link', {query: {customerId : this.data.customerId}}).toPromise()
          if( result.status == 'error' ) {
            this.snack.open("Please try again.", 'OK', { duration: 4000 })
          } */
          let invoiceId = 'in_1EufANAnNCwnZeR0xpiNhdIH'//result.data.invoiceId
          let link = serverUrl+'/advertisement-payment/'+btoa(this.data.customerId)+'/'+btoa(invoiceId)

          this.enquiryFormReply.controls['stripePaymentLink'].setValue(link);
        }else{
          this.snack.open("Please enter payment cost first.", 'OK', { duration: 4000 })
        }
    }else{
      this.snack.open("Please select atleast one zipcode.", 'OK', { duration: 4000 })
    }
  }


  rejectEnquiry() {
    let enquiryData = {
      query: Object.assign({_id:this.data._id,adminId:this.userId})
    }

    this.loader.open();
    this.api.apiRequest('post', 'advertisement/submitRejectEnquiry', enquiryData).subscribe(result => {
    this.loader.close();
      if (result.status=="success") {    
        this.getUser()  
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }     
    }, (err) => {
      this.snack.open(err, 'OK', { duration: 4000 })
    })
  }
  
  toggleSidenav() {
    if(this.layoutConf.sidebarStyle === 'closed') {      
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }
}