import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialog,MAT_DIALOG_DATA  } from '@angular/material';
@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss']
})
export class VideoModalComponent implements OnInit {
  title:string = ''
  subtitle:string = ''
  videoLink:string = ''
  constructor(private dialog: MatDialog ,@Inject(MAT_DIALOG_DATA) public data: any,) { 
    this.title = data.title;this.subtitle = data.subtitle;this.videoLink = data.videoLink;
  }

  ngOnInit() {
  }

  closeModal(): void {
    this.dialog.closeAll();
}

}
