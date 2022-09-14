import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, OnDestroy,
  Output,
  ViewChild
} from "@angular/core";

import {
  BarcodeFormat,
  BinaryBitmap,
  BrowserMultiFormatReader,
  DecodeHintType,
  Result,
  ResultMetadataType
} from "src/vendor/zxingjs-library-es2015";
import {
  IQrCodeParam,
  OperationRunService,
  WikiPayApiService
} from "./mock/api";

import { chekingCharsetStatus, CHEKING_STATUS, stQrTextToJSON } from "./utils";

export enum STATE {
  CAMERA_LOCKED = 'CAMERA_LOCKED',
  CAMERA_UNLOCKED = 'CAMERA_UNLOCKED',
}

enum CAMERA_MODE {
  BACK = "BACK",
  FRONT = "FRONT"
}
const CAMERA_CONSTRAINS = {
  [CAMERA_MODE.FRONT]: { facingMode: "user" },
  [CAMERA_MODE.BACK]: { facingMode: 'environment' }
}
export enum CAMERA_API_ERROR_NAME {
  NotAllowedError = 'NotAllowedError',
  NotFoundError = 'NotFoundError',
}

export enum ERROR {
  CHARACTERSET_VALIDATION = `
    QR-код не удалось обработать. 
    Для улучшения качества сервиса, 
    пожалуйста, обратитесь в 
    Службу поддержки`,
  VALIDATION = 'QR-код не содержит данные для совершения платежа',
}

export enum Charset {
  CP1251 = 'Cp1251',
  CP1252 = 'Cp1252',
  UTF8 = 'UTF8',
  KOI8_R = 'KOI8_R',
}


@Component({
  selector: "rtl-qr-code-scanner",
  templateUrl: "./qr-code-scanner.component.html",
  styleUrls: ["./qr-code-scanner.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement: ElementRef<HTMLVideoElement>
  @Output() readonly handleClose: EventEmitter<void> = new EventEmitter()
  STATE = STATE
  ERROR = ERROR
  CAMERA_MODE = CAMERA_MODE
  private reader: BrowserMultiFormatReader

  private scannerFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.AZTEC]
  private scannerDefaultCharset: Charset = Charset.UTF8

  cameraMode = CAMERA_MODE.BACK
  _errorStatus: ERROR = null
  _state: STATE = STATE.CAMERA_LOCKED
  resultText: string;
  get errorStatus(): ERROR {
    return this._errorStatus
  }
  set errorStatus(value: ERROR) {
    this._errorStatus = value
    this.cdr.detectChanges()
  }

  get state(): STATE {
    return this._state
  }
  set state(newState: STATE) {
    this._state = newState
    this.cdr.detectChanges()
  }

  constructor(
    private wikiPayApiService: WikiPayApiService,
    public operationRunService: OperationRunService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    this.reader = new BrowserMultiFormatReader(
      this.createScannerHints(this.scannerDefaultCharset, this.scannerFormats),
    )
    this.startEncode()
  }

  ngOnDestroy(): void {
    this.resetEncode()
  }

  onClearError(): void {
    this.errorStatus = null
  }

  private createScannerHints(charset: Charset, formats: BarcodeFormat[]): Map<DecodeHintType, any> {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
    hints.set(DecodeHintType.CHARACTER_SET, charset)
    return hints
  }

  private startEncode(): void {
    const constraints: MediaStreamConstraints = { video: CAMERA_CONSTRAINS[this.cameraMode] }

    this.state = STATE.CAMERA_UNLOCKED
    this.reader
      .decodeOnceFromConstraints(constraints, this.videoElement?.nativeElement)
      .then((result) => this.decodeCallBack(result))
      .catch((e) => {
        if (
          [CAMERA_API_ERROR_NAME.NotAllowedError, CAMERA_API_ERROR_NAME.NotFoundError].includes(
            e.name,
          )
        ) {
          this.state = STATE.CAMERA_LOCKED
        }
      })
  }
  // TODO refactoring @ganinsa https://gitlab-01/retail/web/applications/retail-website/-/merge_requests/2012#note_893076
  private decodeCallBack(result: Result): void {
    const image = result.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP) as BinaryBitmap
    const anotherCharsetResults: any = {}
    const charsetAttempts: Charset[] = [
      Charset.UTF8,
      Charset.CP1251,
      Charset.KOI8_R,
      Charset.CP1252,
      null
    ]
    const allCharsetTextResults: [Charset, Result][] = charsetAttempts.map((charset) => {
      const [status, result] = this.decodeBitmap(image, charset)
      anotherCharsetResults[status] = result
      return [charset, result]
    })
    if (anotherCharsetResults[CHEKING_STATUS.NSPK_OK]) {
      this.fixResultScanner(
        anotherCharsetResults[CHEKING_STATUS.NSPK_OK],
        null,
        CHEKING_STATUS.NSPK_OK,
      )
    } else if (anotherCharsetResults[CHEKING_STATUS.GOST_OK]) {
      this.fixResultScanner(
        anotherCharsetResults[CHEKING_STATUS.GOST_OK],
        null,
        CHEKING_STATUS.GOST_OK,
      )
    } else {
      allCharsetTextResults.forEach(([charset, result]) => {
        this.fixResultScanner(result, charset)
      })
      if (anotherCharsetResults[CHEKING_STATUS.NOT_PAYMENT_INFO]) {
        this.codeReaderErrorHandler(ERROR.VALIDATION, result.getText())
      } else {
        this.codeReaderErrorHandler(ERROR.CHARACTERSET_VALIDATION, result.getText())
      }
    }
  }

  private decodeBitmap(image: BinaryBitmap, charSet: Charset): [CHEKING_STATUS, Result] {
    const newHints = this.createScannerHints(charSet, this.scannerFormats)
    const result = charSet ? new BrowserMultiFormatReader(newHints).decodeBitmap(image) : new BrowserMultiFormatReader().decodeBitmap(image)
    return [chekingCharsetStatus(result.getText()), result]
  }

  private fixResultScanner(result: Result, charset?: Charset, status?: CHEKING_STATUS): void {
    let requestResultBody: IQrCodeParam[] = [{ key: 'RawQr', value: result.getText() }]
    if (!status) {
      console.warn(result, charset)
    }
    switch (status) {
      case CHEKING_STATUS.NSPK_OK: {
        requestResultBody = requestResultBody.concat([
          {
            key: 'qr_nspk',
            value: result.getText(),
          },
        ])
        break
      }
      case CHEKING_STATUS.GOST_OK: {
        const parsedJSON = stQrTextToJSON(result.getText())
        requestResultBody = Object.keys(parsedJSON).reduce((acc, key) => {
          const value = parsedJSON[key]
          return acc.concat({ key, value })
        }, requestResultBody)
        break
      }
      default:
        break
    }

    if (status === CHEKING_STATUS.GOST_OK || status === CHEKING_STATUS.NSPK_OK) {
      this.resetEncode()
      this.onClose()
      this.operationRunService.startOperationByScenarioResultInline(
        this.wikiPayApiService.wikiPayLaunchRoublePaymentOperationByQr2(requestResultBody),
      )
    }
  }

  private onClose(): void {
    this.handleClose.emit()
  }

  private codeReaderErrorHandler(error: ERROR, resultText: string): void {
    this.errorStatus = error
    this.resultText = resultText
    this.startEncode()
  }

  onChangeCamera(): void {
    this.cameraMode = this.cameraMode === CAMERA_MODE.BACK ? CAMERA_MODE.FRONT : CAMERA_MODE.BACK
    this.resetEncode()
    this.startEncode()
  }

  private resetEncode(): void {
    this.state = STATE.CAMERA_LOCKED
    this.reader.stopAsyncDecode()
    this.reader.stopContinuousDecode()
    this.reader.reset()
  }
}
