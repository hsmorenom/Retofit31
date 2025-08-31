import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBasica } from './info-basica';

describe('InfoBasica', () => {
  let component: InfoBasica;
  let fixture: ComponentFixture<InfoBasica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBasica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoBasica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
