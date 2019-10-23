import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'app-funeral-service-modal',
  templateUrl: './funeral-service-modal.component.html',
  styleUrls: ['./funeral-service-modal.component.scss'],
  animations: egretAnimations
})
export class FuneralServiceModalComponent implements OnInit {
  firstServicesSec = true;
  allServicesSec = false;
  selectAnyOneFormGroup: FormGroup;
  funeralOptions: string[] = [
    'I would prefer a traditional funeral', 
    'I would prefer a memorial service', 
    'I would prefer cremation', 
    'I do not want a funeral or memorial service'
  ];

  constructor(private fb: FormBuilder,) { }

  ngOnInit() {
    this.selectAnyOneFormGroup = this.fb.group({
      agencyOversees: new FormControl(''),
    });

  }

  onChange(value) {
    if(value == "I do not want a funeral or memorial service"){
     this.firstServicesSec = true;
     this.allServicesSec = false;
    }else{
     this.firstServicesSec = false;
     this.allServicesSec = true;
    }
 } 
 backToFirst() {
  this.firstServicesSec = true;
  this.allServicesSec = false;
 }
}
