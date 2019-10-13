import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'
import { Router } from '@angular/router'
import { serverUrl } from './config'
import { forEach } from "lodash";
import { MatDialog, MatSnackBar } from '@angular/material';
import { startOfDay,endOfDay,subDays,addDays,endOfMonth,isSameDay,isSameMonth,addHours} from 'date-fns';
interface TokenResponse {
  status: string,
  data: {
    token: string
    userId: string
    userType: string
    authCode: string
    emailApiType: string
    username: string
    expiryDate: string
    userHeaderDetails: any
    mainUserId: any,
    userProfilePicture :string
  }
}

@Injectable()
export class UserAPIService {
  private token: string
  private userId: string
  private userType: string
  private sectionAccess: any
  private userInfo: any
  private accessSection: any
  private fileAccessInfo:any
  private userAccess:any={}
  private userDeathFilesCnt:any={}
  userDeceased:boolean=false;  
  userLockoutPeriod:boolean=false;  
    
  private returnData:any;
  constructor(private http: HttpClient,private snack: MatSnackBar, private router: Router) { }

  //function to save token and user id
  private saveToken(token: string, userId: string, userType: string, username: string, authCode: string, expiryDate: string, emailApiType: string = '', userHeaderDetails: any, mainUserId: any = "", req: any): void {
    this.token = token
    this.userId = userId
    if (typeof (userHeaderDetails) != 'string') {
      userHeaderDetails = JSON.stringify(userHeaderDetails)
    }
    localStorage.setItem('userId', userId)
    localStorage.setItem('userType', userType)
    localStorage.setItem('username', username)
    localStorage.setItem('authCode', authCode)
    localStorage.setItem('emailApiType', emailApiType)
    localStorage.setItem('token', token)
    localStorage.setItem('expiryDate', expiryDate)
    localStorage.setItem('userHeaderDetails', userHeaderDetails)
    if (mainUserId) {
      localStorage.setItem('mainUserId', mainUserId)
    }
    let expirySession = new Date()
    expirySession.setDate(expirySession.getDate() + 2)
    localStorage.setItem('expirySession', expirySession.toString())
  }

  //function to save token and user id
  private endUsersaveToken(token: string, userId: string, userType: string, username: string, authCode: string, expiryDate: string, emailApiType: string = '', userHeaderDetails: any, mainUserId: any = "", req: any, userProfilePicture : string = ''): void {
    
    if(typeof userId === "undefined") {
      userId = this.getKeyFromStorage('endUserId')
    }
    this.token = token;
    this.userId = userId;
    if (typeof (userHeaderDetails) != 'string') {
      userHeaderDetails = JSON.stringify(userHeaderDetails)
    }
    localStorage.setItem('endUserId', userId)
    localStorage.setItem('endUserType', userType)
    localStorage.setItem('endUsername', username)
    localStorage.setItem('userauthCode', authCode)
    localStorage.setItem('useremailApiType', emailApiType)
    localStorage.setItem('token', token)
    localStorage.setItem('userexpiryDate', expiryDate)
    localStorage.setItem('enduserHeaderDetails', userHeaderDetails)
    localStorage.setItem('endUserProfilePicture', userProfilePicture)
    if (mainUserId) {
      localStorage.setItem('mainUserId', mainUserId)
    }
    let expirySession = new Date()
    expirySession.setDate(expirySession.getDate() + 2)
    localStorage.setItem('enduserexpirySession', expirySession.toString())
  }

  //function to get token from localStorage
  private getToken(): string {
    if (!this.token) {
      this.token = this.getKeyFromStorage('token')
    }
    return this.token
  }

  //function to get key from storages
  private getKeyFromStorage(key): any {
    if (localStorage.getItem(key)) {
      return localStorage.getItem(key)
    } else if (sessionStorage.getItem(key)) {
      return sessionStorage.getItem(key)
    }
    return "";
  }

  //function to get key from storages
  private removeKeyFromStorage(key): any {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
    }
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
    }
  }

  //function to get user id from localStorage
  public getEndUser(): string {
    if (!this.userId) {
      this.userId = this.getKeyFromStorage('endUserId')
      this.userType = this.getKeyFromStorage('endUserType')
    }
    return this.userId
  }

  //function to get user id from localStorage
  public getUserInfo(): string {    
    this.userId = this.getKeyFromStorage('endUserId')
    this.userType = this.getKeyFromStorage('endUserType')
    this.userInfo = {
      "endUserId" : this.userId,
      "endUserType" : this.userType
    }    
    return this.userInfo
  }  
  
  public download(path: string, params: any): Observable<any> {
    return this.http.post(serverUrl + `/api/${path}`, params, { responseType: 'blob'});
  }

  //function to make request from frontend
  private request(method: 'post' | 'get', type: string, data?: any): Observable<any> {
    let base
    if (method === 'post') {
      base = this.http.post(serverUrl + `/api/${type}`, data)
    } else {
      base = this.http.get(serverUrl + `/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` } })
    }

    const request = base.pipe(
      map((response: TokenResponse) => {
        if (response.data && response.data.token) {
          //check if user type is same
          let userType = localStorage.getItem("endUserType");
          if (userType != "sysadmin") {
            const { token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, userProfilePicture } = response.data
            /*if(userType == 'customer' || userType == 'advisor'){
              this.endUsersaveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data, userProfilePicture)
            } else {
              this.endUsersaveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data, userProfilePicture)
            } */           
            return response
          } else {
            return { status: "error", data: { message: "Please check your credentials" } }
          }
        } else {
          return response
        }
      })
    )
    return request
  }

  //function to make request to server to register user
  public register(user: any): Observable<any> {
    return this.request('post', 'auth/register', user)
  }

  //function to make request to server to user login
  public login(user: any): Observable<any> {
    return this.request('post', 'auth/signin', user)
  }

  //function to make request to server to logout user
  public userLogout(): void {
    let userId = localStorage.getItem('endUserId'),
        userType = localStorage.getItem("endUserType");
    this.token = ''
    this.removeKeyFromStorage('endUserId')
    this.removeKeyFromStorage('endUserType')
    this.removeKeyFromStorage('endUsername')
    this.removeKeyFromStorage('authCode')
    this.removeKeyFromStorage('emailApiType')
    this.removeKeyFromStorage('token')
    this.removeKeyFromStorage('userexpiryDate')
    this.removeKeyFromStorage('userHeaderDetails')
    this.removeKeyFromStorage('endUserProfilePicture')
    this.removeKeyFromStorage('endUserFirstName')
    this.removeKeyFromStorage('endUserLastName')
    this.removeKeyFromStorage('endUserCreatedOn')
    this.removeKeyFromStorage('endUserSubscriptionStartDate')
    this.removeKeyFromStorage('endUserSubscriptionEndDate')
    this.removeKeyFromStorage('endUserSubscriptionStatus')
    this.removeKeyFromStorage('endUserAutoRenewalStatus')
    this.removeKeyFromStorage('endUserSubscriptionAddon')
    this.removeKeyFromStorage('endUserSubscriptionAddon')
    this.removeKeyFromStorage('endUserProSubscription')
    this.removeKeyFromStorage('endUserProFreeSubscription')
    this.removeKeyFromStorage('endisReferAndEarn')
    this.removeKeyFromStorage('endUserDeceased')
    this.removeKeyFromStorage('setIdleFlag')
    this.removeKeyFromStorage('endUserlockoutLegacyDate')
    this.apiRequest('post', 'userlist/logout', {fromId: userId, userType: userType}).subscribe(result => {
      if(result.status == "error") {
        //this.errorMessage = result.data
      } else {
        this.router.navigate(["signin"]);
      }
    }, (err) => {
      console.log("Error in update")
    })
    
  }

  //function to make request to server
  public apiRequest(method, apiUrl, req_vars: any): Observable<any> {
    return this.request(method, apiUrl, req_vars)
  }

  // get file icon & url
  public getFileIconNUrl(logData){
    this.fileAccessInfo = {}
    if(logData.folderName == 'myessential' && logData.subFolderName == 'personal-profile'){
      this.fileAccessInfo.fileIcon = "insert_drive_file";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/essential-detail-view', logData.fileId];
    }
    if(logData.folderName == 'myessential' && logData.subFolderName == 'id-box'){
      this.fileAccessInfo.fileIcon = "insert_drive_file";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/essential-detail-idbox', logData.fileId];
    }
    if(logData.folderName == 'myessential' && logData.subFolderName == 'essential-professionals'){
      this.fileAccessInfo.fileIcon = "insert_drive_file";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/essential-professionals-detail', logData.fileId];
    }
    if(logData.folderName == 'legalstuff'){
      this.fileAccessInfo.fileIcon = "gavel";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/legal-detail-view', logData.fileId];
    }
    if(logData.folderName == 'emergency_contacts'){
      this.fileAccessInfo.fileIcon = "contact_phone";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/emergency-contacts-details', logData.fileId];
    }
    if(logData.folderName == 'insurance-finance-debt' && logData.subFolderName == 'insurance'){
      this.fileAccessInfo.fileIcon = "monetization_on";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/insurance-view', logData.fileId];
    }
    if(logData.folderName == 'insurance-finance-debt' && logData.subFolderName == 'finance'){
      this.fileAccessInfo.fileIcon = "monetization_on";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/finance-view', logData.fileId];
    }
    if(logData.folderName == 'insurance-finance-debt' && logData.subFolderName == 'debt'){
      this.fileAccessInfo.fileIcon = "monetization_on";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/debt-view', logData.fileId];
    }
    if(logData.folderName == 'pets'){
      this.fileAccessInfo.fileIcon = "pets";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/pets-view', logData.fileId];
    }
    if(logData.folderName == 'timecapsule'){
      this.fileAccessInfo.fileIcon = "access_time";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/time-capsule-view', logData.fileId];
    }
    if(logData.folderName == 'specialneeds'){
      this.fileAccessInfo.fileIcon = "help";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/special-needs-view', logData.fileId];
    }
    if(logData.folderName == 'finalwishes'){
      this.fileAccessInfo.fileIcon = "date_range";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/final-wishes-view', logData.fileId];
    }

    if(logData.folderName == 'realestateassets' && logData.subFolderName == 'real-estate'){ 
      this.fileAccessInfo.fileIcon = "business";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/real-estate-detail-view', logData.fileId];
    }
    if(logData.folderName == 'realestateassets' && logData.subFolderName == 'real-estate-vehicle'){  
      this.fileAccessInfo.fileIcon = "business";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/real-estate-vehicle-detail-view', logData.fileId];
    }
    if(logData.folderName == 'realestateassets' && logData.subFolderName == 'real-estate-assets'){ 
      this.fileAccessInfo.fileIcon = "business";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/real-estate-assets-detail-view', logData.fileId];
    }
    if(logData.folderName == 'letters-messages'){ 
      this.fileAccessInfo.fileIcon = "markunread";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/letters-messages-view', logData.fileId];
    }
    if(logData.folderName == 'password-assets' && logData.subFolderName == 'devices'){ 
      this.fileAccessInfo.fileIcon = "lock";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/device-view', logData.fileId];
    }
    if(logData.folderName == 'password-assets' && logData.subFolderName == 'elecronic-media'){ 
      this.fileAccessInfo.fileIcon = "lock";
      this.fileAccessInfo.fileUrl = ['/customer/dashboard/electronic-media-view', logData.fileId];
    }
    return this.fileAccessInfo;
  }

  // get url params just like, ID, Module
  public getURLData(){
    let userType =  '';
    let lastOne =  '';
    let lastTwo =  '';
    let lastThird =  '';
    let lastFourth = '';
    let dynamicRoute = '/customer/dashboard/';
    let returnData:any = {};
    let trusteeLegaciesAction:boolean = true;

    if (localStorage.getItem("endUserType") == "customer") {
      userType = "customer";
    } else {
      userType = "advisor";
    }
    
    const locationArray = location.href.split("/");
    lastOne   = locationArray[locationArray.length - 1]; // ID , if there or component name ( ex . pets, legal stuff )
    lastTwo   = locationArray[locationArray.length - 2]; // component name ( ex . pets, legal stuff )
    lastThird = locationArray[locationArray.length - 3]; // user section .. legaices/dashboard
    lastFourth = locationArray[locationArray.length - 4]; // user section .. customer/advisor
    if (lastThird == "legacies") {
      dynamicRoute = "/" + userType + "/legacies/"; 
      if (lastFourth =='customer') {
        trusteeLegaciesAction = false
      } 
    } 

    returnData = {
      'lastOne': lastOne,
      'lastTwo': lastTwo,
      'lastThird': lastThird,
      'lastFourth':lastFourth,
      'dynamicRoute': dynamicRoute,
      'userType': userType,
      'trusteeLegaciesAction':trusteeLegaciesAction
    }
    return returnData;
  }

  // get url params just like, ID, Module
  async getFolderInstructions(folderCode, callback){
    let returnData  = ''
    const params = {
      query: Object.assign({ folderCode: folderCode,status:"Active" })
    }
    await this.apiRequest('post', 'cmsFolderInst/view', params).subscribe( (result) => {
      if(result.data.cmsDetails){
        this.returnData = result.data.cmsDetails.InstuctionBody;
        callback (this.returnData)
      }
    });
  }
  
 async getUserAccess(customerId, callback){
    let loggedinCustomerId = localStorage.getItem("endUserId");
    if(loggedinCustomerId!=customerId){
     let response = [];
     if (localStorage.getItem("endUserType") == "customer") {
      const params = {
        query: Object.assign({ customerId: customerId, trustId: loggedinCustomerId,status:"Active" })
      }
     await this.apiRequest('post', 'trustee/view-details', params).subscribe(async result => {
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/customer/dashboard');
      } else {
        //this.userAccess = result.data.userAccess; 
        response = await this.getCustomerUserAccess(result.data,customerId);
        this.userAccess = response['userAccess'];
        this.userDeathFilesCnt = response['deathFilesCount'];
        this.userLockoutPeriod = response['userLockoutPeriod'];
        this.userDeceased = response['userDeceased'];
        callback(this.userAccess,this.userDeathFilesCnt,this.userLockoutPeriod,this.userDeceased);
      }
      });
    }else{
      const params = {
        query: Object.assign({ customerId: customerId, advisorId: loggedinCustomerId,status:"Active" })
      }
      await this.apiRequest('post', 'advisor/view-details', params).subscribe(async result => {
        if (result.status == "error") {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.router.navigateByUrl('/advisor/dashboard');
        } else {
       // this.userAccess = result.data.userAccess;
       response = await this.getCustomerUserAccess(result.data,customerId);
       this.userAccess = response['userAccess'];
       this.userDeathFilesCnt = response['deathFilesCount'];
       this.userLockoutPeriod = response['userLockoutPeriod'];
       this.userDeceased = response['userDeceased'];
        callback(this.userAccess,this.userDeathFilesCnt,this.userLockoutPeriod,this.userDeceased)
      }
      });
     }
   }else{
      this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
      return false;
   }
  }


  async getCustomerUserAccess(data,customerId){
      let userAccess = data.userAccess;      
      let response = []; var count = 0; 
      response['userAccess'] = userAccess;
      response['userDeceased'] = false;
      response['userLockoutPeriod'] = false;
      Object.keys(userAccess).forEach((key,index) => {   
        if(userAccess[key]=='afterDeath'){
          count++;
        }          
      });
      response['deathFilesCount'] = count;
      let lockoutLegacyDateExpire = false;
      if(data.customerId.lockoutLegacyDate && data.customerId.deceased.status=='Pending'){
         if(new Date(data.customerId.lockoutLegacyDate) < new Date()) {
               lockoutLegacyDateExpire = true;
               const params = { query: Object.assign({customerId: customerId})}
               await this.apiRequest('post', 'deceased/expire', params).subscribe(result => {
                    location.reload(true);
               });
         }else{
          response['userLockoutPeriod'] = true;
         }
      }

      if(data && data.customerId && data.customerId.deceased && data.customerId.deceased.status=='Active') {
        response['userDeceased'] = true;
      }
      
      if((data && data.customerId && data.customerId.deceased && data.customerId.deceased.status=='Active') || lockoutLegacyDateExpire){//When user deceased afterDeath files shoulde be display           
        Object.keys(userAccess).forEach((key,index) => {   
          if(userAccess[key]=='afterDeath'){
           userAccess[key] = 'now';
          }          
        });
        response['userAccess'] = userAccess;
      }
      return response;
  }

}
