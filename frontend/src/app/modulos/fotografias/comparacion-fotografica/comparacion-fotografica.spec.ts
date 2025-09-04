import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparacionFotografica } from './comparacion-fotografica';

describe('ComparacionFotografica', () => {
  let component: ComparacionFotografica;
  let fixture: ComponentFixture<ComparacionFotografica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparacionFotografica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparacionFotografica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
