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
  selector: 'app-send-an-email-modal',
  templateUrl: './send-an-email-modal.component.html',
  styleUrls: ['./send-an-email-modal.component.scss']
})
export class SendAnEmailComponent implements OnInit {
  selected = 'option1';
  constructor( ) { }

  ngOnInit() {

    }

  }

