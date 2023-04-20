import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPredictionsComponent } from './view-predictions.component';

describe('ViewPredictionsComponent', () => {
  let component: ViewPredictionsComponent;
  let fixture: ComponentFixture<ViewPredictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPredictionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPredictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
