import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenteSaludDeportiva } from './asistente-salud-deportiva';

describe('AsistenteSaludDeportiva', () => {
  let component: AsistenteSaludDeportiva;
  let fixture: ComponentFixture<AsistenteSaludDeportiva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenteSaludDeportiva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenteSaludDeportiva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
