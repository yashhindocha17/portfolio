import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseFiles } from './case-files';

describe('CaseFiles', () => {
  let component: CaseFiles;
  let fixture: ComponentFixture<CaseFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseFiles],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseFiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
