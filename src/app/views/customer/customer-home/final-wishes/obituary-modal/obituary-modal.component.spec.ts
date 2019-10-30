import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObituaryModalComponent } from './obituary-modal.component';

describe('ObituaryModalComponent', () => {
  let component: ObituaryModalComponent;
  let fixture: ComponentFixture<ObituaryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObituaryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObituaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
