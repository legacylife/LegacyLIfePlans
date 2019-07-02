import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { ProspectPeoplesModalComponent } from './prospect-peoples-modal/prospect-peoples-modal.component';


@Component({
  selector: 'app-advisor-leads-details',
  templateUrl: './advisor-leads-details.component.html',
  styleUrls: ['./advisor-leads-details.component.scss']
})
export class AdvisorLeadsDetailsComponent implements OnInit {
  allPeoples: any[];

  @ViewChild(MatBottomSheet) private sideNav: MatBottomSheet;
  constructor(private _bottomSheet: MatBottomSheet, _elementRef: ElementRef) { }


  ngOnInit() {

  }

  openMorePeople(): void {
    this._bottomSheet.open(ProspectPeoplesModalComponent);
  }

  // openBottomSheet() {
  //   const bottomSheet: MatBottomSheetRef<any> = this._bottomSheet.open(ProspectPeoplesModalComponent, {
  //     width: '720px'
  //   });
  // }


}
