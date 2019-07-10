import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';

@Component({
  selector: 'card-details-modal',
  templateUrl: './card-details-modal.component.html',
  styleUrls: ['./card-details-modal.component.scss']
})
export class CardDetailsComponent implements OnInit {


  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog,
    ) {
  }

  ngOnInit() {
  
  }







}