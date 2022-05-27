import { AfterViewInit, Component, ViewChild } from "@angular/core";
import {
  BarcodeFormat,
  BinaryBitmap,
  BrowserMultiFormatReader,
  DecodeHintType,
  NotFoundException,
  Result,
  ResultMetadataType,
} from "../../vendor/zxingjs-library-es2015";
import {
  CharSetPrefix,
  chekingCharSet,
  CHEKING_STATUS,
} from "../utils/scanner";

enum ScannerState {
  READING = "Reading",
  SUCCESS = "Success",
  LOADING = "Loading",
  ERROR = "Error",
}

type CharSet = "Cp1251" | "UTF8" | "KOI8_R"| '';

@Component({
  selector: "app-zxing-webcam-scanner",
  templateUrl: "./zxing-webcam-scanner.component.html",
  styleUrls: ["./zxing-webcam-scanner.component.scss"],
})
export class ZxingWebcamScannerComponent implements AfterViewInit {
  STATE = ScannerState;
  CHAR_SET_PREFIX_MATCH_ENCODER = {
    [CharSetPrefix.ST00011]: "Cp1251",
    [CharSetPrefix.ST00012]: "UTF8",
    [CharSetPrefix.ST00013]: "KOI8_R",
  };

  state: ScannerState = ScannerState.READING;
  public encodeDefaultCharSet:CharSet = "UTF8"
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[] = [];
  result: string[] = [];
  resultSplited: string[][] = [];
  resultVariants: any;

  encodeRetryCount = 0;
  MAX_ENCODERETRY_COUNT = 3;

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
    this.state = ScannerState.READING;
    this.codeReader
      .decodeOnceFromVideoDevice(
        this.selectedDeviceId,
        this?.videoElement?.nativeElement
      )
      .then((result) => {
        this.decodeCallBack(result);
      })
      .catch((err) => this.codeReaderErrorHandler(err));
  }

  decodeBitmap(
    image: BinaryBitmap,
    charSet: CharSet
  ): [CHEKING_STATUS, Result] {
    const newHints = new Map();
    newHints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    newHints.set(DecodeHintType.CHARACTER_SET, charSet);
    const result = new BrowserMultiFormatReader(newHints).decodeBitmap(image);
    return [chekingCharSet(result.getText()), result];
  }

  decodeCallBack(scannerResult: Result) {
    console.log('UTF8', scannerResult.getText());
    const chekingCharsetStatus = chekingCharSet(scannerResult.getText());
    const imageBitmap = scannerResult
      .getResultMetadata()
      .get(ResultMetadataType.BINARY_BITMAP) as BinaryBitmap;
    if (chekingCharsetStatus === CHEKING_STATUS.NSPK_OK) {
      this.fixResultScanner(scannerResult, 'UTF8');
    } else if (chekingCharsetStatus === CHEKING_STATUS.GOST_OK) {
      this.fixResultScanner(scannerResult);
    } else if (chekingCharsetStatus === CHEKING_STATUS.INVALID_ERR || chekingCharsetStatus === CHEKING_STATUS.KOI8R_ERR) {
      const anotherCharsetResults: any = {}
      const [cpStatus, cpResult ] = this.decodeBitmap(imageBitmap, 'Cp1251')
      console.log('Cp1252', cpResult.getText());
      anotherCharsetResults[cpStatus] = cpResult
      const [koStatus, koResult] = this.decodeBitmap(imageBitmap, 'KOI8_R')
      console.log('KOI8_R', koResult.getText());
      anotherCharsetResults[koStatus] = koResult
      if(anotherCharsetResults[CHEKING_STATUS.GOST_OK]) {
        this.fixResultScanner(anotherCharsetResults[CHEKING_STATUS.GOST_OK])
      } else {
        this.fixResultScanner(scannerResult,'UTF8')
        this.fixResultScanner(cpResult,'Cp1251')
        this.fixResultScanner(koResult,'KOI8_R')
        this.codeReaderErrorHandler('Проблема')
      }

    } else {
      this.codeReaderErrorHandler('Проблема')
    }
  }

  codeReaderErrorHandler(err) {
    console.log(err);
    this.state = ScannerState.ERROR;
    if (err && !(err instanceof NotFoundException)) {
      console.error(err);
    }
  }

  fixResultScanner(result: Result, charSet:CharSet = '') {
    
    this.resultSplited.push(result.getText().split("|"));
    this.result.push(charSet+' ' + result.getText());
  }
  resetEncode() {
    this.codeReader.reset();
    this.state = ScannerState.READING;
    this.result = [];
    this.resultSplited = [];
  }
  onChangeCamera() {
    console.log("change");
    // this.selectedDeviceId
    // this.videoInputDevices
    let nextDeviceIndex = 0;
    const currDeviceIndex = this.videoInputDevices.findIndex(
      (device) => device.deviceId === this.selectedDeviceId
    );
    if (currDeviceIndex !== this.videoInputDevices.length - 1) {
      nextDeviceIndex = currDeviceIndex + 1;
    }
    this.selectedDeviceId = this.videoInputDevices[nextDeviceIndex].deviceId;
    this.resetEncode();
    this.startEncode();
  }
  public hasMultipleCameras(): boolean {
    return this.videoInputDevices.length > 1;
  }
}
