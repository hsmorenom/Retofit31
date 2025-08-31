import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordarClave } from './recordar-clave';

describe('RecordarClave', () => {
  let component: RecordarClave;
  let fixture: ComponentFixture<RecordarClave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordarClave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordarClave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
