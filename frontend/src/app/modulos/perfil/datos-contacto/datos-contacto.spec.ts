import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosContacto } from './datos-contacto';

describe('DatosContacto', () => {
  let component: DatosContacto;
  let fixture: ComponentFixture<DatosContacto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosContacto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosContacto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
