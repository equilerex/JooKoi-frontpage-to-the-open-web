import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecimenPage } from './specimen.page';

describe('SpecimenPage', () => {
  let component: SpecimenPage;
  let fixture: ComponentFixture<SpecimenPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecimenPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecimenPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
