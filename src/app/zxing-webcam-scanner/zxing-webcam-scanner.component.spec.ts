import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZxingWebcamScannerComponent } from './zxing-webcam-scanner.component';

describe('ZxingWebcamScannerComponent', () => {
  let component: ZxingWebcamScannerComponent;
  let fixture: ComponentFixture<ZxingWebcamScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZxingWebcamScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZxingWebcamScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
