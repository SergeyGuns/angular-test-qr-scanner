import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { QrCodeScannerComponent } from './zxing-webcam-scanner/qr-code-scanner.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { UploadImageScannerComponent } from './upload-image-scanner/upload-image-scanner.component';
import { CanvasScannerComponent } from './canvas-scanner/canvas-scanner.component';


@NgModule({
  declarations: [
    AppComponent,
    QrCodeScannerComponent,
    UploadImageScannerComponent,
    CanvasScannerComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
