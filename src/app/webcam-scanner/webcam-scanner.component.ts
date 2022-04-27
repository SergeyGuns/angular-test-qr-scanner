import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Html5QrcodeScanner, Html5QrcodeScanType} from "html5-qrcode";
@Component({
  selector: 'app-webcam-scanner',
  templateUrl: './webcam-scanner.component.html',
  styleUrls: ['./webcam-scanner.component.scss']
})
export class WebcamScannerComponent implements AfterViewInit {
  lastResult = 0
  countResults = 0
  scanner:Html5QrcodeScanner
  successResults: any[] = []
  @ViewChild("refScanner")
  public refScanner: ElementRef;
  
  ngAfterViewInit(): void {
    this.scanner = new Html5QrcodeScanner(
      "qr-reader", { fps: 10, qrbox: 250, supportedScanTypes:[Html5QrcodeScanType.SCAN_TYPE_CAMERA] },false);
    this.scanner.render(this.onScanSuccess.bind(this),this.onScanFailure.bind(this));
  }

  

  onScanFailure(error):void {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  }

  onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== this.lastResult) {
        ++this.countResults;
        this.lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);
        this.successResults.push(decodedResult)
    }
  }
}