import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class DataSharingService {

  private messageSource = new BehaviorSubject("All");
  currentMessage = this.messageSource.asObservable();

  private shareDataSource = new BehaviorSubject("");
  userShareDataSource = this.shareDataSource.asObservable();

  private shareCoachesData = new BehaviorSubject("");
  userShareCochesSource = this.shareCoachesData.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  shareLegacyData(data: any) {
    this.shareDataSource.next(data)
  }

  shareChochesData(data: any) {
    this.shareCoachesData.next(data)
  }

  clearData() {
    this.shareDataSource.next('')
  }


  getMessage(): Observable<any> {
    return this.shareDataSource.asObservable();
}

}