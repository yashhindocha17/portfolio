import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluidBg } from './fluid-bg';

describe('FluidBg', () => {
  let component: FluidBg;
  let fixture: ComponentFixture<FluidBg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluidBg],
    }).compileComponents();

    fixture = TestBed.createComponent(FluidBg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
