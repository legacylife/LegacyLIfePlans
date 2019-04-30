import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild(MatButton) submitButton: MatButton;

  otpsec = false;
  llpsigninForm: FormGroup; 
  constructor(private fb: FormBuilder) { }

  ngOnInit() {

  this.llpsigninForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }

  loginClick() {
    this.otpsec = true;
  }
  
  llpsignup () {
    // alert('hi');
    // const signupData = this.llpsigninForm.value;
    // console.log(signupData);

    // this.submitButton.disabled = true;
  }

}
