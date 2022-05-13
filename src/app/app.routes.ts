import { Routes } from '@angular/router'
import { UploadImageScannerComponent } from './upload-image-scanner/upload-image-scanner.component'
import { ZxingWebcamScannerComponent } from './zxing-webcam-scanner/zxing-webcam-scanner.component'

export enum PATHS {
  webCamScanner='web-cam-scanner',
  uploadImageScanner='upload-image-scanner'
}

export const routes: Routes = [
  { path: PATHS.webCamScanner, component: ZxingWebcamScannerComponent },
  { path: PATHS.uploadImageScanner, component: UploadImageScannerComponent}
]
