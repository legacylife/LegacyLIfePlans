var constants = {
  secret: "LLP",
  database: {
    url: process.env.dbURI || 'mongodb://llp:llp#123@ds129454.mlab.com:29454/llp'
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
    key: "AKIAJUP324GN7JSNK5XQ",
    secret: "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",
    fromEmail: "dineshpatil@arkenea.com",
  },
  clientUrl: process.env.clientUrl || 'http://localhost:4200',
  mailServerUrl : process.env.mailServerUri || 'http://localhost:8080',
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
