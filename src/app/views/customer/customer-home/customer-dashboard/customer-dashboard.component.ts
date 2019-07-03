import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog, } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { addTrusteeModalComponent } from '../add-trustee-modal/add-trustee-modal.component';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';


@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardComponent implements OnInit {
  profilePicture: any = "assets/images/arkenea/default.jpg"
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  
  constructor(
    private route: ActivatedRoute, 
    private router: Router, private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private picService : ProfilePicService
  ) { }

  ngOnInit() {
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })
    
   
  }


  openAddTrusteeModal(data: any = {}, isNew?) {
   // let title = isNew ? 'Add new Trustees' : 'Update Trustees';
    let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {
      width: '720px',
      disableClose: true,
     // data: { title: title,payload: data }
    })
  }
}
