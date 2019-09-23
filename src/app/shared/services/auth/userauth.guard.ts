import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { MatDialogRef, MatDialog} from '@angular/material';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import { UserIdleService } from 'angular-user-idle';
import { lockscreenModalComponent } from '../../../views/lockscreen-modal/lockscreen-modal.component';
import { DeceasedComponent } from '../../../views/deceased-modal/deceased-modal.component';
@Injectable()
export class UserAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; //Set this value dynamically
  private userInfo: any
  private urlData: any
  private userUrlType: any
  
  constructor(private router: Router, private userapi: UserAPIService,private route: ActivatedRoute, private subscriptionservice:SubscriptionService, private userIdle: UserIdleService,private dialog: MatDialog) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean{
    this.checkDeceased();
     
      this.userInfo = this.userapi.getUserInfo();
      var pathArray = window.location.pathname.split('/');
      this.userUrlType = pathArray[1];
      let currentUrl = state.url;
      let acceptedUsers = ['advisor','customer'];

      if((this.userInfo && this.userInfo.endUserType == '')){
        this.router.navigateByUrl('/signin');
        return false;
      }
      if(this.userInfo && this.userInfo.endUserType!= '' && acceptedUsers.indexOf(this.userInfo.endUserType) >= 0 ) {
        this.subscriptionservice.checkSubscription( ( returnArr )=> {
          let isProuser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
          let isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
          //let acceptedUrls = ['/'+this.userInfo.endUserType+'/account-setting','/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']
          let acceptedUrls = ['/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']
          if(!isProuser) {
            if(!isFreeProuser) {
              if( currentUrl && acceptedUrls.indexOf(currentUrl) == -1 ) {
                //this.router.navigate(['/'+this.userInfo.endUserType+'/account-setting']);
                this.router.navigate(['/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']);
                return false;
              }
            }
          }
        })
      }
      if ((this.userInfo.endUserType != '' && this.userUrlType != ''  && this.userUrlType != 'subscription' && this.userUrlType != 'signin' && this.userInfo.endUserType != this.userUrlType)) {
        this.router.navigateByUrl('/'+this.userInfo.endUserType+'/dashboard');
        return false;
      }
    return true;
  }

  checkDeceased(){ 
    if(localStorage.getItem("endUserId")){
    let DeceasedFlag = localStorage.getItem("endUserDeceased");
     if(DeceasedFlag=='true'){
       let dialogRef: MatDialogRef<any> = this.dialog.open(DeceasedComponent, {
         width: '720px',
         disableClose: true
       }) 
       dialogRef.afterClosed().subscribe(res => {
         if (!res) {
           // If user press cancel
           return;
         }
       })
     }else{
          this.autologFunction();
     }
    }
 }

autologFunction(){ 
     // console.log("LockScreen Here >> ")
     //https://www.npmjs.com/package/angular-user-idle
     let IdleFlag = localStorage.getItem("setIdleFlag");
      if(IdleFlag=='true'){
        console.log("LockScreen IdleFlag >> ",IdleFlag)
        this.stopWatching(false);
      }
     this.userIdle.startWatching();    
     this.userIdle.onTimerStart().subscribe(
      // count => console.log("home here",count)
     );    
     this.userIdle.onTimeout().subscribe(() => this.stopWatching(true));
}

  stop() {
    this.userIdle.stopTimer();
  }
 
 stopWatching(flag) {
  console.log("LockScreen Countdown start >> ")
  //if(flag){
    localStorage.setItem("setIdleFlag", "true");
 // }
  let dialogRef: MatDialogRef<any> = this.dialog.open(lockscreenModalComponent, {
     width: '720px',
     disableClose: true, 
     panelClass: 'lock--panel',
     backdropClass: 'lock--backdrop'   
   }) 
   dialogRef.afterClosed().subscribe(res => {
    console.log("LockScreen afterClosed >> ")
    this.restart();
    this.startWatching();
     if (!res) {
       // If user press cancel
       return;
     }
   })
   this.userIdle.stopWatching();
 }
 
 startWatching() {
   this.userIdle.startWatching();
 }
 
 restart() {
   localStorage.setItem("setIdleFlag", "false");
   this.userIdle.resetTimer();
 } 
}