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
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
