import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cc-right-panel',
  templateUrl: './cc-right-panel.component.html',
  styleUrls: ['./cc-right-panel.component.scss']
})
export class CcRightPanelComponent implements OnInit {

  articleTitle = "Most Viewed Articles";
  articleInfo= [];
  constructor() { }

  ngOnInit() {
    this.articleInfo = [{
      articleImg: "assets/images/arkenea/smallimg-1.png",
      articleName: "Hiring Interviews Info",
      articleViews: "1.2k Views"
    },
    {
      articleImg: "assets/images/arkenea/smallimg-2.png",
      articleName: "New LLP Plans Releases",
      articleViews: "1.0k Views"
    },
    {
      articleImg: "assets/images/arkenea/smallimg-3.png",
      articleName: "About Hired Trustees",
      articleViews: "989 Views"
    },
    {
      articleImg: "assets/images/arkenea/smallimg-4.png",
      articleName: "LLP Hiring Interviews",
      articleViews: "700 Views"
    },
    {
      articleImg: "assets/images/arkenea/smallimg-5.png",
      articleName: "About Hired Trustees",
      articleViews: "1.2k Views"
    }]
  }

}
