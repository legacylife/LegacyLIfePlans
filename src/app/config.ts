
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
export const coachSteps = [{
  stepNo: 1,
  heading: "Sign up",
  task: "Get one step closer to effective sales pipeline management.",
  link: ""
}, {
  stepNo: 2,
  heading: "Stay on top of your data",
  task: "Import your existing data or start building leads from the scratch.",
  link: "/settings",
  queryParams: { tabName: 'import' }
}, {
  stepNo: 3,
  heading: "Get the events in line",
  task: "Sync your Google calendar or add new events, we make sure that you never miss out on a task.",
  link: "/calendar"
}, {
  stepNo: 4,
  heading: "Import your business contacts",
  task: "Connect with Google to fetch contacts directly or set them up manually.",
  link: "/contacts/person"
}, {
  stepNo: 5,
  heading: "Sync your email",
  task: "Eliminate the need to shuffle between different inboxes.",
  link: "/emailv2/inboxv2"
}, {
  stepNo: 6,
  heading: "Invite the team",
  task: "Selling together is always more fun. Start team integration with Benchpoint.",
  link: "/settings"
}, {
  stepNo: 7,
  heading: "Manage the product inventory",
  task: "Keep track of all your product offerings at a single glance.",
  link: "/product"
}]

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
