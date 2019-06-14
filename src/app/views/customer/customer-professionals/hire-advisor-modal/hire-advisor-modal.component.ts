import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hire-advisor-modal',
  templateUrl: './hire-advisor-modal.component.html',
  styleUrls: ['./hire-advisor-modal.component.scss']
})
export class HireAdvisorComponent implements OnInit {
  selected = 'option1';
  constructor( ) { }

  ngOnInit() {

    }

  }

