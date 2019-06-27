import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersMessagesModelComponent } from './letters-messages-model.component';

describe('LettersMessagesModelComponent', () => {
  let component: LettersMessagesModelComponent;
  let fixture: ComponentFixture<LettersMessagesModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LettersMessagesModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LettersMessagesModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
