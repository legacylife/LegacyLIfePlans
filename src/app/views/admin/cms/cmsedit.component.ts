import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

@Component({
  selector: 'cmsedit',
  templateUrl: './cmsedit.component.html'
})
export class cmseditComponent implements OnInit {
  
  cmsForm: FormGroup
  constructor() {}

  ngOnInit() {
    const pagetitle = new FormControl('', Validators.required);

    this.cmsForm = new FormGroup({
      pagetitle: new FormControl('', [Validators.required]),
    })
  }

  signup() {
    const cmsData = this.cmsForm.value;
    console.log(cmsData);   
  }

}