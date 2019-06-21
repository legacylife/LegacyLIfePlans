import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'app-refer-and-earn-modal',
  templateUrl: './refer-and-earn-modal.component.html',
  styleUrls: ['./refer-and-earn-modal.component.scss']
})
export class ReferAndEarnModalComponent implements OnInit {
  selected = 'opt1';
  constructor(private dialog: MatDialog, ) { }

  ngOnInit() {
  }

  ReferSubmit() {
    this.dialog.closeAll();
  }

}

