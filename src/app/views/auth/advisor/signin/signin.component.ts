import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class AdvisorSigninComponent implements OnInit {
  // @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  // @ViewChild(MatButton) submitButton: MatButton;

  signinForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    })
  }

  signin() {
    const signinData = this.signinForm.value
    console.log(signinData);
  }

}
