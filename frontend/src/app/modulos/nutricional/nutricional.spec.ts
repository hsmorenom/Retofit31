import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nutricional } from './nutricional';

describe('Nutricional', () => {
  let component: Nutricional;
  let fixture: ComponentFixture<Nutricional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nutricional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nutricional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
