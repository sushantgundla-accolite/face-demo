import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { VideoJSRecordComponent } from "./videojs.record.component";
import { IrisComponent } from "./iris.component";
import { FaceComponent } from "./face.component";
import { VideoMatchComponent } from "./video.component";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";


@NgModule({
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  declarations: [VideoJSRecordComponent, IrisComponent, FaceComponent, VideoMatchComponent],
  bootstrap: [VideoJSRecordComponent, IrisComponent, FaceComponent, VideoMatchComponent],
})
export class AppModule {}
