import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialProgreso } from './historial-progreso';

describe('HistorialProgreso', () => {
  let component: HistorialProgreso;
  let fixture: ComponentFixture<HistorialProgreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialProgreso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialProgreso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
