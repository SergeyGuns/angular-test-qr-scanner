import { AfterViewInit, Component, ViewChild } from "@angular/core";
import {
  BarcodeFormat,
  BrowserMultiFormatReader, DecodeHintType, NotFoundException,
  Result
} from "@zxing/library";
import { CharacterSetValueIdentifiers } from "@zxing/library/esm/core/common/CharacterSetECI";

enum CharSetPrefixMatch {
  "ST00011" = CharacterSetValueIdentifiers.Cp1251,
  "ST00012" = CharacterSetValueIdentifiers.UTF8,
  // "ST00013" = CharacterSetValueIdentifiers.koi8r
}

@Component({
  selector: "app-zxing-webcam-scanner",
  templateUrl: "./zxing-webcam-scanner.component.html",
  styleUrls: ["./zxing-webcam-scanner.component.scss"],
})
export class ZxingWebcamScannerComponent implements AfterViewInit {
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[];
  encodeResult: Result[] = [];
  hints = new Map();
  formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC];
  @ViewChild("video") videoElement;
  constructor() {}
  
  ngAfterViewInit(): void {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.codeReader = new BrowserMultiFormatReader(this.hints);
    this.codeReader.listVideoInputDevices().then((videoInputDevices) => {
      this.videoInputDevices = videoInputDevices;
      this.selectedDeviceId = videoInputDevices[1].deviceId;
    });
  }

  startEncode() {
    console.log({videoEl: this.videoElement.nativeElement})
    this.codeReader.decodeFromVideoDevice(
      this.selectedDeviceId,
      this?.videoElement?.nativeElement,
      this.decodeCallBack()
    );
  }

  decodeCallBack() {
    return (result, err) => {
      if (result) {
        console.log(result);
        console.log(this.detectCharSet(result.text))
        this.encodeResult.push(result);
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    }
  }

  detectCharSet(text:string) {
    const charSetPrefix = text.split('|')
    if(charSetPrefix?.length) {
      return charSetPrefix
    }
  }

  resetEncode() {
    this.codeReader.reset();
    this.encodeResult = [];
  }
  onChangeSelectDivices(ev): void {
    this.selectedDeviceId = ev.value;
  }
}
