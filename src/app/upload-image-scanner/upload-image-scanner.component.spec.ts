import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImageScannerComponent } from './upload-image-scanner.component';

describe('UploadImageScannerComponent', () => {
  let component: UploadImageScannerComponent;
  let fixture: ComponentFixture<UploadImageScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadImageScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImageScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
