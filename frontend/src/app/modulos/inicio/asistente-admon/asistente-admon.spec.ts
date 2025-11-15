import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenteAdmon } from './asistente-admon';

describe('AsistenteAdmon', () => {
  let component: AsistenteAdmon;
  let fixture: ComponentFixture<AsistenteAdmon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenteAdmon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenteAdmon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
