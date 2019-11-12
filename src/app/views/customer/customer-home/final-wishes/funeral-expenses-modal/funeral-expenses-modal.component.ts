import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-funeral-expenses-modal',
  templateUrl: './funeral-expenses-modal.component.html',
  styleUrls: ['./funeral-expenses-modal.component.scss']
})
export class FuneralExpensesModalComponent implements OnInit {
  colFormGroup: FormGroup;
  preneedContract = false;
  madePrearrangment = false;

  toppings = new FormControl();
  toppingList: string[] = [
    'Basic professional services',
    'Casket',
    'Alternative Container',
    'Urn for cremains',
    'Body preparation',
    'Embalming',
    'Public or family viewing or visitation',
    'Service at the mortuary',
    'Crematory fee',
    'Transportation of the body',
    'Graveside service',
    'Obituary preparation',
    'Copies of death certificate',
    'Burial clothing',
    'Recording of service',
    'Preparation of the photo DVD or CD',
    'Memorial book',
    'Memorial folders or service bulletin',
    'Limousine for family members',
    'Outer burial vault or grave liner',
    'Grave plot'
  ];

  
  constructor(private fb: FormBuilder,private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.colFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
  }
  onChange(value){
    if (value == "opt1") {
      this.madePrearrangment = true;
      this.preneedContract = false;
    } else  if (value == "opt2") {
      this.madePrearrangment = false;
      this.preneedContract = true;
    } else {
      this.preneedContract = false;
      this.preneedContract = false;
    }
  }

}
