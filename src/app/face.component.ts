import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
var FormData = require("form-data");


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
      .img{
        display: block;
        margin-left: auto;
        margin-right: auto;
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
    Note: Make sure that both images MUST contain EXACT ONE PERSON(face).
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

    <div *ngIf="send==true && distance < 0" class="center">
    <img class="img" src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif">
    </div>

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
  private send: boolean = false;

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit() {}
  blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  };

  async getFirstImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.firstImage = event.target.files[0];
    }
  }

  async getSecondImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.secondImage = event.target.files[0];
      // this.secondImage = await this.toBase64(event.target.files[0]);
      // this.secondImage = this.secondImage.split("base64,")[1];
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
    this.send = true;
    var myHeaders = new Headers();
    myHeaders.append(
      "x-api-key",
      "hiWC2k43gPUYjnoYEqZ0dSvkPM6ZpbSYEj8y3zGApQ4="
      // "Test"
    );
    
    var formdata = new FormData();
    formdata.append("reference_image", this.firstImage, this.firstImage.name);
    formdata.append("example_image", this.secondImage, this.secondImage.name);

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      "https://vision-uat.prudential.com.sg/api/face/image/distance/",
      // "http://localhost:8000/api/face/image/distance/",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => (this.distance = +((1 - result["body"])*100).toFixed(2)))
      .catch((error) => console.log("error", error));
  }
}
