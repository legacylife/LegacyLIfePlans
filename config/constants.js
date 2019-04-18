var constants = {
  secret: "LLP",
  database: {
    url: process.env.dbURI || 'mongodb://localhost:27017/llp'
  },
  google: {
  },
  nylas:{
    appId: "135njeakyrw521pbvsm6w20nb",
    appSecret: "27g7mvf6f606237rhxvsi21v8",
  },
  s3Details: {
    url : "https://s3.amazonaws.com/llp",
    bucketName: "llp",
    awsKey: "",
    awsSecret: "",
    dealFilesPath: "dealFiles/",
    profilePicturesPath: "profilePictures/",
    serveUrl: "https://llp.s3.amazonaws.com"
  },
  ses: {
    key: "",
    secret: "",
    fromEmail: "support@llp.com",
  },
  clientUrl: process.env.clientUrl || 'http://localhost:4200',
  mailServerUrl : process.env.mailServerUri || 'http://localhost:3000',
  socialMedia: {
    facebook: {
      clientId: ''
    },
    google: {
      clientId: ''
    }
  },
  stripeSecretKey: ""
}

module.exports = constants
