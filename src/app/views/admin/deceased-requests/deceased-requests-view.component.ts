import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { serverUrl, s3Details } from '../../../config';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'deceaseduserview',
  templateUrl: './deceased-requests-view.component.html',
  styleUrls: ['./deceased-requests-view.component.css'],
  animations: egretAnimations
})
export class DeceasedRequestsViewComponent implements OnInit {
  layoutConf: any;
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row: any;
  dpPath: string = ""
  selectedUserId: string = "";
  docPath:string;
  adminSections = [];
  data:any;
  loggedInUserDetails: any;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  fullname: string = ''
  showPage:boolean = false
  my_messages:any;
  executorData:any;
  constructor(
    private layout: LayoutService,
    private api: APIService, private route: ActivatedRoute, 
    private router: Router, private snack: MatSnackBar, private dialog: MatDialog,
    private confirmService: AppConfirmService, private loader: AppLoaderService,
    private subscriptionservice:SubscriptionService) { }
  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.dpPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections;
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };
    this.getDeceasedUser()
  }

  //function to get all events
  getDeceasedUser = (query = {}, search = false) => {
    
    const req_vars = {
      query: Object.assign({ customerId: this.selectedUserId }, query),
      fields: {},      
      order: { "createdOn": -1 },
    }
    this.loader.open()
    this.api.apiRequest('post', 'deceased/deceaseView', req_vars).subscribe(result => {
      this.loader.close()
      if (result.status == "error") {
        console.log(result.data)
        this.showPage = true
      } else {
        this.getExecutorsList();
        this.data = result.data.deceasedData;

        if(this.data[0]){
          this.row = this.data[0].customerId;
        }else{
          this.row = this.data.customerId;
        }
        
        this.fullname = '';
        if(this.row.firstName && this.row.firstName!=='undefined' && this.row.lastName && this.row.lastName!=='undefined'){
          this.fullname = this.row.firstName+' '+this.row.lastName;
        }
        if(this.row.profilePicture){
           this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.row.profilePicture;
        }
        this.showPage = true
      }
    }, (err) => {
      console.error(err)
      this.showPage = true
    })
  }


  getExecutorsList = (query = {}, search = false) => { 
    let req_vars = {
      query: Object.assign({  customerId: this.selectedUserId,status:"Active" })
    }
    this.api.apiRequest('post', 'deceased/deceaseExecutor', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data.executorData){
          if(result.data.executorData.trustId){
            this.executorData = result.data.executorData.trustId;            
          } else if(result.data.executorData.advisorId){
            this.executorData = result.data.executorData.advisorId;            
          }
        }
      }
    }, (err) => {
      console.error(err);
    })
  }  

 
  downloadFile = (filename) => {   
    const filePath = this.selectedUserId+'/'+s3Details.advisorsDocumentsPath;
    this.docPath = filePath; 
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query)
    }
    this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
    this.api.download('documents/downloadDocument', req_vars).subscribe(res => {
      var newBlob = new Blob([res])
      var downloadURL = window.URL.createObjectURL(newBlob);
      let filePath = downloadURL;
      var link = document.createElement('a');
      link.href = filePath;
      link.download = filename;
      document.body.appendChild(link);
      link.click(); 
      this.snack.dismiss();
    });
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