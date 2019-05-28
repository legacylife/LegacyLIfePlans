
let serverUrlEnv= ""
let nylasConnectionLinkEnv = ""
let gmailConnectionLinkEnv = ""
let officeConnectionLinkEnv = ""
let mailchimpLinkEnv = ""

//localhost
if(window.location.hostname.indexOf("localhost") > -1){
  serverUrlEnv = "http://localhost:8080"  
} else {  //dev server
  serverUrlEnv = "http://ec2-3-212-172-15.compute-1.amazonaws.com:8080" 
}

export const serverUrl = serverUrlEnv

export const emailLimit = 20
export const adminWebTitle = "LLP"
export const s3Details = {
  url : "https://s3.amazonaws.com/llp-dev",
  bucketName: "llp-dev",
  awsKey: "AKIAUPQ3GZ6WDCCRWVY5",
  awsSecret: "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",
  profilePicturesPath: "profilePictures/",
  apiGatewayUrl: ""
}

export const stripePublishableKey = ""

export const adminSections = [{
  name: 'User Management',
  code: "usermanagement"
}, {
  name: 'Advisor Management',
  code: "advisormanagement"
}, {
  name: 'Activity Log',
  code: "activitylog"
}, {
  name: 'Zip Code map',
  code: "zipcodemap"
}, {
  name: 'CMS pages',
  code: "cms"
},{
  name: 'Referral program',
  code: "referral"
}, {
  name: 'Advertisement management',
  code: "addmanagement"
}, {
  name: 'Deceased requests',
  code: "deceasedrequest"
}, {
  name: 'Admin Management',
  code: "adminmanagement"
}]
