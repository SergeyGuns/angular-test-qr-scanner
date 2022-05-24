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
import { CharSetPrefix, chekingCharSet, CHEKING_STATUS } from "../utils/scanner";

enum ScannerState {
  READING = "Reading",
  SUCCESS = "Success",
  LOADING = "Loading",
  ERROR = "Error",
}

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
  public encodeDefaultCharSet =
    this.CHAR_SET_PREFIX_MATCH_ENCODER[CharSetPrefix.ST00012];
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[] = [];
  result: Result[] = [];
  resultSplited: string[][] = [];
  resultVariants: any

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

  decodeCallBack(scannerResult:Result) {
    console.log(scannerResult.getText());
    if(chekingCharSet(scannerResult.getText()) === CHEKING_STATUS.INVALID_ERR) {
      this.encodeDefaultCharSet = "Cp1251";
        const newHints = new Map();
        newHints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
        newHints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);
        // this.codeReader.decodeOnce
        this.codeReader = new BrowserMultiFormatReader(newHints);
        new Promise((resolve, reject) => {
          try{
            console.log(scannerResult.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP))
            const imgBitmap:BinaryBitmap = scannerResult.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP) as BinaryBitmap
            resolve(this.codeReader.decodeBitmap(imgBitmap))
          } catch(e) {
            reject(e)
          }
        }).then((result:Result) => this.fixResultScanner(result) )
    } 
    
    if(chekingCharSet(scannerResult.getText()) === CHEKING_STATUS.KOI8R_ERR) {
      this.encodeDefaultCharSet = "KOI8_R";
        const newHints = new Map();
        newHints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
        newHints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);
        // this.codeReader.decodeOnce
        this.codeReader = new BrowserMultiFormatReader(newHints);
        new Promise((resolve, reject) => {
          try{
            console.log(scannerResult.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP))
            const imgBitmap:BinaryBitmap = scannerResult.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP) as BinaryBitmap
            resolve(this.codeReader.decodeBitmap(imgBitmap))
          } catch(e) {
            reject(e)
          }
        }).then((result:Result) => this.fixResultScanner(result) )
    }
    if (scannerResult) {
      const [charSetPrefix] = scannerResult.getText().split("|");
      console.log({ before: scannerResult });
      console.log(
        this.CHAR_SET_PREFIX_MATCH_ENCODER[charSetPrefix],
        this.encodeDefaultCharSet
      );
    
      this.state = ScannerState.SUCCESS;
      this.resultSplited.push(scannerResult.getText().split("|"));
      this.result.push(scannerResult);
    }
  }
  codeReaderErrorHandler(err) {
    if (err && !(err instanceof NotFoundException)) {
      console.log(err);
      this.state = ScannerState.ERROR;
    }
  }

  fixResultScanner(result:Result) {
    this.resultSplited.push(result.getText().split("|"));
    this.result.push(result);
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
