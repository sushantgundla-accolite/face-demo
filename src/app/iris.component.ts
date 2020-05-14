import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
var FormData = require("form-data");

import videojs from "video.js";
import * as adapter from "webrtc-adapter/out/adapter_no_global.js";
import * as RecordRTC from "recordrtc";

/*
  // Required imports when recording audio-only using the videojs-wavesurfer plugin
  import * as WaveSurfer from 'wavesurfer.js';
  import * as MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
  WaveSurfer.microphone = MicrophonePlugin;
  
  // Register videojs-wavesurfer plugin
  import * as Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
  */

// register videojs-record plugin with this import
import * as Record from "videojs-record/dist/videojs.record.js";

@Component({
  selector: "iris",
  template: `
    <style>
      /* change player background color */
      .video-js video {
        background-color: #5565a9;
      }
      .center {
        margin: 0 auto;
      }
    </style>
    <h1 style="text-align:center"> Blink and Iris Movement Detection!</h1>
    <p style="text-align:center">
    1. Click on the video Button to activate the Video Recorder. <br>
    2. Click on the "Record" button (botton left of the video recorder) to start recording.<br>
    3. Click on the "Stop" button to stop recording and get the Analysis.<br>
    </p>

    <video
      id="video_{{ idx }}"
      class="video-js vjs-default-skin center"
      playsinline
    ></video>

    

    <h3 *ngIf="blinks > -1" style="text-align:center">Blinks: {{ blinks }}</h3>
    <h3 *ngIf="alive != null" style="text-align:center">Iris movement: {{ alive }}</h3>
  `,
})
export class IrisComponent implements OnInit {
  // reference to the element itself: used to access events and methods
  private _elementRef: ElementRef;

  // index to create unique ID for component
  idx = "clip2";

  private config: any;
  private player: any;
  private plugin: any;
  private blinks: number = -1;
  private alive: boolean = null;
  private get: boolean = false;
  private key: string = "hiWC2k43gPUYjnoYEqZ0dSvkPM6ZpbSYEj8y3zGApQ4=";

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

  // use ngAfterViewInit to make sure we initialize the videojs element
  // after the component template itself has been rendered
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
      this.blinks = -1;
      this.alive = null;
    });

    // user completed recording and stream is available
    this.player.on("finishRecord", () => {
      // recordedData is a blob object containing the recorded data that
      // can be downloaded by the user, stored on server etc.
      console.log("finished recording: ", this.player.recordedData);
      var blob = new Blob([this.player.recordedData], { type: "video/mp4" });
      let videofile = blobToFile(blob, "video.mp4");

      var formdata = new FormData();
      formdata.append("file", videofile, "video.mp4");

      var myHeaders = new Headers();
      myHeaders.append("x-api-key", this.key);

      var formdata = new FormData();
      formdata.append("file", videofile, "video.mp4");

      var requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      fetch("https://vision-uat.prudential.com.sg/api/face/iris/blink/", requestOptions)
        .then((response) => response.json())
        .then((result) => (this.blinks = result["body"]["blink_count"]))
        // .then((result) => console.log(result["body"]["total_frames"]))
        .catch((error) => console.log("error", error));

      fetch("https://vision-uat.prudential.com.sg/api/face/iris/gaze/", requestOptions)
        .then((response) => response.json())
        .then((result) => (this.alive = result["body"]["alive"]))
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

    //   this.player.on('finishRecord', function() {
    //     // show save as dialog
    //     console.log(this.player.recordedData);
    //     // console.log(this.player.record());
    //     // this.player.record().saveAs({'video': 'my-video-file-name.webm'});
    // });

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
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      b.lastModifiedDate = new Date();
      b.name = fileName;

      //Cast to a File() type
      return <File>theBlob;
    };
  }

  image: any;
  async getImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.image = await this.toBase64(event.target.files[0]);
      this.image = this.image.split('base64,')[1];
      console.log(this.image);
      // var reader = new FileReader();
      // reader.onload = (event: any) => {
      //   this.image = event.target.files[0];
      //   reader.readAsDataURL(this.image);
      //   console.log(reader.result);
      // };
    }
  }

  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


}
