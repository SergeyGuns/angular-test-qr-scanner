import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core'



import { environment } from 'src/environments/environment'
import { BarcodeFormat, BinaryBitmap, BrowserMultiFormatReader, DecodeHintType, Result, ResultMetadataType } from 'src/vendor/zxingjs-library-es2015'
import { IQrCodeParam, OperationRunService, WikiPayApiService } from './mock/api'
import { AlertingService, ALERTING_CONTEXT } from './mock/uikit'

import { CHEKING_STATUS, chekingCharsetStatus, stQrTextToJSON } from './utils'

enum STATE {
  CAMERA_LOCKED = 'CAMERA_LOCKED',
  CAMERA_UNLOCKED = 'CAMERA_UNLOCKED',
  CAMERA_SCANNER_ERROR = 'CAMERA_SCANNER_ERROR',
}

enum ERROR {
  MISSING_CAMERA = 'На устройстве нету камер',
  CHARACTERSET = 'Ошибка при попытке декодировать как UTF-8, Cp1251, KOI8_R, Cp1252',
  VALIDATION = 'Неудалось валидировать qr-код',
}

type Charset = 'Cp1251' | 'UTF8' | 'KOI8_R' | 'Cp1252'

@Component({
  selector: 'rtl-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement: ElementRef<HTMLVideoElement>
  @Output() readonly handleClose: EventEmitter<void> = new EventEmitter()
  STATE = STATE
  private reader: BrowserMultiFormatReader
  private selectedDeviceId: string

  private videoInputDevices: MediaDeviceInfo[] = []
  private scannerFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.AZTEC]
  private scannerDefaultCharset: Charset = 'UTF8'

  _state: STATE = STATE.CAMERA_LOCKED
  get state(): STATE {
    return this._state
  }
  set state(newState: STATE) {
    !environment.production && console.trace(newState)
    this._state = newState
    this.cdr.detectChanges()
  }

  constructor(
    private wikiPayApiService: WikiPayApiService,
    private operationRunService: OperationRunService,
    private cdr: ChangeDetectorRef,
    private alertingService: AlertingService,
    @Inject(ALERTING_CONTEXT) protected alertContext: string,
  ) {}

  ngAfterViewInit(): void {
    this.reader = new BrowserMultiFormatReader(
      this.createScannerHints(this.scannerDefaultCharset, this.scannerFormats),
    )
    this.reader
      .listVideoInputDevices()
      .then((devices) => {
        if (devices.length === 0) {
          this.codeReaderErrorHandler(ERROR.MISSING_CAMERA)
        }
        this.videoInputDevices = devices // set a swichable camera list
        this.selectedDeviceId = devices[1]?.deviceId || devices[0]?.deviceId
        this.startEncode()
      })
      .catch((error) => {
        this.state = STATE.CAMERA_LOCKED
        this.codeReaderErrorHandler(error)
      })
  }

  ngOnDestroy(): void {
    this.resetEncode()
  }

  private createScannerHints(charset: Charset, formats: BarcodeFormat[]): Map<DecodeHintType, any> {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
    hints.set(DecodeHintType.CHARACTER_SET, charset)
    return hints
  }

  private startEncode(): void {
    this.state = STATE.CAMERA_UNLOCKED
    this.reader
      .decodeOnceFromVideoDevice(this.selectedDeviceId, this.videoElement?.nativeElement)
      .then((result) => this.decodeCallBack(result))
      .catch((e) => {
        !environment.production && console.trace(e)
      })
  }
  // TODO refactoring @ganinsa https://gitlab-01/retail/web/applications/retail-website/-/merge_requests/2012#note_893076
  private decodeCallBack(result: Result): void {
    const charsetStatus = chekingCharsetStatus(result.getText())
    const image = result.getResultMetadata().get(ResultMetadataType.BINARY_BITMAP) as BinaryBitmap
    if (charsetStatus === CHEKING_STATUS.NSPK_OK || charsetStatus === CHEKING_STATUS.GOST_OK) {
      this.fixResultScanner(result, 'UTF8', charsetStatus)
      this.handleClose.emit()
    } else if (
      charsetStatus === CHEKING_STATUS.INVALID_ERR ||
      charsetStatus === CHEKING_STATUS.KOI8R_ERR
    ) {
      const anotherCharsetResults: any = {}
      const charsetAttempts: Charset[] = ['Cp1251', 'KOI8_R', 'Cp1252']
      const allCharsetTextResults: [Charset, Result][] = charsetAttempts.map((charset) => {
        const [status, result] = this.decodeBitmap(image, charset)
        !environment.production && console.trace(charset, result.getText())
        anotherCharsetResults[status] = result
        return [charset, result]
      })

      if (anotherCharsetResults[CHEKING_STATUS.GOST_OK]) {
        this.fixResultScanner(
          anotherCharsetResults[CHEKING_STATUS.GOST_OK],
          null,
          CHEKING_STATUS.GOST_OK,
        )
      } else {
        allCharsetTextResults.forEach(([charset, result]) => {
          this.fixResultScanner(result, charset)
        })
        this.codeReaderErrorHandler(ERROR.CHARACTERSET, result)
      }
    } else {
      this.codeReaderErrorHandler(ERROR.VALIDATION, result)
    }
  }

  private decodeBitmap(image: BinaryBitmap, charSet: Charset): [CHEKING_STATUS, Result] {
    const newHints = this.createScannerHints(charSet, this.scannerFormats)
    const result = new BrowserMultiFormatReader(newHints).decodeBitmap(image)
    return [chekingCharsetStatus(result.getText()), result]
  }

  private fixResultScanner(result: Result, charset?: Charset, status?: CHEKING_STATUS): void {
    let requestResultBody: IQrCodeParam[] = [{ key: 'RawQr', value: result.getText() }]

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
      this.operationRunService.startOperationByScenarioResultModal(
        this.wikiPayApiService.wikiPayLaunchRoublePaymentOperationByQr2(requestResultBody),
      )
    }

    !environment.production && console.trace({ requestResultBody, result, charset, status })
  }

  private onClose(): void {
    this.handleClose.emit()
  }

  private codeReaderErrorHandler(error: ERROR, result?: Result): void {
    this.alertingService.error(this.alertContext, error)
    this.state = STATE.CAMERA_SCANNER_ERROR
    !environment.production && console.trace(error)
    !environment.production && console.trace(result)
  }

  onChangeCamera(): void {
    let nextDeviceIndex = 0
    const currDeviceIndex = this.videoInputDevices.findIndex(
      (device) => device.deviceId === this.selectedDeviceId,
    )
    if (currDeviceIndex !== this.videoInputDevices.length - 1) {
      nextDeviceIndex = currDeviceIndex + 1
    }
    this.selectedDeviceId = this.videoInputDevices[nextDeviceIndex]?.deviceId
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
