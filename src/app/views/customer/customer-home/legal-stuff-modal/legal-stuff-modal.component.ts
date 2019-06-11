import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-stuff-modal',
  templateUrl: './legal-stuff-modal.component.html',
  styleUrls: ['./legal-stuff-modal.component.scss']
})
export class legalStuffModalComponent implements OnInit {


  constructor( ) { }


  ngOnInit() {
   }


}