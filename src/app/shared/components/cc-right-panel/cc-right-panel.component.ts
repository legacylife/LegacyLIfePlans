import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { APIService } from 'app/api.service';

@Component({
  selector: 'app-cc-right-panel',
  templateUrl: './cc-right-panel.component.html',
  styleUrls: ['./cc-right-panel.component.scss']
})
export class CcRightPanelComponent implements OnInit {

  articleTitle = "Most Viewed Articles";
  articleInfo  = []
  userType: String = ''

  @Input() private detailsLoaded: EventEmitter<boolean>;

  constructor(private api:APIService) { }

  ngOnInit() {
    this.userType = localStorage.getItem('endUserType')
    if( this.detailsLoaded ) {
      this.detailsLoaded.subscribe(data => {
        if( data ) {
          this.getMostViewedArticles()
        }
      })
    }
  }

  /**
   * @description : get most viewed top 5 articles as per users view by descending order
   * @param query : filter params for get posts
   * @param search : search textbox input to search the posts
   */
  getMostViewedArticles(query = {}, search = false) {
    const req_vars = {
      query: {},
      fields: {},
    }
    this.api.apiRequest('post', 'coach-corner-post/most-viewed-articles', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.articleInfo = []
      }
      else {
        this.articleInfo = result.data.articles
      }
    }, (err) => {
      console.error(err)
    })
  }
}
