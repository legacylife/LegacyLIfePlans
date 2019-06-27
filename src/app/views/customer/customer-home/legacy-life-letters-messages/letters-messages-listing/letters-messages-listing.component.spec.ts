import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersMessagesListingComponent } from './letters-messages-listing.component';

describe('LettersMessagesListingComponent', () => {
  let component: LettersMessagesListingComponent;
  let fixture: ComponentFixture<LettersMessagesListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LettersMessagesListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LettersMessagesListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
