import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clearance } from './clearance';

describe('Clearance', () => {
  let component: Clearance;
  let fixture: ComponentFixture<Clearance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clearance],
    }).compileComponents();

    fixture = TestBed.createComponent(Clearance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
