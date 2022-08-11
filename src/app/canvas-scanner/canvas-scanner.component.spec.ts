import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasScannerComponent } from './canvas-scanner.component';

describe('CanvasScannerComponent', () => {
  let component: CanvasScannerComponent;
  let fixture: ComponentFixture<CanvasScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
