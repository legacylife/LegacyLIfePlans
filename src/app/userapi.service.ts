import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'
import { Router } from '@angular/router'
import { serverUrl } from './config'
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

  constructor(private http: HttpClient, private router: Router) { }

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
    this.token = token
    this.userId = userId
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
          if (data.userType != "sysadmin") {
            const { token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, userProfilePicture } = response.data
            if(userType == 'customer' || userType == 'advisor'){
              this.endUsersaveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data, userProfilePicture)
            } else {
              this.saveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data)
            }
            
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
    let userType = localStorage.getItem("endUserType");
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

    this.router.navigate(["signin"]);
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
    return this.fileAccessInfo;
  }


}
