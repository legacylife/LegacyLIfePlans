
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-personal-profile-modal',
  templateUrl: './personal-profile-modal.component.html',
  styleUrls: ['./personal-profile-modal.component.scss']
})
export class PersonalProfileModalComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }
}


