import {Subject} from 'rxjs/Subject';   
import { Injectable } from '@angular/core';
import {  FormControl } from '@angular/forms';
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

 public noWhitespaceValidator(control: FormControl) {
  if(typeof control.value == 'undefined' || control.value==null){
      return null;
  }
  else if(control.value.length==0){
      return null;
  }
  else{
      let isWhitespace = (control.value || '').trim().length === 0;
      let isValid = !isWhitespace;
      return isValid ? null : { 'required': true }  
  }
}
}