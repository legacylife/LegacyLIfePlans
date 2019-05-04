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

  constructor(private http: HttpClient, private router: Router) {}

//function to save token and user id
  private saveToken(token: string, userId: string, userType: string, username: string, authCode: string, expiryDate: string, emailApiType:string = '', userHeaderDetails: any, mainUserId: any = "", req:any): void {
    this.token = token
    this.userId = userId
    if(typeof(userHeaderDetails) != 'string') {
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
    if(mainUserId) {
      localStorage.setItem('mainUserId', mainUserId)
    }
    let expirySession = new Date()
    expirySession.setDate(expirySession.getDate() + 2)
    localStorage.setItem('expirySession', expirySession.toString())
  }

//function to get token from localStorage
  private getToken(): string {
    if (!this.token) {
      this.token =  this.getKeyFromStorage('token')
    }
    return this.token
  }

//function to get key from storages
private getKeyFromStorage(key): any {
  if(localStorage.getItem(key)) {
    return localStorage.getItem(key)
  } else if(sessionStorage.getItem(key)) {
    return sessionStorage.getItem(key)
  }
  return "";
}

//function to get key from storages
private removeKeyFromStorage(key): any {
  if(localStorage.getItem(key)) {
    localStorage.removeItem(key)
  }
  if(sessionStorage.getItem(key)) {
     sessionStorage.removeItem(key)
  }
}

//function to get user id from localStorage
  public getUser(): string {
    if (!this.userId) {
      this.userId = this.getKeyFromStorage('userId')
      this.userType = this.getKeyFromStorage('userType')
    }
    return this.userId
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
  private request(method: 'post'|'get', type: string, data?: any): Observable<any> {
    let base
    if (method === 'post') {
      base = this.http.post(serverUrl + `/api/${type}`, data)
    } else {
      base = this.http.get(serverUrl + `/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }})
    }

    const request = base.pipe(
      map((response: TokenResponse) => {
        if (response.data && response.data.token) {
          console.log(data.userType)
          //check if user type is same
          if( data.userType === response.data.userType || (data.userType == "sysadmin" && response.data.userType == "TeamMember")) {
            const { token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId } = response.data
            this.saveToken(token, userId, userType, username, authCode, expiryDate, emailApiType, userHeaderDetails, mainUserId, data)
            return response
          } else {
            return { status: "error", data: { message: "Please check your credentials" }}
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

    window.localStorage.clear();
    window.sessionStorage.clear();

    this.router.navigate(["llp-admin","signin"])
  }

  //function to make request to server
  public apiRequest(method, apiUrl, req_vars: any): Observable<any> {
    return this.request(method, apiUrl, req_vars)
  }

  //function to sync mails in background
  public syncMailInBackground(userId, authCode, emailApiType="gmail", limit = 20, folder = 'inbox', offset = 0): any{
    let req_vars = {
      userId: userId,
      authCode: authCode,
      emailApiType: emailApiType,
      in: folder,
      offset,
      limit
    }
    const page:any = offset / limit;
    const userEmail = localStorage.getItem("username") || sessionStorage.getItem("username")
    let messages = []
    this.apiRequest('post', 'email/getThreadsWithDetails', req_vars).subscribe(result => {
      if(result.status == "error"){
        console.log(result.data)
      } else {
        let emails:any = []
        localStorage.setItem('emails', emails)
        localStorage.setItem('page', page)
      }
    }, (err) => {
      console.error(err)
    })
  }
  //function to get email count of inbox
  public getFolderCount(userId, authCode, emailApiType = 'gmail', folder = 'INBOX'){
  let req_vars = {
    userId: userId,
    authCode: authCode,
    emailApiType: emailApiType,
    folder: folder
  }

  this.apiRequest('post','email/getFolderCount', req_vars).subscribe(result => {
    if(result.status == "error"){
        console.log(result.data)
        localStorage.setItem('totalCount', '0');
      } else {
        console.log("totalCount", result.data.totalCount)
        localStorage.setItem('totalCount', result.data.totalCount);
      }
    }, (err) => {
      console.error(err)
    })
  }
}
