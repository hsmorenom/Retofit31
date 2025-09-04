import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirFotografia } from './subir-fotografia';

describe('SubirFotografia', () => {
  let component: SubirFotografia;
  let fixture: ComponentFixture<SubirFotografia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirFotografia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirFotografia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
