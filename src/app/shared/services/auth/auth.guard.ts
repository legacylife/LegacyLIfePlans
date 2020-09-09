import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';

const MINUTES_UNITL_AUTO_LOGOUT = 15 // in mins
const CHECK_INTERVAL = 5000 // in ms
const STORE_KEY = 'lastAction';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  val: any;
  private userId: string = localStorage.getItem('userId');
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  private myVar : any;

  constructor(private router: Router, private api: APIService, private snack: MatSnackBar) {
    if (this.userId) {       
      if(localStorage.getItem(STORE_KEY) == null){
        this.setLastAction(Date.now());
      }
      //this.check();  
      this.initListener();      
      this.initInterval();      
    } else {
      clearInterval(CHECK_INTERVAL);
    }
  }

  public getLastAction() {
    return parseInt(localStorage.getItem(STORE_KEY));
  }

  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  initListener() {
    console.log('initListener' )
    document.body.addEventListener('click', () => this.reset());
    //document.body.addEventListener('mouseover',()=> this.reset());
    //document.body.addEventListener('mouseout',() => this.reset());
    document.body.addEventListener('keydown', () => this.reset());
    document.body.addEventListener('keyup', () => this.reset());
    document.body.addEventListener('keypress', () => this.reset());
    window.addEventListener("storage", () => this.storageEvt());
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    this.userInfo = this.api.getUserInfo();
    if (this.userInfo.userType == '') {
      this.api.logout();
      return false;
    }

    const req_vars = { userId: this.userInfo.userId }
    this.api.apiRequest('post', 'auth/view', req_vars).subscribe(result => {
      let userData = result.data;
      localStorage.setItem('sectionAccess', JSON.stringify(userData.sectionAccess))
      if (userData && (userData.status == 'Inactive' || userData.status == 'Inactive')) {
        this.snack.open("Your account has been inactivated.", 'OK', { duration: 4000 })
        this.api.logout();
        return false;
      }
      else {
        this.initInterval();
      }

    }, (err) => {
      //console.error(err)
    })

    return true;
  }

  storageEvt() {
    this.val = localStorage.getItem(STORE_KEY);
  }

  reset() {
    this.userId = localStorage.getItem('userId');
    if (this.userId) {
      this.setLastAction(Date.now());
      console.log('store key',localStorage.getItem(STORE_KEY));
    }
  }

  initInterval() {
    this.myVar = setInterval(() => {
      this.userId = localStorage.getItem('userId');
      //console.log("localStorage.getItem(STORE_KEY) >>>>>",localStorage.getItem(STORE_KEY))
      /*if(localStorage.getItem(STORE_KEY)==null){
        localStorage.setItem(STORE_KEY,Date.now().toString());
      }*/
      if(this.userId && localStorage.getItem(STORE_KEY)) {
        this.check();
      }else{
        //console.log("this.myVar in abv11")
        this.stopIntervalCall()
      }
    }, CHECK_INTERVAL);
  }

  stopIntervalCall(){
    //console.log("this.myVar in abv22")
    clearInterval(this.myVar);
  }

  check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    //console.log('difference',diff,' >>>>>>>>>>>>>>>>>>>>>',this.userId)

    const isTimeout = diff < 0;
    if (isTimeout) {
      clearInterval(this.myVar);
      this.api.logout();
    }
  }
}