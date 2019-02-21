import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMagneticProductComponent } from './add-magnetic-product.component';

describe('AddMagneticProductComponent', () => {
  let component: AddMagneticProductComponent;
  let fixture: ComponentFixture<AddMagneticProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMagneticProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMagneticProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
