import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcRightPanelComponent } from './cc-right-panel.component';

describe('CcRightPanelComponent', () => {
  let component: CcRightPanelComponent;
  let fixture: ComponentFixture<CcRightPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcRightPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
