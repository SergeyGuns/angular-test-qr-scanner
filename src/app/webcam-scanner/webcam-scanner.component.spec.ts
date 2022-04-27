import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamScannerComponent } from './webcam-scanner.component';

describe('WebcamScannerComponent', () => {
  let component: WebcamScannerComponent;
  let fixture: ComponentFixture<WebcamScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebcamScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcamScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
