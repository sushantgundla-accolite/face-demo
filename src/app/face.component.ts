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
  selector: "face",
  template: `
    <style>
      /* change player background color */
      .video-js video {
        background-color: #5565a9;
      }
      .center {
        margin: 0 auto;
      }
      .button {
        background-color: #595;
        border: none;
        color: white;
        padding: 5px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px 10px;
        cursor: pointer;
      }
      .custom-file-upload {
        border: 1px solid #ccc;
        display: inline-block;
        padding: 6px 12px;
        cursor: pointer;
      }
    </style>
    <h1 style="text-align:center"> Image Match! </h1>
    <p style="text-align:center">
    1. Click on the Reference Images and set the Images. <br>
    2. Click on the "Calculate" to get the Match.<br>
    </p> 
    
    <label class="custom-file-upload">
    Reference Image 1
    <input type="file" (change)="getFirstImage($event)" />
    </label>

    <br>
    
    <label class="custom-file-upload">
    Reference Image 2
    <input type="file" (change)="getSecondImage($event)" />
    </label>
    <br>

    

    <button (click)="calculate()" class="button">Calculate</button>
    <h3 *ngIf="distance >= 0" style="text-align:center">Match:{{ distance }}%</h3>
  `,
})
export class FaceComponent implements OnInit {
  // reference to the element itself: used to access events and methods
  private _elementRef: ElementRef;

  private config: any;
  private player: any;
  private plugin: any;
  private distance: number = -1.1;
  private alive: boolean = null;
  private get: boolean = false;
  firstImage: any;
  secondImage: any;

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef, private http: HttpClient) {}

  ngOnInit() {}

  // use ngAfterViewInit to make sure we initialize the videojs element
  // after the component template itself has been rendered
  ngAfterViewInit() {}
  blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  };

  async getFirstImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.firstImage = await this.toBase64(event.target.files[0]);
      this.firstImage = this.firstImage.split("base64,")[1];
      // var reader = new FileReader();
      // reader.onload = (event: any) => {
      //   this.image = event.target.files[0];
      //   reader.readAsDataURL(this.image);
      //   console.log(reader.result);
      // };
    }
  }

  async getSecondImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.secondImage = await this.toBase64(event.target.files[0]);
      this.secondImage = this.secondImage.split("base64,")[1];
      // var reader = new FileReader();
      // reader.onload = (event: any) => {
      //   this.image = event.target.files[0];
      //   reader.readAsDataURL(this.image);
      //   console.log(reader.result);
      // };
    }
  }

  toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  calculate() {
    var myHeaders = new Headers();
    myHeaders.append(
      "x-api-key",
      // "hiWC2k43gPUYjnoYEqZ0dSvkPM6ZpbSYEj8y3zGApQ4="
      "Test"
    );

    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      reference_image: this.firstImage,
      example_image: this.secondImage,
    });

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      // "https://vision-uat.prudential.com.sg/api/face/image/distance/",
      "http://localhost:8000/api/face/image/distance/",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => (this.distance = +((1 - result["body"]["distance"])*100).toFixed(2)))
      // .then((result) => console.log(result["body"]["total_frames"]))
      .catch((error) => console.log("error", error));
  }
}
