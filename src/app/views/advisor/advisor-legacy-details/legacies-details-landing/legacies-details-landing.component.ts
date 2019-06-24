import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { MarkAsDeceasedComponent } from '../mark-as-deceased-modal/mark-as-deceased-modal.component';


@Component({
  selector: 'app-legacies-details-landing',
  templateUrl: './legacies-details-landing.component.html',
  styleUrls: ['./legacies-details-landing.component.scss'],
  animations: [egretAnimations]
})
export class LegaciesDetailsLandingComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  legacyBox: any[];

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
  ) { }



  ngOnInit() {
    this.legacyBox = [
      {
        name : 'John Smith',
        photo : 'assets/images/arkenea/john.png',
        action : 'View Plan '
      },
      {
        name : 'Emily Doe',
        photo : 'assets/images/arkenea/emily.png',
        action : 'View Plan '
      },
      {
        name : 'Johnson Smith',
        photo : 'assets/images/arkenea/ca.jpg',
        action : 'View Plan '
      },
      {
        name : 'James Anderson',
        photo : 'assets/images/arkenea/james.png',
        action : 'View Plan '
      },
      {
        name : 'Johnson Smith',
        photo : 'assets/images/arkenea/user-male.png',
        action : 'View Plan '
      },
      {
        name : 'John Doe',
        photo : 'assets/images/arkenea/john.png',
        action : 'View Plan '
      }];
  }


  markAsDeceasedModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
    })
  }


}
