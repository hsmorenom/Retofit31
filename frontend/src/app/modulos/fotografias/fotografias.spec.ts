import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fotografias } from './fotografias';

describe('Fotografias', () => {
  let component: Fotografias;
  let fixture: ComponentFixture<Fotografias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fotografias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fotografias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
