import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';


@Component({
  selector: 'app-customer-professionals-details',
  templateUrl: './customer-professionals-details.component.html',
  styleUrls: ['./customer-professionals-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerProfDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profileData: any;
  about: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
  ) { }


  ngOnInit() {


    this.profileData = {
      proName: 'Mary, Jason & Hodge of Attorney',
      proDomain: 'www.mjhattorenys.com',
      proJob: 'Attorney, Insurance Agent',
      proExp: '12 years',
      proPhone: '+8654321234',
      proLocation: '12  street, Silicon Valley,Avenue NE, Huntsville',
    };

    this.about = "Lawyer James Anderson once made his mark on the football field as a highschool All - State; and All - American football player.Today he isknown for his courtroom skills as partner with Mary, Jason & Hodge of Attorney Huntsville, Alabama.Morris is a lifelong Alabamian who has been practicing law in Huntsville since earning his law degree from the Attorneys High School."
  };





}
