import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss']
})
export class VideoModalComponent implements OnInit {

  constructor(private dialog: MatDialog,) { }

  ngOnInit() {
  }

  closeModal(): void {
    this.dialog.closeAll();
}

}
