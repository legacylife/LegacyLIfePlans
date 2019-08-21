import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
// import { MarkAsDeceasedComponent } from '../advisor-legacy-details/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { MarkAsDeceasedComponent } from './../../../views/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-advisor-home',
  templateUrl: './advisor-home.component.html',
  styleUrls: ['./advisor-home.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorHomeComponent implements OnInit, OnDestroy {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  public currentPage: any;
  dayFirst = true;
  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  public categories: any[];
  public activeCategory: string = 'all';
  public filterForm: FormGroup;
  public cart: any[];
  public cartData: any;
  customerLegaicesId:string=''

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userapi: UserAPIService,
    private router: Router, private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.categories = ["My essentials", "Pets"]
    this.cartData = []
    this.filterForm = this.fb.group({
      search: ['']
    })

    let urlData = this.userapi.getURLData();
    if (urlData.lastThird == "legacies") {
      this.customerLegaicesId = urlData.lastOne;
    }

  }
  showSecoDay() {
    this.dayFirst = false;
    this.daySeco = true;
  }
  ngOnDestroy() {

  }

  setActiveCategory(category) {
    this.activeCategory = category;
    this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  markAsDeceasedModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}
