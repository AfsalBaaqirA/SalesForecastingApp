import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictDataComponent } from './predict-data.component';

describe('PredictDataComponent', () => {
  let component: PredictDataComponent;
  let fixture: ComponentFixture<PredictDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
