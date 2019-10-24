import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'app-funeral-service-modal',
  templateUrl: './funeral-service-modal.component.html',
  styleUrls: ['./funeral-service-modal.component.scss'],
  animations: egretAnimations
})
export class FuneralServiceModalComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  firstServicesSec = true;
  allServicesSec = false;
  serviceOther = false;
  ceremonySec = false;
  reflectionsSec = false;
  eulogistSec = false;
  readingsSec = false;
  musiciansSec = false;
  pallbearersSec = false;



  selectAnyOneFormGroup: FormGroup;
  funeralOptions: string[] = [
    'I would prefer a traditional funeral', 
    'I would prefer a memorial service', 
    'I would prefer cremation', 
    'I do not want a funeral or memorial service'
  ];

  constructor(private fb: FormBuilder,private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.selectAnyOneFormGroup = this.fb.group({
      agencyOversees: new FormControl(''),
    });

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
      otherChecked: [false, Validators.required],
      leaderChecked: [false, Validators.required],
      eulogistChecked: [false, Validators.required],
      reflectionsChecked: [false, Validators.required],
      readingsChecked: [false, Validators.required],
      musiciansChecked: [false, Validators.required],
      pallbearersChecked: [false, Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
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

 otherChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.serviceOther = true;
  }else{
    this.serviceOther = false;
  }
}
leaderChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.ceremonySec = true;
  }else{
    this.ceremonySec = false;
  }
}
eulogistChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.eulogistSec = true;
  }else{
    this.eulogistSec = false;
  }
}
reflectionsChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.reflectionsSec = true;
  }else{
    this.reflectionsSec = false;
  }
}
readingsChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.readingsSec = true;
  }else{
    this.readingsSec = false;
  }
}
musiciansChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.musiciansSec = true;
  }else{
    this.musiciansSec = false;
  }
}
pallbearersChange(field) {
  this.firstFormGroup.get(field).setValue(!this.firstFormGroup.get(field).value)
  let getOtheVal =  this.firstFormGroup.get(field).value;  
  if(getOtheVal == true){
    this.pallbearersSec = true;
  }else{
    this.pallbearersSec = false;
  }
}









}
