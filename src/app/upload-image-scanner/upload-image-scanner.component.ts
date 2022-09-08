import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import {
  BarcodeFormat, BrowserMultiFormatReader,
  DecodeHintType,
  Result
} from "src/vendor/zxingjs-library-es2015";
import { CharSetPrefix } from "../utils/scanner";

@Component({
  selector: "app-upload-image-scanner",
  templateUrl: "./upload-image-scanner.component.html",
  styleUrls: ["./upload-image-scanner.component.scss"],
})
export class UploadImageScannerComponent implements OnInit, AfterViewInit {
  @ViewChild("uploadImage") image
  @ViewChild("canvasElement") canvas
  fileReader: FileReader;
  barCodeReader: BrowserMultiFormatReader;
  isLoading: boolean = false;
  picture;
  result: Result = null
  hints: Map<DecodeHintType, any> = new Map();
  formats = [
    BarcodeFormat.QR_CODE,
    // BarcodeFormat.DATA_MATRIX,
    // BarcodeFormat.AZTEC,
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

  constructor() {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.hints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);

  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.fileReader = new FileReader();
    this.barCodeReader = new BrowserMultiFormatReader(this.hints);
  }


  onImageLoad(event: Event) {
    // this.barCodeReader.decodeFromImageElement(this.image.nativeElement)
    let canvas = this.canvas.nativeElement as HTMLCanvasElement
    let ctx = canvas.getContext("2d");
    const image = event.currentTarget as HTMLImageElement
    let canvasAngle = 0
    const MAX_CANVAS_ANGLE = 360
    const h = image.naturalHeight
    const w = image.naturalWidth
    canvas.height = h << 1
    canvas.width = w << 1
    ctx.drawImage(image, 0, 0);
    this.isLoading = true
    while (this.result === null && canvasAngle < MAX_CANVAS_ANGLE) {
      const bitmap = this.barCodeReader.createBinaryBitmapFromCanvas(canvas)
      try {
        this.result = this.barCodeReader.decodeBitmap(bitmap)
      } catch (e) {
        console.warn(canvasAngle)
      }
      this.rotateCtx(canvas, ctx, canvasAngle, image)
      canvasAngle++
    }
    // this.decode(canvas, ctx, image).then(e => console.log(e))
    if (this.result) {
      this.isLoading = false
    }
    console.log(this.result, canvasAngle)
  }
  decode(canvas, ctx, image) {
    return Promise.race(new Array(359).fill(1).map((_, angle) => new Promise((resolve, reject) => {
      const canvasRotated = this.rotateCtx(canvas, ctx, angle, image)
      const bitmap = this.barCodeReader.createBinaryBitmapFromCanvas(canvasRotated)
      try {
        const result = this.barCodeReader.decodeBitmap(bitmap)
        resolve(result)
      } catch (e) {
      }
    })))
  }
  isPDF(event: Event) {

  }

  rotateCtx(canvas, ctx, angle, image) {
    ctx.save(); //saves the state of canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear the canvas
    ctx.translate(image.width, image.height); //let's translate
    ctx.rotate(Math.PI / 180 * (angle += 5)); //increment the angle and rotate the image 
    ctx.drawImage(image, -image.width / 2, -image.height / 2); //draw the image ;)
    ctx.restore();
    return canvas
  }

  decodeCallback(r: any) {
    console.dir(r)
  }

  onFileSelected(event: Event) {
    let file = (<HTMLInputElement>event.target).files[0];
    this.fileReader.onload = (event) => {
      this.picture = event.target.result;
      // this.image.src =  event.target.result;
    };
    this.fileReader.readAsDataURL(file);
  }

}
