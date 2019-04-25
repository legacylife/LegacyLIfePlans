import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
@Component({
  selector: 'app-password-reset-successful',
  templateUrl: './password-reset-successful.component.html',
  styleUrls: ['./password-reset-successful.component.css']
})
export class PasswordResetSuccessfulComponent implements OnInit {
  userEmail;

  constructor() { }

  ngOnInit() {
  }

}
