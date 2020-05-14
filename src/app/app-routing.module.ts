import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoJSRecordComponent } from './videojs.record.component';

const routes: Routes = [
    {path: 'videojs', component: VideoJSRecordComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
  })
  export class AppRoutingModule { }