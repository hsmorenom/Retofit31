import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Antropometricos } from './antropometricos';

describe('Antropometricos', () => {
  let component: Antropometricos;
  let fixture: ComponentFixture<Antropometricos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Antropometricos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Antropometricos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
