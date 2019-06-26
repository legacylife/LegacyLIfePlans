import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-prof-add-trustee-modal',
  templateUrl: './prof-add-trustee-modal.component.html',
  styleUrls: ['./prof-add-trustee-modal.component.scss']
})
export class ProfAddTrusteeModalComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  constructor( ) {}
  ngOnInit() {
    }

}


