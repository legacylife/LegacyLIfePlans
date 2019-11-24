// import { NgModule } from '@angular/core';
// import { ɵb } from 'angular-feather';
// //import * as IconSmile from 'feather-icons';

// const icons = [
//   ɵb//IconSmile
// ];

// export class IconsModule { }
import { NgModule } from '@angular/core';
 
import { FeatherModule } from 'angular-feather';
import { Camera, Heart, Github,Smile } from 'angular-feather/icons';
 
// Select some icons (use an object, not an array)
const icons = [
  Camera,
  Heart,
  Github,
  Smile 
];
 
@NgModule({
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }