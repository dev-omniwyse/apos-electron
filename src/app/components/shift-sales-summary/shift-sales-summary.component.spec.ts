import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSalesSummaryComponent } from './shift-sales-summary.component';

describe('ShiftSalesSummaryComponent', () => {
  let component: ShiftSalesSummaryComponent;
  let fixture: ComponentFixture<ShiftSalesSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftSalesSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftSalesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
