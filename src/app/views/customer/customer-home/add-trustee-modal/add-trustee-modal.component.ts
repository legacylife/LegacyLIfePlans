import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { forEach } from "lodash";

@Component({
  selector: 'app-add-trustee-modal',
  templateUrl: './add-trustee-modal.component.html',
  styleUrls: ['./add-trustee-modal.component.scss']
})
export class addTrusteeModalComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  constructor( ) {}
  
  ngOnInit() {
    }

onChangeFormIndex(event){
  const {selectedIndex} = event;
  let stepHeader = document.getElementsByClassName('mat-horizontal-stepper-header')
  forEach(stepHeader, (element, index) => {
    element.classList = String(element.classList).replace('proActive', '')
    element.classList = String(element.classList).replace('proDone', '')
      if(index === selectedIndex){
        element.classList += ' proActive';
      }
      if(index < selectedIndex){
      element.classList += ' proDone';
      }
  });
}
}


