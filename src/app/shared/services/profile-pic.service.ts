import {Subject} from 'rxjs/Subject';   
import { Injectable } from '@angular/core';

@Injectable()
export class ProfilePicService {
 itemValue = new Subject();

 set setProfilePic(value) {
   this.itemValue.next(value); // this will make sure to tell every subscriber about the change.
   localStorage.setItem('endUserProfilePicture', value);
 }

 get getProfilePic() {
   return localStorage.getItem('endUserProfilePicture');
 }
}