import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
@Component({
  selector: 'app-forgot-password-successful',
  templateUrl: './forgot-password-successful.component.html',
  styleUrls: ['./password-reset-successful.component.css']
})
export class ForgotPasswordSuccessfulComponent implements OnInit {
  userEmail;

  constructor() { }

  ngOnInit() {
  }

}
