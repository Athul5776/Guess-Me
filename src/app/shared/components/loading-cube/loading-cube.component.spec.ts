import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCubeComponent } from './loading-cube.component';

describe('LoadingCubeComponent', () => {
  let component: LoadingCubeComponent;
  let fixture: ComponentFixture<LoadingCubeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingCubeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadingCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
