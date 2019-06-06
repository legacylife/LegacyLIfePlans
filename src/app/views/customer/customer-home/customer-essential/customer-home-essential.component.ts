import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { EssenioalIdBoxComponent } from '../essenioal-id-box/essenioal-id-box.component';



@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home-essential.component.html',
  styleUrls: ['./customer-home-essential.component.scss'],
  animations: [egretAnimations]
})
export class CustomerHomeEssentialComponent implements OnInit {
 @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
  openAddIdBoxModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(EssenioalIdBoxComponent, {
      width: '720px',
      disableClose: true,
    })
  }

 
}
