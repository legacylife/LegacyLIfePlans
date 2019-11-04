import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebrationofLifeComponent } from './celebrationof-life.component';

describe('CelebrationofLifeComponent', () => {
  let component: CelebrationofLifeComponent;
  let fixture: ComponentFixture<CelebrationofLifeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CelebrationofLifeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CelebrationofLifeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
