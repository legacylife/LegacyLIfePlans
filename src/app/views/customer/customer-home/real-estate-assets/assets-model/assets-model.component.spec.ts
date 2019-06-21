import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsModelComponent } from './assets-model.component';

describe('AssetsModelComponent', () => {
  let component: AssetsModelComponent;
  let fixture: ComponentFixture<AssetsModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
