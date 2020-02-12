import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserAPIService } from "app/userapi.service";
import { s3Details } from "app/config";
import { AppConfirmService } from "app/shared/services/app-confirm/app-confirm.service";
import { MatDialog, MatSnackBar, MatDialogRef } from "@angular/material";
import { AppLoaderService } from "app/shared/services/app-loader/app-loader.service";
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { forEach } from "lodash";
import { LocationStrategy } from "@angular/common";
import { CardDetailsComponent } from "app/shared/components/card-details-modal/card-details-modal.component";
import { SubscriptionService } from "app/shared/services/subscription.service";
import * as moment from 'moment'
import { RenewSubscriptionComponent } from "app/shared/components/renew-subscription-modal/renew-subscription-modal.component";

@Component({
  selector: "advisor-legacy-details",
  templateUrl: "./advisor-legacy-details.component.html",
  styleUrls: ["./advisor-legacy-details.component.scss"]
})
export class AdvisorLegacyDetailsComponent implements OnInit {
  userId: string;
  urlData:any={};  
  customerData:any=[];
  userAs:string='Trustee';
  profilePicture: any = "assets/images/arkenea/default.jpg"
  docPath: string; 
  toUserId:string = ''
  subFolderName:string = ''

  isDialogOpen:boolean = false
  endUserType:string = ''

  activateRenewSubscriptonBtn:Boolean = false
  subscriptionExpiryDate:String = ''
  daysRemaining:Number = 0

  isPremiumExpired: boolean = false
  isSubscribePlan: boolean = false
  planName: string = 'free'
  subscriptionExpireDate: string = ''
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private confirmService: AppConfirmService,
    private userapi: UserAPIService, 
    private loader: AppLoaderService, 
    private snack: MatSnackBar,
    private shareData: DataSharingService,
    private locationStrategy: LocationStrategy,
    private subscription: SubscriptionService
  ) {
    this.preventBackButton()
    this.urlData = this.userapi.getURLData();
    if(this.urlData.lastThird == "legacies"){
      if(this.urlData.userType == "advisor"){
        this.userAs = 'Advisor'; 
      }
      this.getCustomerDetails();
    }
  }

  ngOnInit() {
    
  }
  
  preventBackButton() {
    this.locationStrategy.onPopState(() => {
      if(this.isDialogOpen) {
        alert("Click on back button will be terminated your transaction. Please wait while completion of the transaction or close the payment popup to proceed.")
        history.pushState(null, null, location.href);
      }
    })
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    if(this.isDialogOpen) {
      // Do more processing...
      event.returnValue = false;
    }
  }

  openCardDetailsModal() {

    let userData = {userId:this.urlData.lastOne,userType:'customer'}
    this.subscription.checkSubscription(userData,( returnArr )=> {
      this.isPremiumExpired = returnArr.isPremiumExpired;
      this.isSubscribePlan = returnArr.isSubscribePlan;
      this.planName = returnArr.planName;
      this.subscriptionExpireDate = returnArr.subscriptionExpireDate;

      if(this.isSubscribePlan && !this.isPremiumExpired){
        let dialogRef: MatDialogRef<any> = this.dialog.open(RenewSubscriptionComponent, {
          width: '500px',
          disableClose: true,
          closeOnNavigation:false,
          data: {
            for: 'legacyRenew',
            userId: this.urlData.lastOne,
            endUserType: this.endUserType,
            userName: this.customerData.firstName+' '+this.customerData.lastName,
            expiryDate: this.subscriptionExpiryDate,
            daysRemaining: this.daysRemaining,
            isPremiumExpired:this.isPremiumExpired,
            isSubscribePlan:this.isSubscribePlan
          }
        })
        dialogRef.afterClosed()
        .subscribe(res => {
          this.activateRenewSubscriptonBtn = false;
          this.isDialogOpen = false
          this.getCustomerDetails()
        })

      }else{

        let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
          width: '500px',
          disableClose: true,
          closeOnNavigation:false,
          data: {
            for: 'legacyRenew',
            userId: this.urlData.lastOne,
            endUserType: this.endUserType,
            userName: this.customerData.firstName+' '+this.customerData.lastName,
            expiryDate: this.subscriptionExpiryDate,
            daysRemaining: this.daysRemaining,
            isPremiumExpired:this.isPremiumExpired,
            isSubscribePlan:this.isSubscribePlan
          }
        })
        dialogRef.afterOpened().subscribe(result => {
          this.isDialogOpen = true
          history.pushState(null, null, location.href);
        })
        dialogRef.afterClosed()
        .subscribe(res => {
          this.activateRenewSubscriptonBtn = false;
          this.isDialogOpen = false
          this.getCustomerDetails()
        })
      } 
    })
  }

  getCustomerDetails(query = {}){
    const req_vars = {
      query: Object.assign({ _id: this.urlData.lastOne }, query),
      fromId: localStorage.getItem('endUserId'),
      userType: localStorage.getItem('endUserType')
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(async result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.customerData = result.data;
        if(this.customerData){
        this.toUserId = this.urlData.lastOne
        this.endUserType = this.customerData.userType
        if(this.customerData && this.customerData.profilePicture){
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.customerData.profilePicture;
        }
        /**
         * Check the user subscription and sctivate renew subscription buttonfor payment in shared legacy for advisor or trustee
         */
        let subscriptionDetails = this.customerData.subscriptionDetails
        if( subscriptionDetails && subscriptionDetails.length > 0 ) {
          //get last element from array i.e current subscription details
          let currentSubscription     = subscriptionDetails.slice(-1)[0]
          let remainingDays           = await this.subscription.getDateDiff( moment().toDate(), moment(currentSubscription.endDate).toDate())
          this.subscriptionExpiryDate = currentSubscription.endDate
          this.daysRemaining          = remainingDays

          let userData = {userId:this.toUserId,userType:this.endUserType}
          this.subscription.checkSubscription(userData,( returnArr )=> {
            this.isPremiumExpired = returnArr.isPremiumExpired
            this.isSubscribePlan = returnArr.isSubscribePlan;
            this.planName = returnArr.planName
            this.subscriptionExpireDate = returnArr.subscriptionExpireDate
          })

          if( remainingDays <= 60 ) {
            this.activateRenewSubscriptonBtn = true
          }
          else{
            this.activateRenewSubscriptonBtn = false
          }
        }
        else{
          this.activateRenewSubscriptonBtn = true
        }
       }else{this.router.navigateByUrl('/'+localStorage.getItem('endUserType')+'/dashboard/shared-legacies');}
      }
    }, (err) => {
      console.error(err)
    })
  }

  remove() {
    var statMsg = "Are you sure you want remove?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};          
          if(this.urlData.userType == 'advisor'){
            req_vars = {customerId:this.urlData.lastOne, advisorId:localStorage.getItem("endUserId"), userType : this.urlData.userType}
          }else{            
            req_vars = {customerId:this.urlData.lastOne, trustId:localStorage.getItem("endUserId"), userType : this.urlData.userType}
          }
          this.userapi.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();            
            if(this.urlData.userType == 'advisor'){
              this.router.navigate(['/', 'advisor', 'shared-legacies'])
            }else{
              this.router.navigate(['/', 'customer','dashboard', 'shared-legacies'])
            }
            this.snack.open(result.data.message, 'OK', { duration: 4000 })            
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  DownloadZip = () => {  
    if(this.urlData.lastTwo=='final-wishes'){
      let obituaryfolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'obituary');
      this.DownloadZipFolders(obituaryfolderPath, 'Obituary');

      setTimeout(()=>{
        let funeralServicesfolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'funeralPlans');  
      this.DownloadZipFolders(funeralServicesfolderPath, 'Funeral Plans');
      },1000);  

      setTimeout(()=>{
        let funeralExpensesfolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'funeralExpense');  
        this.DownloadZipFolders(funeralExpensesfolderPath, 'Funeral Expense');
      },1000);  

      setTimeout(()=>{
        let celebrationofLifefolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'celebrationLifes');  
        this.DownloadZipFolders(celebrationofLifefolderPath, 'Celebration of Life');
      },1000);       
    }


    if(this.urlData.lastTwo!='insurance-finance-debt' && this.urlData.lastTwo!='final-wishes'){
      let folderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'');  
      this.DownloadZipFolders(folderPath);
    }

    if(this.urlData.lastTwo=='insurance-finance-debt'){
      let insurancefolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'insurance');
     // console.log("insurancefolderPath",insurancefolderPath)     
      this.DownloadZipFolders(insurancefolderPath);

      setTimeout(()=>{
        let financefolderPath = this.getDocPath(this.urlData.lastOne,this.urlData.lastTwo,'finance');  
     // console.log("financefolderPath",financefolderPath); 
      this.DownloadZipFolders(financefolderPath);
      },1000);  
     
    }
  }

 DownloadZipFolders = (folderPath, folderError='') => {
    let totalDocs = [];
    let kval = folderPath['key'];
    this.shareData.userShareDataSource.subscribe((shareFolderData) => {
      let docArray = [];
      forEach(kval, (key, rindex) => {
        forEach(shareFolderData[key], (rows, rindex) => {
          docArray = rows.documents;
          forEach(docArray, (row, roindex) => {
            totalDocs.push(row);     
          })      
         })
        })
      })
    
     if(totalDocs.length>0){        
        let query = {};
        var ZipName = this.urlData.lastTwo+"-"+Math.floor(Math.random() * Math.floor(999999999999999))+".zip"; 
        let req_vars = {
          query: Object.assign({downloadFileName:ZipName,docPath:folderPath['path'],AllDocuments:totalDocs }, query),
          fromId:localStorage.getItem("endUserId"),
          toId:this.toUserId,
          folderName:this.urlData.lastTwo,
          subFolderName:this.subFolderName
        }
        this.snack.open("Downloading zip file is in process, Please wait some time!", 'OK');
        this.userapi.download('documents/downloadZip', req_vars).subscribe(res => {
          var newBlob = new Blob([res])
          var downloadURL = window.URL.createObjectURL(newBlob);
          let filePath = downloadURL;                       
          var link= document.createElement('a');
          link.href = filePath;
          link.download = ZipName;
          document.body.appendChild(link);
          link.click();
          this.snack.dismiss();
        });
     }else{
       if(folderError){
        this.snack.open("Document records not found of " + folderError, 'OK', { duration: 4000 })   
       }else{
        this.snack.open("Document records not found", 'OK', { duration: 4000 })   
       }     
     }
  }

  getDocPath = (userId,folderName,extraKey) => { 
    let docPathRes:any=[];
    if(folderName=='essential-day-one'){
      docPathRes['key']  = ['essentialIDList'];      
      docPathRes['path'] = userId+'/'+s3Details.myEssentialsDocumentsPath;
    }else if(folderName=='insurance-finance-debt'){
      if(extraKey=='insurance'){
        docPathRes['key']  = ['insuranceList'];
        docPathRes['path'] = userId+'/'+s3Details.insuranceFilePath;
      }
      if(extraKey=='finance'){
        docPathRes['key']  = ['financesList'];
        docPathRes['path'] = userId+'/'+s3Details.financeFilePath; 
      }
    }else if(folderName=='pets'){
      docPathRes['key']  = ['petsList'];      
      docPathRes['path'] = userId+'/'+s3Details.petsFilePath;
    }else if(folderName=='legal-stuff'){
      docPathRes['key']  = ['legalStuffEstate','legalStuffHealthcare','legalStuffAffairs'];      
      docPathRes['path'] = userId+'/'+s3Details.legalStuffDocumentsPath;      
    }else if(folderName=='time-capsule'){
      docPathRes['key']  = ['timeCapsuleList'];      
      docPathRes['path'] = userId+'/'+s3Details.timeCapsuleFilePath;
    }else if(folderName=='letters-messages'){
      docPathRes['key']  = ['lettersMessagesList'];      
      docPathRes['path'] = userId+'/'+s3Details.letterMessageDocumentsPath;
    }else if(folderName=='final-wishes'){
      if(extraKey=='obituary'){
        docPathRes['key']  = ['ObituaryList'];
        docPathRes['path'] = userId+'/'+s3Details.obituaryFilePath;
      }
      if(extraKey=='funeralPlans'){
        docPathRes['key']  = ['FuneralPlansList'];
        docPathRes['path'] = userId+'/'+s3Details.funeralServicesFilePath; 
      }
      if(extraKey=='funeralExpense'){
        docPathRes['key']  = ['funeralExpense'];
        docPathRes['path'] = userId+'/'+s3Details.funeralExpensesFilePath; 
      }if(extraKey=='celebrationLifes'){
        docPathRes['key']  = ['CelebrationLifesList'];
        docPathRes['path'] = userId+'/'+s3Details.celebrationofLifeFilePath; 
      }
    } 
    return docPathRes;
  }



}