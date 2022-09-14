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
  @ViewChild("aztecImage") aztecImage
  @ViewChild("canvasElement") canvas
  // worker: Worker
  isCheked: false
  fileReader: FileReader;
  barCodeReader: BrowserMultiFormatReader;
  isLoading: boolean = false;
  coudecodingAttempts
  picture;
  result: Result = null
  hints: Map<DecodeHintType, any> = new Map();
  formats = [
    BarcodeFormat.QR_CODE,
    // BarcodeFormat.DATA_MATRIX,
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

  constructor() {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.hints.set(DecodeHintType.CHARACTER_SET, this.encodeDefaultCharSet);

  }

  ngAfterViewInit(): void {
    this.decodeImage(this?.aztecImage?.nativeElement)
  }

  ngOnInit(): void {
    this.fileReader = new FileReader();
    this.barCodeReader = new BrowserMultiFormatReader(this.hints);
    // this.worker = new Worker('./upload-image-scanner.worker', { type: 'module' });
    // this.worker.onmessage = ({ data }) => {
    //   console.log(`page got message: ${data}`);
    // };
  }

  decodeImage(image?: HTMLImageElement) {
    if (!image?.src) return;
    // this.barCodeReader.decodeFromImageElement(this.image.nativeElement)
    const canvas = this.canvas.nativeElement as HTMLCanvasElement
    // this.worker.postMessage({ canvas, image });
    const ctx = canvas.getContext('2d')
    const MAX_CANVAS_ANGLE = 359
    let canvasAngle = 0
    const h = image.naturalHeight
    const w = image.naturalWidth
    canvas.height = h << 1
    canvas.width = w << 1
    ctx.drawImage(image, 0, 0);
    this.isLoading = true
    const step = () => {
      if (this.result === null && canvasAngle < MAX_CANVAS_ANGLE) {
        console.log(canvasAngle)
        const bitmap = this.barCodeReader.createBinaryBitmapFromCanvas(canvas)
        try {
          this.result = this.barCodeReader.decodeBitmap(bitmap)
        } catch (e) {
          console.warn(canvasAngle)
        }
        this.rotateCtx(canvas, ctx, canvasAngle, image)
        canvasAngle++
        window.requestAnimationFrame(step);
      } else {
        this.isLoading = false
      }
    }
    if (this.result) {
      this.isLoading = false
    }
    window.requestAnimationFrame(step)
  }


  onImageLoad(event: Event) {
    // this.barCodeReader.decodeFromImageElement(this.image.nativeElement)
    const canvas = this.canvas.nativeElement as HTMLCanvasElement
    const image = event.currentTarget as HTMLImageElement
    // this.worker.postMessage({ canvas, image });
    const ctx = canvas.getContext('2d')
    const MAX_CANVAS_ANGLE = 359
    let canvasAngle = 0
    const h = image.naturalHeight
    const w = image.naturalWidth
    canvas.height = h << 1
    canvas.width = w << 1
    ctx.drawImage(image, 0, 0);
    this.isLoading = true
    const step = () => {
      if (this.result === null && canvasAngle < MAX_CANVAS_ANGLE) {
        console.log(canvasAngle)
        const bitmap = this.barCodeReader.createBinaryBitmapFromCanvas(canvas)
        try {
          this.result = this.barCodeReader.decodeBitmap(bitmap)
        } catch (e) {
          console.warn(canvasAngle)
        }
        this.rotateCtx(canvas, ctx, canvasAngle, image)
        canvasAngle++
        window.requestAnimationFrame(step);
      } else {
        this.isLoading = false
      }
    }
    if (this.result) {
      this.isLoading = false
    }
    window.requestAnimationFrame(step)
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
