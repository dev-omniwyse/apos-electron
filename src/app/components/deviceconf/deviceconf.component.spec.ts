import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceconfComponent } from './deviceconf.component';

describe('DeviceconfComponent', () => {
  let component: DeviceconfComponent;
  let fixture: ComponentFixture<DeviceconfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceconfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceconfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
