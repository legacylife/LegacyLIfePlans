import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosListingComponent } from './todos-listing.component';

describe('TodosListingComponent', () => {
  let component: TodosListingComponent;
  let fixture: ComponentFixture<TodosListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodosListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
