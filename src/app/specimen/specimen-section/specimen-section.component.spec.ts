import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecimenSectionComponent } from './specimen-section.component';

describe('SpecimenSectionComponent', () => {
  let component: SpecimenSectionComponent;
  let fixture: ComponentFixture<SpecimenSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecimenSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecimenSectionComponent);
    // `label` is `input.required`, so it must be set before the first render.
    fixture.componentRef.setInput('label', 'Specimen');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
