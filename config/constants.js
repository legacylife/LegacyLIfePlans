var constants = {
  secret: "LLP",
  database: { // mongodb://localhost:27017/llp
    url: process.env.dbURI || 'mongodb://localhost:27017/llp' 
  }, // mongodb://llp:llp#123@ds129454.mlab.com:29454/llp, mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp  mongodb://llp:llp#123@ds213896.mlab.com:13896/llp-pankaj
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
  clientUrl: process.env.clientUrl || 'http://localhost:4200', // staging - http://ec2-3-209-230-58.compute-1.amazonaws.com // client - http://ec2-3-212-172-15.compute-1.amazonaws.com:8080
  mailServerUrl : process.env.mailServerUri || 'http://localhost:8080', // staging - http://ec2-3-209-230-58.compute-1.amazonaws.com // client - http://ec2-3-212-172-15.compute-1.amazonaws.com:8080
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
    1: "Driver's License",
    2: "Non-Driver State ID",
    3: "Department of Defense (DOD)",
    4: "Birth Certificate",
    5: "Social Security Number (SSN)",
    6: "Passport",
    7: "Visa"
  },
  EstateTypeOfDocument: {
    1: "Last Will & Testament",
    2: "Last Will & Testament-with Trust",
    3: "Affidavit of Domicile",
    4: "Affidavit of Heirship",
    5: "Codicil",
    6: "Joint Revocable Living Trust",
    7: "Revocable Living Trust",
    8: "Irrevocable Trust"
  },
  HealthcareTypeOfDocument: {
    1: "Advance Healthcare Directive",
    2: "Healthcare Power of Attorney",
    3: "Health Care Proxy",
    4: "Living Will",
    5: "Medical Power of Attorney"
  },
  PersonalAffairsTypeOfDocument: {
    1: "Power of Attorney",
    2: "Durable Power of Attorney",
    3: "Revocation of Power of Attorney"
  },

  InsurancePolicyType : { 
    1 : "Home Owners" ,
    2 : "Auto",   
    3 : "Business", 
    4 : "Life",
    5 : "Umbrella" 
  },
  
  FinancePolicyType : { 
    1 : "Bank Accounts", 
    2 : "Annuity", 
    3 : "Disability", 
    4 : "Pension", 
    5 : "Roth", 
    6 : "IRA", 
    7 : "401K", 
    8 : "Brokerage Accounts", 
    9 : "Social Security", 
    10 : "New",
  }, 
  
  DebtType : { 
    1 : "Credit Cards", 
    2 : "Mortgage", 
    3 : "Car loans", 
    4 : "2nd Mortgage", 
    5 : "Personal Loans", 
    6 : "IOU’s", 
    7 : "New"
  },  
  
  
  DevicesList : { 
    1 : "Computers", 
    2 : "Laptop", 
    3 : "i-pad", 
    4 : "Tablet", 
    5 : "Phone", 
    6 : "Watch"
  },

  RealEstateType : {
    1 : "Personal Home", 
    2 : "Rental", 
    3 : "Commercial" 
  },
  
  RealEstateAssetsType : {
    1 : "Safe", 
    2 : "Safe Deposit Box", 
    3 : "Box", 
    4 : "Art", 
    5 : "Jewelry", 
    6 : "New"
  },

  ElectronicMediaLists : { 
    1 : "Gmail", 
    2 : "Yahoo", 
    3 : "Outlook", 
    4 : "ebay", 
    5 : "Amazon", 
    6 : "Facebook", 
    7 : "Instagram", 
    8 : "Twitter", 
    9 : "LinkedIn", 
    10 : "Google", 
    11 : "Snapchat", 
    12 : "Flickr", 
    13 : "iTunes", 
    14 : "Vimeo", 
    15 : "YouTube", 
    16 : "Pinterest", 
    17 : "Quora", 
    18 : "Reddit", 
    19 : "Mix", 
    20 : "Plazo", 
    21 : "Ning", 
    22 : "Mylife", 
    23 : "Bing", 
    24 : "Periscope"  
  }
  

}

module.exports = constants
