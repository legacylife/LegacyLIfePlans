import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {
  MatDialogRef,
  MatDialog,
  MatSnackBar,
  MatSidenav
} from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Product } from "../../../../shared/models/product.model";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { Subscription, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { egretAnimations } from "../../../../shared/animations/egret-animations";
import { MarkAsDeceasedComponent } from "../mark-as-deceased-modal/mark-as-deceased-modal.component";
import { AppLoaderService } from "app/shared/services/app-loader/app-loader.service";
import { UserAPIService } from "app/userapi.service";

@Component({
  selector: "app-customer-shared-legacies",
  templateUrl: "./customer-shared-legacies.component.html",
  styleUrls: ["./customer-shared-legacies.component.scss"],
  animations: [egretAnimations]
})
export class CustomerSharedLegaciesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  endUserType: string;
  allSharedLegacyList: any[];
  allSharedLegacyLength:number=0

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loader: AppLoaderService,
    private userapi: UserAPIService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.getSharedLegacies();
  }

  getSharedLegacies() {
    const params = {
      query: Object.assign({ trustId: this.userId, status: { $ne: 'Deleted'} })
    };
    this.loader.open();
    this.userapi
      .apiRequest("post", "customer/shared-legacies-list", params)
      .subscribe(
        result => {
          if (result.status == "error") {
            console.log(result.data);
          } else {
            this.allSharedLegacyList = result.data.list;
            this.allSharedLegacyLength = this.allSharedLegacyList.length
          }
        }
      );
    this.loader.close();
  }
}
