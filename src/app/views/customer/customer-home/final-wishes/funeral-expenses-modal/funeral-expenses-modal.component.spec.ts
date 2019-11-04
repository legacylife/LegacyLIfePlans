import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuneralExpensesModalComponent } from './funeral-expenses-modal.component';

describe('FuneralExpensesModalComponent', () => {
  let component: FuneralExpensesModalComponent;
  let fixture: ComponentFixture<FuneralExpensesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuneralExpensesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuneralExpensesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
