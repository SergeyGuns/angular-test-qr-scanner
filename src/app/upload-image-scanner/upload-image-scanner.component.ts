import { Component, OnInit, ViewChild } from "@angular/core";
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType
} from "src/vendor/zxingjs-library-es2015";
import { CharSetPrefix } from "../utils/scanner";

@Component({
  selector: "app-upload-image-scanner",
  templateUrl: "./upload-image-scanner.component.html",
  styleUrls: ["./upload-image-scanner.component.scss"],
})
export class UploadImageScannerComponent implements OnInit {
  picture = null;
  blobPicture: Blob;
  fileReader: FileReader;
  codeReader: BrowserMultiFormatReader;
  hints = new Map();
  formats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ];
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
  encodeDefaultCharSet =
    this.CHAR_SET_PREFIX_MATCH_ENCODER[CharSetPrefix.ST00012];
  @ViewChild("uploadImage") imageElement;
  @ViewChild("canvasElement") canvasElement;
  constructor() {}

  ngOnInit(): void {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.hints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);
    this.fileReader = new FileReader();
    this.fileReader.onload = () => this.onLoadImage();
    this.codeReader = new BrowserMultiFormatReader(this.hints);
  }

  async onLoadImage() {
    this.picture = this.fileReader.result;
    const imageBlob = await fetch(this.picture).then((res) => res.blob());

    debugger;
    console.log(this.picture);
    this.codeReader
      .decodeFromImage()
      .then((res) => {
        console.log({ res });
      })
      .catch((e) => console.log(e));
  }

  public onFileSelected(event: Event) {
    let file = (<HTMLInputElement>event.target).files[0];
    // if() return;
    console.log({ file });
    createImageBitmap(file).then((bitmap) => {
      const canvas = this.canvasElement.nativeElement;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      if (file) {
        setTimeout(()=>
          this.codeReader.decodeOnce(canvas).then(res => console.log(res))
        ,100)
      } else {
        this.picture = undefined;
      }
    });
  }
}
