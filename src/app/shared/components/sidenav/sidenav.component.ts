import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { InviteComponent } from '../header-top/invite-modal/invite-modal.component';
import { TodosComponent } from 'app/views/todos/todos.component';
import { LayoutService } from 'app/shared/services/layout.service';
import { ReferAndEarnModalComponent } from 'app/views/refer-and-earn-modal/refer-and-earn-modal.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.template.html'
})
export class SidenavComponent {
  @Input('items') public menuItems: any[] = [];
  @Input('hasIconMenu') public hasIconTypeMenuItem: boolean;
  @Input('iconMenuTitle') public iconTypeMenuTitle: string;

  constructor(
    private dialog: MatDialog,
    private layout: LayoutService,
  ) { }
  ngOnInit() { }

  // Only for demo purpose
  addMenuItem() {
    this.menuItems.push({
      name: 'ITEM',
      type: 'dropDown',
      tooltip: 'Item',
      icon: 'done',
      state: 'material',
      sub: [
        { name: 'SUBITEM', state: 'cards' },
        { name: 'SUBITEM', state: 'buttons' }
      ]
    });
  }

  closeSidenav(item?: any) {
   
    if (!item.state.includes('admin')) {
      this.layout.publishLayoutChange({
        sidebarStyle: 'closed'
      })
    }

  }

  openSmModal(name) {
    switch (name) {

      case "Invite":
        let dialogRef: MatDialogRef<any> = this.dialog.open(InviteComponent, {
          width: '720px',
          disableClose: true,
        });

        break;

      case "Invite ad":
        let dialogRef0: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
          width: '720px',
          disableClose: true,
        });

        break;

      case "To dos":
        let dialogRef1: MatDialogRef<any> = this.dialog.open(TodosComponent, {
          width: '720px',
          disableClose: true,
        });

        break;

      case "To dos ad":
        let dialogRef2: MatDialogRef<any> = this.dialog.open(TodosComponent, {
          width: '720px',
          disableClose: true,
        });

      default:
        break;
    }


  }

}