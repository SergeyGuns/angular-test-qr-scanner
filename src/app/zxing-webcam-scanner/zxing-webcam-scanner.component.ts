import { AfterViewInit, Component, ViewChild } from "@angular/core";
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  NotFoundException,
  Result
} from "../../vendor/zxingjs-library-es2015";

enum ScannerState {
  READING="Reading",
  SUCCESS="Success",
  ERROR="Error"
}

// ГОСТ Р 56042-2014
enum CharSetPrefix {
  ST00011 = "ST00011",
  ST00012 = "ST00012",
  ST00013 = "ST00013",
}

// BrowserMultiFormatReader.decodeFromVideoDevice

@Component({
  selector: "app-zxing-webcam-scanner",
  templateUrl: "./zxing-webcam-scanner.component.html",
  styleUrls: ["./zxing-webcam-scanner.component.scss"],
})
export class ZxingWebcamScannerComponent implements AfterViewInit {
  STATE = ScannerState
  // ГОСТ Р 56042-2014
  
  CHAR_SET_PREFIX_MATCH_ENCODER = {
    [CharSetPrefix.ST00011]: "Cp1251",
    [CharSetPrefix.ST00012]: "UTF8",
    [CharSetPrefix.ST00013]: "KOI8_R",
  };
  // decodeScannerResultByPrefix(prefix, scannerResult:Result):string {
  //   if(this.CHAR_SET_PREFIX_MATCH_ENCODER.hasOwnProperty(prefix)) {
  //     const charSetLabel = this.CHAR_SET_PREFIX_MATCH_ENCODER[prefix]
  //     const hints = new Map()
  //     hints.set(DecodeHintType.CHARACTER_SET, charSetLabel)
  //     const result = ZXingStringEncoding.decode(scannerResult.getRawBytes(), charSetLabel)
  //     return result
  //   }
  //   return scannerResult.getText()
  // }
  state:ScannerState = ScannerState.READING 
  encodeDefaultCharSet =
    this.CHAR_SET_PREFIX_MATCH_ENCODER[CharSetPrefix.ST00012];
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[] = [];
  encodeResult: Result[] = [];
  encodeResultSplited: string[][] = [];
  encodeRetryCount = 0
  MAX_ENCODERETRY_COUNT = 3
  
  hints = new Map();
  formats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ];
  @ViewChild("video") videoElement;

  ngAfterViewInit(): void {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.hints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);
    this.codeReader = new BrowserMultiFormatReader(this.hints);
    this.codeReader.listVideoInputDevices().then((videoInputDevices) => {
      this.videoInputDevices = videoInputDevices;
      this.selectedDeviceId =
        videoInputDevices[1]?.deviceId || videoInputDevices[0]?.deviceId;
    });
    this.startEncode();
  }

  startEncode() {
    console.log({ videoEl: this.videoElement.nativeElement });
    this.state = ScannerState.READING
    this.codeReader
      .decodeOnceFromVideoDevice(
        this.selectedDeviceId,
        this?.videoElement?.nativeElement
      )
      .then((result) => {
        this.decodeCallBack(result);
      })
      .catch(this.codeReaderErrorHandler);
  }

  decodeCallBack(scannerResult) {
    console.log(scannerResult.text)
    if(this.encodeRetryCount > this.MAX_ENCODERETRY_COUNT) {
      this.state = ScannerState.ERROR
      return this.resetEncode()
    }
    // this.encodeRetryCount++
    if (scannerResult) {
      const [charSetPrefix] = scannerResult.text.split("|");
      console.log({ before: scannerResult.text });
      console.log(
        this.CHAR_SET_PREFIX_MATCH_ENCODER[charSetPrefix],
        this.encodeDefaultCharSet
      );
      if (this.CHAR_SET_PREFIX_MATCH_ENCODER[charSetPrefix] && this.CHAR_SET_PREFIX_MATCH_ENCODER[charSetPrefix] !== this.encodeDefaultCharSet
      ) {
        this.encodeDefaultCharSet =
          this.CHAR_SET_PREFIX_MATCH_ENCODER[charSetPrefix];
        const newHints = new Map();
        newHints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
        newHints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);
        // this.codeReader.decodeOnce
        this.codeReader = new BrowserMultiFormatReader(newHints);
        this.codeReader.decodeOnceFromVideoDevice(
          this.selectedDeviceId,
          this?.videoElement?.nativeElement
        ).then((r)=>this.decodeCallBack(r))
        return;
      }
      this.state = ScannerState.SUCCESS
      console.log({ after: scannerResult.text });
      this.encodeResultSplited.push(scannerResult.text.split("|"));
      this.encodeResult.push(scannerResult);
    }
  }
  codeReaderErrorHandler(err) {
    if (err && !(err instanceof NotFoundException)) {
      console.error(err);
      this.state = ScannerState.ERROR
    }
  }
  resetEncode() {
    this.codeReader.reset();
    this.state = ScannerState.READING
    this.encodeResult = [];
    this.encodeResultSplited = [];
  }
  onChangeCamera() {
    console.log('change')
    // this.selectedDeviceId
    // this.videoInputDevices
    let nextDeviceIndex = 0
    const currDeviceIndex = this.videoInputDevices.findIndex((device) => device.deviceId === this.selectedDeviceId)
    if(currDeviceIndex !== this.videoInputDevices.length - 1) {
      nextDeviceIndex = currDeviceIndex+1
    } 
    this.selectedDeviceId = this.videoInputDevices[nextDeviceIndex].deviceId
    this.resetEncode()
    this.startEncode()
  }
  public hasMultipleCameras():boolean {
    return this.videoInputDevices.length > 1
  }
}
