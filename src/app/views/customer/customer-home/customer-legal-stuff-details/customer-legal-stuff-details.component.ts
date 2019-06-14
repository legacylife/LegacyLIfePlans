import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { legalStuffModalComponent } from './../legal-stuff-modal/legal-stuff-modal.component';
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-legal-stuff-details.component.html',
  styleUrls: ['./customer-legal-stuff-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffDetailsComponent implements OnInit {
  //public isSideNavOpen: boolean; public viewMode: string = 'grid-view';  public currentPage: any;  dayFirst = true;  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  //public products: any[];  public categories: any[];  public activeCategory: string = 'all';  public filterForm: FormGroup;  public cart: any[];  public cartData: any;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  typeOfDocumentList: any[];
  re =  "/(?:\.([^.]+))?$/" ;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    // this.categories$ = this.shopService.getCategories();this.categories = ["My essentials", "Pets"]this.products = [] this.cartData = []  this.filterForm = this.fb.group({     search: ['']    })
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getEssentialLegalView();
  }

  //function to get all events
  getEssentialLegalView = (query = {}, search = false) => {
    this.loader.open();
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          this.row = result.data;
        }
      }
      this.loader.close();
    }, (err) => {
      console.error(err);
    })
  }

  openLegalStuffModals(FolderNames, isNew?) {

    let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent, {
      data: {
        FolderName: FolderNames,
        newName: FolderNames,
      },
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEssentialLegalView();
        if (!res) {
          // If user press cancel
          return;
        }
      })

  }

  deleteLegalStuff() {
    var statMsg = "Are you sure you want to delete legal stuff?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/delete-legal-stuff', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'legal-stuff'])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  getType(key) {

    if (this.row.subFolderName) {

      if(this.row.subFolderName=='Estate'){
        this.typeOfDocumentList = EstateTypeOfDocument;
      }else if(this.row.subFolderName=='Healthcare'){
        this.typeOfDocumentList = HealthcareTypeOfDocument;
      }else if(this.row.subFolderName=='Personal Affairs'){
        this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
      }


      let filteredTyes = this.typeOfDocumentList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
    }



  }
}
