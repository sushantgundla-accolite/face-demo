import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "videojs-record",
  template: `
    <style>
      /* change player background color */
      .video-js video {
        background-color: #5555a9;
      }
      .center {
        margin: 0 auto;
      }
      .button {
        background-color: #55a955;
        border: none;
        color: white;
        padding: 12px 35px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px 10px;
        cursor: pointer;
      }
    </style>

      <p class="center">
        <button (click)="changeType('iris')" class="button">Iris Detection</button>
        <button (click)="changeType('face')" class="button">Image Match</button>
        <button (click)="changeType('video')" class="button">Video Match</button>
      </p>

    <div *ngIf="type=='iris'">
    <iris></iris>
    </div>

    <div *ngIf="type=='face'">
    <face></face>
    </div>

    <div *ngIf="type=='video'">
    <video-match></video-match>
    </div>
  `,
})
export class VideoJSRecordComponent implements OnInit {
  // reference to the element itself: used to access events and methods
  private _elementRef: ElementRef;

  // index to create unique ID for component
  idx = "clip1";

  private config: any;
  private player: any;
  private plugin: any;
  private blinks: number = -1;
  private alive: boolean = null;
  private get: boolean = false;
  private type: string = 'iris';

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef, private http: HttpClient) { }

  ngOnInit() {}

  ngAfterViewInit() { }

  changeType(str) {
    this.type = str;
  }


}
