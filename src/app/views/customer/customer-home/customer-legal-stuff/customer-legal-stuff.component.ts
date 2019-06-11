import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { legalStuffModalComponent } from '../legal-stuff-modal/legal-stuff-modal.component';


@Component({
  selector: 'app-customer-legal-stuff',
  templateUrl: './customer-legal-stuff.component.html',
  styleUrls: ['./customer-legal-stuff.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffComponent implements OnInit {


  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }



  openLegalStuffModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent, {
      width: '720px',
      disableClose: true,
    })
  }

}
