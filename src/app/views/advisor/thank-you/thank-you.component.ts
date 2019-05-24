import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  userEmail;
  constructor() { }

  ngOnInit() {

    localStorage.removeItem('endUserId')
    localStorage.removeItem('endUserType')
    localStorage.removeItem('endUsername')
    localStorage.removeItem('authCode')
    localStorage.removeItem('emailApiType')
    localStorage.removeItem('token')
    localStorage.removeItem('userexpiryDate')
    localStorage.removeItem('userHeaderDetails')

    window.localStorage.clear();
    window.sessionStorage.clear();
  }
  submitEmail() {
  }
}
