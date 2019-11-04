import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-obituary-modal',
  templateUrl: './obituary-modal.component.html',
  styleUrls: ['./obituary-modal.component.scss']
})
export class ObituaryModalComponent implements OnInit {
  colFormGroup: FormGroup;

  constructor(private fb: FormBuilder,private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.colFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
  }

}
