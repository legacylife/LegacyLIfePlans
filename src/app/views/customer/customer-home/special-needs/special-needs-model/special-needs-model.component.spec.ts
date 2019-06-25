import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialNeedsModelComponent } from './special-needs-model.component';

describe('SpecialNeedsModelComponent', () => {
  let component: SpecialNeedsModelComponent;
  let fixture: ComponentFixture<SpecialNeedsModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialNeedsModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialNeedsModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
