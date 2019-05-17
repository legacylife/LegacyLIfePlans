
let serverUrlEnv= ""
let nylasConnectionLinkEnv = ""
let gmailConnectionLinkEnv = ""
let officeConnectionLinkEnv = ""
let mailchimpLinkEnv = ""

//localhost
if(window.location.hostname.indexOf("localhost") > -1){
  serverUrlEnv = "http://localhost:8080"  
} else {  //dev server
  serverUrlEnv = "" 
}

export const serverUrl = serverUrlEnv

export const emailLimit = 20
export const adminWebTitle = "LLP"
export const s3Details = {
  url : "",
  bucketName: "",
  awsKey: "",
  awsSecret: "",
  dealFilesPath: "dealFiles/",
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
