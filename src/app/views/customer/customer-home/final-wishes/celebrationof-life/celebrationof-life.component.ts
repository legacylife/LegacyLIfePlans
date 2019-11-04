import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-celebrationof-life',
  templateUrl: './celebrationof-life.component.html',
  styleUrls: ['./celebrationof-life.component.scss']
})
export class CelebrationofLifeComponent implements OnInit {
  colFormGroup: FormGroup;

  constructor(private fb: FormBuilder,private _formBuilder: FormBuilder) { }

  ngOnInit() {

    this.colFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });

  }


 

}
