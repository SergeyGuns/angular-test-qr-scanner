import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebcamScannerComponent } from './webcam-scanner/webcam-scanner.component';
import { ZxingWebcamScannerComponent } from './zxing-webcam-scanner/zxing-webcam-scanner.component';

@NgModule({
  declarations: [
    AppComponent,
    WebcamScannerComponent,
    ZxingWebcamScannerComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
