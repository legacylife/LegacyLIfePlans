var constants = {
  secret: "LLP",
  database: { // mongodb://localhost:27017/llp
    url: process.env.dbURI || 'mongodb://llp:llp#123@ds129454.mlab.com:29454/llp'
  }, // mongodb://llp:llp#123@ds129454.mlab.com:29454/llp
  google: {
  },
  nylas:{
    appId: "135njeakyrw521pbvsm6w20nb",
    appSecret: "27g7mvf6f606237rhxvsi21v8",
  },
  s3Details: {
    url : "https://s3.amazonaws.com/llp-dev",
    bucketName: "llp-dev",
    awsKey:"AKIAUPQ3GZ6WDCCRWVY5",
    awsSecret:"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",
    profilePicturesPath:"profilePictures/",
    advisorsDocumentsPath:"advisorDocs/",
    myEssentialsDocumentsPath:"myEssentials/",
    legalStuffDocumentsPath:"legalStuff/",
    serveUrl: "https://llp-dev.s3.amazonaws.com"
  },
  ses: {
    key: "AKIAUPQ3GZ6WJFHZAMNB",
    secret: "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",
    fromEmail: "subodh@arkenea.com",
  },
  clientUrl: process.env.clientUrl || 'http://ec2-3-212-172-15.compute-1.amazonaws.com:8080',
  mailServerUrl : process.env.mailServerUri || 'http://ec2-3-212-172-15.compute-1.amazonaws.com:8080',
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
