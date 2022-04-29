import { AfterViewInit, Component, ViewChild } from "@angular/core";
import {
  BarcodeFormat,
  BrowserMultiFormatReader, DecodeHintType, NotFoundException,
  Result, StringUtils
} from "@zxing/library";

// ГОСТ Р 56042-2014
enum CharSetPrefix {
  ST00011 = "ST00011",
  ST00012 = "ST00012",
  ST00013 = "ST00013"
}

@Component({
  selector: "app-zxing-webcam-scanner",
  templateUrl: "./zxing-webcam-scanner.component.html",
  styleUrls: ["./zxing-webcam-scanner.component.scss"],
})
export class ZxingWebcamScannerComponent implements AfterViewInit {
  // ГОСТ Р 56042-2014
  CHAR_SET_PREFIX_MATCH_ENCODER = {
    [CharSetPrefix.ST00011]: 'cp1251',
    [CharSetPrefix.ST00012]: 'utf-8',
    [CharSetPrefix.ST00013]: 'koi8r'
  }
  decodeScannerResultByPrefix(prefix, scannerResult:Result):string {
    if(this.CHAR_SET_PREFIX_MATCH_ENCODER.hasOwnProperty(prefix)) {
      const charSetLabel = this.CHAR_SET_PREFIX_MATCH_ENCODER[prefix]
      const hints = new Map()
      hints.set(DecodeHintType.CHARACTER_SET, charSetLabel)
      return StringUtils.guessEncoding(scannerResult.getRawBytes(), hints)
    }
    return scannerResult.getText()
  }
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[];
  encodeResult: Result[] = [];
  encodeResultSplited: string[][] = [];
  hints = new Map();
  formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC];
  @ViewChild("video") videoElement;
  
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
    return (scannerResult, err) => {
      if (scannerResult) {
        let result = ''
        const [charSetPrefix, ...text] = scannerResult.text.split('|')
        const decodedResult = this.decodeScannerResultByPrefix(charSetPrefix, scannerResult)
        this.encodeResultSplited.push(this.decodeScannerResultByPrefix(charSetPrefix, scannerResult).split('|'))
        this.encodeResult.push(scannerResult);
        this.encodeResultSplited.push(text);
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    }
  }

  resetEncode() {
    this.codeReader.reset();
    this.encodeResult = [];
    this.encodeResultSplited = []
  }
  onChangeSelectDivices(ev): void {
    this.selectedDeviceId = ev.value;
  }
}
