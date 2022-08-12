import { Routes } from '@angular/router'
import { CanvasScannerComponent } from './canvas-scanner/canvas-scanner.component'
import { UploadImageScannerComponent } from './upload-image-scanner/upload-image-scanner.component'
import { QrCodeScannerComponent } from './zxing-webcam-scanner/qr-code-scanner.component'

export enum PATHS {
  webCamScanner='web-cam-scanner',
  uploadImageScanner='upload-image-scanner',
  canvasScanner='canvas-scanner'
}

export const routes: Routes = [
  { path: PATHS.webCamScanner, component: QrCodeScannerComponent },
]
