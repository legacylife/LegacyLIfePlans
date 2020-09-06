import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  
  constructor(private router: Router, private api: APIService, private snack: MatSnackBar, private idle: Idle, private keepalive: Keepalive) {

    // sets an idle timeout of 900 seconds i.e 15 mins, for testing purposes.
    idle.setIdle(900);
    // sets a timeout period of 5 seconds. after 905 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(5);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      alert("You session has been inactivated.")
      console.log('?????',this.idleState)
      this.idleState = 'No longer idle.'
      this.api.logout()
      
    });
    idle.onTimeout.subscribe(() => {      
      this.idleState = 'Timed out!';
      this.timedOut = true;
    });
    idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!'); 
    idle.onTimeoutWarning.subscribe((countdown) => 
        this.idleState = 'You will time out in ' + countdown + ' seconds!'        
    );
    

    // sets the ping interval to 15 seconds
    keepalive.interval(900);

    keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

      this.userInfo = this.api.getUserInfo();
      if (this.userInfo.userType == '') {
        //this.router.navigateByUrl('/llp-admin/signin');
        this.api.logout();
        return false;
      }
     
      const req_vars = { userId: this.userInfo.userId }
      this.api.apiRequest('post', 'auth/view', req_vars).subscribe(result => { 
        let userData = result.data;   
        localStorage.setItem('sectionAccess', JSON.stringify(userData.sectionAccess))
        if(userData && (userData.status == 'Inactive' || userData.status == 'Inactive')){
          this.snack.open("Your account has been inactivated.", 'OK', { duration: 4000 })
          //this.router.navigateByUrl('/llp-admin/signin');
          this.api.logout(); 
          return false;
         }
         else {
          this.reset();
         }
        
      }, (err) => {
        //console.error(err)
      })
    
    return true;
  }


  reset() {
    console.log('Idle state started....');
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }


}