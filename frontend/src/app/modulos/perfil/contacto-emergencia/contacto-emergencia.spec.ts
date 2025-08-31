import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoEmergencia } from './contacto-emergencia';

describe('ContactoEmergencia', () => {
  let component: ContactoEmergencia;
  let fixture: ComponentFixture<ContactoEmergencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoEmergencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoEmergencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
