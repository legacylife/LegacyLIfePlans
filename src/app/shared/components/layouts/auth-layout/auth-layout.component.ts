import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const locationArray = location.href.split("/");
  //console.log(locationArray);
    if(locationArray.indexOf("signin") == 3 || locationArray.indexOf("llp-admin") == 3 || locationArray.indexOf("signup") > -1 || locationArray.indexOf("forgot-password") > -1 || locationArray.indexOf("business-info") > -1  || locationArray.indexOf("reset-password") > -1 || locationArray.indexOf("password-reset-successful") > -1 || locationArray.indexOf("forgot-password-successful") > -1 || locationArray.indexOf("update-profile") > -1 || locationArray.indexOf("thank-you") > -1 || locationArray.indexOf("thank-you") > -1) {
   
      const htmlTag = document.getElementsByTagName("html")[0]
      const bodyTag = document.getElementsByTagName("body")[0]
      htmlTag.className += " llp--auth--wrapper"
      bodyTag.className += " llp--auth--wrapper"
    }
  }

  ngOnDestroy() {
    const locationArray = location.href.split("/")
   // if(locationArray.indexOf("signin") > -1 || locationArray.indexOf("forgot-password")> -1) {
      //html
      const htmlTag = document.getElementsByTagName("html")[0]
      let htmlClasses = htmlTag.className && htmlTag.className.length > 0 ? htmlTag.className.split(" ") : []
      const myclassHtmlIndex = htmlClasses.indexOf('llp--auth--wrapper')
      if(myclassHtmlIndex > -1) {
        htmlClasses.splice(myclassHtmlIndex, 1)
        htmlTag.className = htmlClasses.join(" ")
      }

      //body 
      const bodyTag = document.getElementsByTagName("body")[0]
      let bodyClasses = bodyTag.className && bodyTag.className.length > 0 ? bodyTag.className.split(" ") : []
      const myclassBodyIndex = bodyClasses.indexOf('llp--auth--wrapper')
      if(myclassBodyIndex > -1) {
        bodyClasses.splice(myclassBodyIndex, 1)
        bodyTag.className = bodyClasses.join(" ")
      }
   // }
  }

}
