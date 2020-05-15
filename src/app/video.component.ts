import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
var FormData = require("form-data");

import videojs from "video.js";
import * as adapter from "webrtc-adapter/out/adapter_no_global.js";
import * as RecordRTC from "recordrtc";

import * as Record from "videojs-record/dist/videojs.record.js";

@Component({
  selector: "video-match",
  template: `
    <style>
      /* change player background color */
      .video-js video {
        background-color: #5565a9;
      }
      .center {
        margin: 0 auto;
      }    
      .img{
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .custom-file-upload {
        border: 1px solid #ccc;
        display: inline-block;
        padding: 6px 12px;
        cursor: pointer;
      }
    </style>
    <h1 style="text-align:center"> Video Match! </h1>
    <p style="text-align:center">
    1. Click on the Reference Image and set an Image. <br>
    2. Click on the video Button to activate the Video Recorder. <br>
    3. Click on the "Record" button (botton left of the video recorder) to start recording.<br>
    4. CLick on the "Stop" button to stop recording and get the Match.<br>
    Note: Make sure that image and video MUST contain EXACT ONE PERSON(face).
    </p> 

    <label class="custom-file-upload">
    Reference Image
    <input type="file" (change)="getImage($event)" />
    </label>

    <video
      id="video_{{ idx }}"
      class="video-js vjs-default-skin center"
      playsinline
    ></video>

    <div *ngIf="send==true && distance < 0" class="center">
    <img class="img" src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif">
    </div>
    
    <h3 *ngIf="distance >= 0" style="text-align:center">Match:{{ distance }}%</h3>
  `,
})
export class VideoMatchComponent implements OnInit {
  // reference to the element itself: used to access events and methods
  private _elementRef: ElementRef;

  // index to create unique ID for component
  idx = "clip3";

  private config: any;
  private player: any;
  private plugin: any;
  private distance: number = -1.1
  image: any;
  private send:boolean = false;

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef, private http: HttpClient) {
    this.player = false;

    // save reference to plugin (so it initializes)
    this.plugin = Record;

    // video.js configuration
    this.config = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 500,
      height: 350,
      controlBar: {
        volumePanel: false,
      },
      plugins: {
        /*
          // wavesurfer section is only needed when recording audio-only
          wavesurfer: {
              src: 'live',
              waveColor: '#36393b',
              progressColor: 'black',
              debug: true,
              cursorWidth: 1,
              msDisplayMax: 20,
              hideScrollbar: true
          },
          */
        // configure videojs-record plugin
        record: {
          videoMimeType: "video/webm;codecs=H264",
          audio: false,
          video: true,
          debug: true,
        },
      },
    };
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // ID with which to access the template's video element
    let el = "video_" + this.idx;

    // setup the player via the unique element ID
    this.player = videojs(document.getElementById(el), this.config, () => {
      console.log("player ready! id:", el);

      // print version information at startup
      var msg =
        "Using video.js " +
        videojs.VERSION +
        " with videojs-record " +
        videojs.getPluginVersion("record") +
        " and recordrtc " +
        RecordRTC.version;
      videojs.log(msg);
    });

    // device is ready
    this.player.on("deviceReady", () => {
      console.log("device is ready!");
    });

    // user clicked the record button and started recording
    this.player.on("startRecord", () => {
      console.log("started recording!");
      this.distance = -1.1;
    });

    // user completed recording and stream is available
    this.player.on("finishRecord", () => {
      this.send = true;
      // recordedData is a blob object containing the recorded data that
      // can be downloaded by the user, stored on server etc.
      console.log("finished recording: ", this.player.recordedData);
      var blob = new Blob([this.player.recordedData], { type: "video/mp4" });
      let videofile = blobToFile(blob, "video.mp4");

      var formdata = new FormData();
      formdata.append("file", videofile, "video.mp4");

      var myHeaders = new Headers();
      myHeaders.append(
        "x-api-key",
        "hiWC2k43gPUYjnoYEqZ0dSvkPM6ZpbSYEj8y3zGApQ4="
        // "Test",
      );

      var formdata = new FormData();
      formdata.append("file", videofile, "video.mp4");
      formdata.append("reference_image", this.image, this.image.name);

      var requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      fetch(
        "https://vision-uat.prudential.com.sg/api/face/video/distance/",
        // "http://localhost:8000/api/face/video/distance/",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => this.distance = +((1 - result["body"]["distance"])*100).toFixed(2))
        .catch((error) => console.log("error", error));

      // const myHeaders = new  HttpHeaders().set("x-api-key", "Test");

      // // const myHeaders = new HttpHeaders({
      // //   "x-api-key": "Test",
      // // });
      // var requestOptions = {
      //   headers: myHeaders,
      // };

      // this.http
      //   .post<any>(
      //     "http://localhost:8000/api/face/iris/blink/",
      //     formdata,
      //     this.requestOptions
      //   )
      //   .subscribe((data) => console.log(data));
    });

    // error handling
    this.player.on("error", (element, error) => {
      console.warn(error);
    });

    this.player.on("deviceError", () => {
      console.error("device error:", this.player.deviceErrorCode);
    });

    // use ngOnDestroy to detach event handlers and remove the player
    // ngOnDestroy() {
    //   if (this.player) {
    //     this.player.dispose();
    //     this.player = false;
    //   }
    // }

    var blobToFile = (theBlob: Blob, fileName: string): File => {
      var b: any = theBlob;
      b.lastModifiedDate = new Date();
      b.name = fileName;
      return <File>theBlob;
    };
  }

  
  async getImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.image = event.target.files[0];
      // this.image = await this.toBase64(event.target.files[0]);
      // this.image = this.image.split("base64,")[1];
    }
  }

  toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
}
