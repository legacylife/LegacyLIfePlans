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
    mainUserId: any
  }
}

@Injectable()
export class APIService {
  private token: string
  private userId: string
  private userType: string
  private sectionAccess: any
  private userInfo: any
  private accessSection: any

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
  private endUsersaveToken(token: string, userId: string, userType: string, username: string, authCode: string, expiryDate: string, emailApiType: string = '', userHeaderDetails: any, mainUserId: any = "", req: any): void {
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
  public getUser(): string {
    if (!this.userId) {
      this.userId = this.getKeyFromStorage('userId')
      this.userType = this.getKeyFromStorage('userType')
      this.sectionAccess = this.getKeyFromStorage('sectionAccess')
    }
    return this.userId
  }

  // Function to check access to section in admin panel
  public getUserAccess(key): any {
    let accessFlag = false;
    this.sectionAccess = this.getKeyFromStorage('sectionAccess')
    if (this.sectionAccess) {
      this.accessSection = JSON.parse(this.sectionAccess)
      if (this.accessSection.usermanagement == 'fullaccess')
        accessFlag = true;
      else
        accessFlag = false;
    }
    return accessFlag
  }

  //function to get user id from localStorage
  public getUserInfo(): string {    
    this.userId = this.getKeyFromStorage('userId')
    this.userType = this.getKeyFromStorage('userType')
    this.sectionAccess = this.getKeyFromStorage('sectionAccess')
    this.userInfo = {
      "userId" : this.userId,
      "userType" : this.userType
    }
    
    return this.userInfo
  }  

  //function to get token & userId  from token payload
  public getUserDetails(): any {
    const token = this.getToken()
    const userId = this.getUser()
    let payload
    if (token && userId) {
      payload = token.split('.')[1]
      payload = window.atob(payload)
      return JSON.parse(payload)
    } else {
      return null
    }
  }

  //function to check if user is logged in
  public isLoggedIn(): boolean {
    const user = this.getUserDetails()
    if (user) {
      return user.exp > Date.now() / 1000
    } else {
      return false
    }
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
          if (data.userType === response.data.userType || (data.userType == "sysadmin" && response.data.userType == "TeamMember")) {
            alert("hi")
            const { token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId } = response.data
            if(userType == 'customer' || userType == 'advisor'){
              this.endUsersaveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data)
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
  public logout(): void {
    this.token = ''
    this.removeKeyFromStorage('userId')
    this.removeKeyFromStorage('userType')
    this.removeKeyFromStorage('username')
    this.removeKeyFromStorage('authCode')
    this.removeKeyFromStorage('emailApiType')
    this.removeKeyFromStorage('token')
    this.removeKeyFromStorage('expiryDate')
    this.removeKeyFromStorage('userHeaderDetails')
    this.removeKeyFromStorage('sectionAccess')

    window.localStorage.clear();
    window.sessionStorage.clear();

    this.router.navigate(["llp-admin", "signin"])
  }

  //function to make request to server
  public apiRequest(method, apiUrl, req_vars: any): Observable<any> {
    return this.request(method, apiUrl, req_vars)
  }
}
