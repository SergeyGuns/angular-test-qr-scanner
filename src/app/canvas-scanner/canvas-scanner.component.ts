import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FACING_MODE, getConstraints } from "./utils";
@Component({
  selector: "app-canvas-scanner",
  templateUrl: "./canvas-scanner.component.html",
  styleUrls: ["./canvas-scanner.component.scss"],
})
export class CanvasScannerComponent implements AfterViewInit {
  @ViewChild("video") private videoElement;
  @ViewChild("canvas") private canvasElement;
  camera: FACING_MODE = FACING_MODE.BACK;
  timer: any = null;
  public streamProps:any = {
    width: 0,
    height: 0
  }
  private stream: MediaStream = null;
  constructor() {}

  ngAfterViewInit() {
    this.getMedia();
  }

  async getMedia() {
    const constraints = getConstraints(FACING_MODE.BACK);
    console.log(constraints);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      const canvas: HTMLCanvasElement = this.canvasElement.nativeElement;
      const ctx = canvas.getContext("2d");
      const {width, height} = this.stream.getVideoTracks()[0].getSettings()
      canvas.width = width
      const documentWidth = document.documentElement.clientWidth
      const documentHeight = document.documentElement.clientHeight
      canvas.height = height
      video.srcObject = this.stream;
      this.streamProps = {width, height, dWidth: documentWidth, dHeight:documentHeight,  devicePixelRatio:window.devicePixelRatio}
      console.log(width, height, documentWidth, documentHeight,)
      video.onloadedmetadata =  (e: any) => {
        this.timer = setInterval(() => {
          ctx.drawImage(video, 0, 0, width, height);
        }, 1000 / 10);
      };
      video.srcObject = this.stream;

      await video.play();
    } catch (e) {
      console.log(e);
    }
  }
}
