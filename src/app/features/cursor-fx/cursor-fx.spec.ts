import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursorFx } from './cursor-fx';

describe('CursorFx', () => {
  let component: CursorFx;
  let fixture: ComponentFixture<CursorFx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursorFx],
    }).compileComponents();

    fixture = TestBed.createComponent(CursorFx);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
