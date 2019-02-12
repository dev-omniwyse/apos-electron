import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadcardComponent } from './readcard.component';

describe('ReadcardComponent', () => {
  let component: ReadcardComponent;
  let fixture: ComponentFixture<ReadcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
