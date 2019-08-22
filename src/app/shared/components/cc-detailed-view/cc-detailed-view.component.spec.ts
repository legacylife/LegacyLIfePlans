import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcDetailedViewComponent } from './cc-detailed-view.component';

describe('CcDetailedViewComponent', () => {
  let component: CcDetailedViewComponent;
  let fixture: ComponentFixture<CcDetailedViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcDetailedViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcDetailedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
