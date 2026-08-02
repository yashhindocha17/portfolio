import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLog } from './access-log';

describe('AccessLog', () => {
  let component: AccessLog;
  let fixture: ComponentFixture<AccessLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessLog],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
