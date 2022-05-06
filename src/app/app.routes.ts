import { Routes } from '@angular/router'
import { ZxingWebcamScannerComponent } from './zxing-webcam-scanner/zxing-webcam-scanner.component'

export enum PATHS {
  webCamScanner='web-cam-scanner'
}

export const routes: Routes = [
  { path: PATHS.webCamScanner, component: ZxingWebcamScannerComponent },
]
