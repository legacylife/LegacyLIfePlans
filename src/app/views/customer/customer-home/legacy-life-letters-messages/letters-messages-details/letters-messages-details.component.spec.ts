import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersMessagesDetailsComponent } from './letters-messages-details.component';

describe('LettersMessagesDetailsComponent', () => {
  let component: LettersMessagesDetailsComponent;
  let fixture: ComponentFixture<LettersMessagesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LettersMessagesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LettersMessagesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
