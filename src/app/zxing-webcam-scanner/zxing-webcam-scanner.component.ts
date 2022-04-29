import { AfterViewInit, Component, ViewChild } from "@angular/core";
import cp1251 from "./utils/windows-1251";
import koi8r from "./utils/koi8r";
import {
  BarcodeFormat,
  BrowserMultiFormatReader, DecodeHintType, NotFoundException,
  Result
} from "@zxing/library";

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
  CHAR_SET_PREFIX_MATCH_ENCODER = {
    [CharSetPrefix.ST00011]: (t) => cp1251.decode(cp1251.encode(t),{
      mode: 'replacement'
    }),
    [CharSetPrefix.ST00012]: decodeURI,
    [CharSetPrefix.ST00013]: koi8r.decode
    // "ST00011" = CharacterSetValueIdentifiers.Cp1251,
    // "ST00012" = CharacterSetValueIdentifiers.UTF8,
    // "ST00013" = CharacterSetValueIdentifiers.koi8r
  }
  decodeTextByPrefix(prefix, text) {
    if(this.CHAR_SET_PREFIX_MATCH_ENCODER.hasOwnProperty(prefix)) {
      return this.CHAR_SET_PREFIX_MATCH_ENCODER[prefix](text)
    }
    return text
  }
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string;
  videoInputDevices: MediaDeviceInfo[];
  encodeResult: Result[] = [];
  encodeResultSplited: string[][] = [];
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
        const [charSetPrefix, ...text] = result.text.split('|')

        // this.encodeResultSplited.push(result.text.split('|').map((line)=>this.decodeTextByPrefix(charSetPrefix, line)))
        this.encodeResult.push(result);
        this.encodeResultSplited.push(text);
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    }
  }

  // detectCharSet(text:string):CharSetPrefixMatch {
  //   const charSetPrefix = text.split('|')
  //   if(charSetPrefix?.length) {
  //     return CharSetPrefixMatch[charSetPrefix[0]]
  //   }
  //   return null
  // }

  resetEncode() {
    this.codeReader.reset();
    this.encodeResult = [];
    this.encodeResultSplited = []
  }
  onChangeSelectDivices(ev): void {
    this.selectedDeviceId = ev.value;
  }
}
