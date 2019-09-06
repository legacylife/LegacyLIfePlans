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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private confirmService: AppConfirmService,
    private userapi: UserAPIService, 
    private loader: AppLoaderService, 
    private snack: MatSnackBar,
    private shareData: DataSharingService,
    private locationStrategy: LocationStrategy
  ) {
    this.preventBackButton()
  }

  ngOnInit() {
    this.urlData = this.userapi.getURLData();
    if(this.urlData.lastThird == "legacies"){
      if(this.urlData.userType == "advisor"){
        this.userAs = 'Advisor'; 
      }
      this.getCustomerDetails();
    }
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
    console.log("asdasd")
    let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
      width: '500px',
      disableClose: true,
      closeOnNavigation:false,
      data: {
        for: 'legacyRenew',
        userId: this.urlData.lastOne,
        endUserType: this.endUserType,
        userName: this.customerData.firstName+' '+this.customerData.lastName
      }
    })
    dialogRef.afterOpened().subscribe(result => {
      this.isDialogOpen = true
      history.pushState(null, null, location.href);
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.isDialogOpen = false
      })
  }

  getCustomerDetails(query = {}){
    const req_vars = {
      query: Object.assign({ _id: this.urlData.lastOne }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.customerData = result.data;
        this.toUserId = this.urlData.lastOne
        this.endUserType = this.customerData.userType
        if(this.customerData && this.customerData.profilePicture){
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.customerData.profilePicture;
        }
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

    // this.shareData.userShareDataSource.subscribe((shareFolderData) => {
    //   console.log("shareFolderData --->",shareFolderData)   
    // })

    if(this.urlData.lastTwo!='insurance-finance-debt'){
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

 DownloadZipFolders = (folderPath) => {      
    let totalDocs = [];
    let kval = folderPath['key'];
    this.shareData.userShareDataSource.subscribe((shareFolderData) => {
      //console.log("shareFolderData --->",shareFolderData)   
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
      console.log("folderPath --->",folderPath,"totalDocs --->",totalDocs)   
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
          var downloadURL =window.URL.createObjectURL(res)
          let filePath = downloadURL;
          var link=document.createElement('a');
          link.href = filePath;
          link.download = ZipName;
          link.click();
          this.snack.dismiss();
        });
     }else{
      this.snack.open("Document records not found", 'OK', { duration: 4000 })   
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
      docPathRes['key']  = ['funeralPlans','obituary','celebrationLifes'];      
      docPathRes['path'] = userId+'/'+s3Details.finalWishesFilePath;
    }
 
    return docPathRes;
  }



}