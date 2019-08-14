import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class DataSharingService {

  private messageSource = new BehaviorSubject("All");
  currentMessage = this.messageSource.asObservable();

  private shareDataSource = new BehaviorSubject("");
  userShareDataSource = this.shareDataSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  shareLegacyData(data: any) {
    this.shareDataSource.next(data)
  }

  clearData() {
    this.shareDataSource.next('')
  }


  getMessage(): Observable<any> {
    return this.shareDataSource.asObservable();
}

}