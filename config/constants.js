var constants = {
  secret: "LLP",
  database: { // mongodb://localhost:27017/llp
    url: process.env.dbURI || 'mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp' 
  }, // mongodb://llp:llp#123@ds129454.mlab.com:29454/llp, mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp  mongodb://llp:llp#123@ds213896.mlab.com:13896/llp-pankaj
  google: {
  },
  nylas:{
    appId: "135njeakyrw521pbvsm6w20nb",
    appSecret: "27g7mvf6f606237rhxvsi21v8",
  },
  stripeSecretKey:'sk_test_eXXvQMZIUrR3N1IEAqRQVTlw', //sk_test_eXXvQMZIUrR3N1IEAqRQVTlw test server // sk_test_ni2JhTNSaNPgEZVHeiciAVVs00YF0EGLTR // client server
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
    timeCapsuleFilePath:"timeCapsule/",
    petsFilePath:"pets/",
    insuranceFilePath:"insurance/",
    financeFilePath:"finance/",
    debtFilePath:"debt/",
    inviteDocumentsPath:"invite/",
    letterMessageFilePath:"letterMessage/",
    serveUrl: "https://llp-staging.s3.amazonaws.com" 
  },
  ses: {
    key: "AKIAUPQ3GZ6WJFHZAMNB",
    secret: "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",
    fromEmail: "accountservices@legacylifeplans.com",
  }, // Local - http://localhost:4200 & http://localhost:80
  clientUrl: process.env.clientUrl || 'http://ec2-3-209-230-58.compute-1.amazonaws.com', // staging - http://ec2-3-209-230-58.compute-1.amazonaws.com // client - http://ec2-3-212-172-15.compute-1.amazonaws.com:8080
  mailServerUrl : process.env.mailServerUri || 'http://ec2-3-209-230-58.compute-1.amazonaws.com', // staging - http://ec2-3-209-230-58.compute-1.amazonaws.com // client - http://ec2-3-212-172-15.compute-1.amazonaws.com:8080
  socialMedia: {
    facebook: {
      clientId: ''
    },
    google: {
      clientId: ''
    }
  },
  stripeSecretKey: "",

  basicFolders: [
   "advisorDocs",
   "myEssentials",
   "legalStuff",
   "finalWishes",
   "timeCapsule",
   "pets",
   "insurance",
   "finance",
   "debt",
   "invite",
   "letterMessage"
  ],
  documentTypes: {
    1: "Birth Certificate",
    2: "Department of Defense (DOD)",
    3: "Driver's License",
    4: "Non-Driver State ID",
    5: "Passport",    
    6: "Social Security Number (SSN)",        
    7: "Visa"
  },
  EstateTypeOfDocument: {
    1: "Affidavit of Domicile",
    2: "Affidavit of Heirship",
    3: "Codicil",
    4: "Irrevocable Trust",
    5: "Joint Revocable Living Trust",
    6: "Last Will & Testament",
    7: "Last Will & Testament-with Trust",    
    8: "Revocable Living Trust"
  },
  HealthcareTypeOfDocument: {
    1: "Advance Healthcare Directive",
    2: "Health Care Power of Attorney",
    3: "Health Care Proxy",
    4: "Living Will",
    5: "Medical Power of Attorney"
  },
  PersonalAffairsTypeOfDocument: {
    1: "Durable Power of Attorney",
    2: "Power of Attorney",
    3: "Revocation of Power of Attorney"
  },
  InsurancePolicyType : { 
    1 : "Auto",   
    2 : "Business",
    3 : "Home Owners", 
    4 : "Life",
    5 : "Umbrella"
  },  
  FinancePolicyType : { 
    7 : "401K", 
    1 : "Annuity", 
    2 : "Bank Accounts", 
    8 : "Brokerage Accounts", 
    3 : "Disability", 
    6 : "IRA", 
    4 : "Pension", 
    5 : "Roth", 
    9 : "Social Security", 
    10 : "New"
  }, 
  
  DebtType : { 
    1 : "2nd Mortgage",     
    2 : "Car loans", 
    3 : "Credit Cards", 
    4 : "IOU’s", 
    5 : "Mortgage", 
    6 : "Personal Loans",    
    7 : "New"
  },
  
  DevicesList : { 
    1 : "Computers",     
    2 : "i-Pad", 
    3 : "Laptop",     
    4 : "Phone", 
    5 : "Tablet", 
    6 : "Watch"
  },

  RealEstateType : {
    1 : "Commercial",
    2 : "Personal Home", 
    3 : "Rental"
  },
  
  RealEstateAssetsType : {
    1 : "Art", 
    2 : "Box", 
    3 : "Jewelry", 
    4 : "Safe", 
    5 : "Safe Deposit Box", 
    6 : "New"
  },

  ElectronicMediaLists : { 
    1 : "Amazon", 
    2 : "Bing",
    3 : "ebay",
    4 : "Facebook",
    5 : "Flickr",
    6 : "Gmail",
    7 : "Google",
    8 : "iTunes",
    9 : "Instagram",
    10 : "LinkedIn",
    11 : "Mix",
    12 : "Mylife",
    13 : "Ning",
    14 : "Outlook",
    15 : "Periscope",
    16 : "Pinterest",
    17 : "Plazo",
    18 : "Quora",
    19 : "Reddit",
    20 : "Snapchat",
    21 : "Twitter",
    22 : "Vimeo",
    23 : "Yahoo",
    24 : "YouTube"
  }
  

}

module.exports = constants
