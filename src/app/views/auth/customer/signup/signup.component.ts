import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class CustomerSignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  signupForm: FormGroup;
  custFreeTrailBtn = false;
  custProceedBtn = true;
  custOtpSec = false;
  constructor() {}

  ngOnInit() {
    const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: password,
      confirmPassword: confirmPassword,
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if(!agreed) {
          return { agreed: true }
        }
        return null;
      })
    })
  }

  custProceed() {
    this.custFreeTrailBtn = true;
    this.custProceedBtn = false;
    this.custOtpSec = true;
  }

}
