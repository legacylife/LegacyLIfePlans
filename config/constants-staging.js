var constants = {
  secret: "LLP",
  database: { // mongodb://localhost:27017/llp
    url: process.env.dbURI || 'mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp'
  }, // mongodb://llp:llp#123@ds129454.mlab.com:29454/llp, mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp
  google: {
  },
  nylas:{
    appId: "135njeakyrw521pbvsm6w20nb",
    appSecret: "27g7mvf6f606237rhxvsi21v8",
  },
  s3Details: {
    url : "https://s3.amazonaws.com/llp-staging",
    bucketName: "llp-staging",
    awsKey:"AKIAUPQ3GZ6WDCCRWVY5",
    awsSecret:"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",
    profilePicturesPath:"profilePictures/",
    advisorsDocumentsPath:"advisorDocs/",
    myEssentialsDocumentsPath:"myEssentials/",
    legalStuffDocumentsPath:"legalStuff/",
    finalWishesFilePath:"finalWishes/",
    serveUrl: "https://llp-staging.s3.amazonaws.com"
  },
  ses: {
    key: "AKIAUPQ3GZ6WJFHZAMNB",
    secret: "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",
    fromEmail: "subodh@arkenea.com",
  },
  clientUrl: process.env.clientUrl || 'http://ec2-3-209-230-58.compute-1.amazonaws.com:4200',
  mailServerUrl : process.env.mailServerUri || 'http://ec2-3-209-230-58.compute-1.amazonaws.com:8080',
  socialMedia: {
    facebook: {
      clientId: ''
    },
    google: {
      clientId: ''
    }
  },
  stripeSecretKey: "sk_test_ni2JhTNSaNPgEZVHeiciAVVs00YF0EGLTR"
}

module.exports = constants
