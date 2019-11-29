var constants = {
  secret: "LLP",
  database: { // mongodb://localhost:27017/llp-pankaj     mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp -staging
    url: process.env.dbURI || 'mongodb://llp:l$l!p#123@ds341557.mlab.com:41557/llp'//'mongodb+srv://leg3rxbwrpmlcy:rw4hxvd4vtvqqpve@legacy-production-aqr1f.mongodb.net/llp-prod?retryWrites=true&w=majority' 
    //leg3rxbwrpmlcy:rw4hxvd4vtvqqpve@legacy-production-aqr1f.mongodb.net/llp-prod?retryWrites=true
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
    obituaryFilePath:"obituary/",
    funeralExpensesFilePath:"funeralExpenses/",
    funeralServicesFilePath:"funeralServices/",
    celebrationofLifeFilePath:"celebrationofLife/",
    timeCapsuleFilePath:"timeCapsule/",
    petsFilePath:"pets/",
    insuranceFilePath:"insurance/",
    financeFilePath:"finance/",
    debtFilePath:"debt/",
    inviteDocumentsPath:"invite/",
    letterMessageFilePath:"letterMessage/",
    deceasedFilessPath:"deceased/",
    coachCornerArticlePath:"coachCorner/",
    assetsPath:"assets/",
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
  stripeSecretKey: "sk_test_ni2JhTNSaNPgEZVHeiciAVVs00YF0EGLTR",//sk_test_eXXvQMZIUrR3N1IEAqRQVTlw test server // sk_test_ni2JhTNSaNPgEZVHeiciAVVs00YF0EGLTR // client server

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
    3 : "Disability", 
    4 : "Errors & Omissions",
    5 : "Health",
    6 : "Home Owners",   
    7 : "Life",
    8 : "Long Term Care", 
    9 : "Travel",
    10 : "Umbrella"
  },  
  FinancePolicyType : { 
    1 : "401K", 
    2 : "Annuity", 
    3 : "Bank Checking", 
    4 : "Bank Money Market", 
    5 : "Bank Savings", 
    6 : "Brokerage Cash", 
    7 : "Brokerage Margin", 
    8 : "Brokerage Option", 
    9 : "Business Checking", 
    10 : "Business Money Market",
    11 : "Business Savings", 
    12 : "IRA", 
    13 : "Pension", 
    14 : "Roth", 
    15 : "Social Security", 
    16 : "New"
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
  lockLegacyPeriodType : {
    1 : 1,
    2 : 3, 
    3 : 5
  },
  RealEstateAssetsType : {
    1 : "Antiques", 
    2 : "Art", 
    3 : "Collectibles", 
    4 : "Equipment", 
    5 : "Guns", 
    6 : "Jewelry",
    7 : "Safe", 
    8 : "Safe Deposit Box", 
    9 : "Tools", 
    10 : "New"
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
  },

  funeralOptions : {
    1:"I would prefer a traditional funeral",
    2:"I would prefer a memorial service",
    3:"I would prefer cremation",
    4:"I do not want a funeral or memorial service"
  }, 

  expenseOptions : {
    1:"I have made prearrangements with the funeral home",
    2:"I have a preneed contract",
    3:"I do not have any funeral pre-arrangements"
  }
  

}

module.exports = constants
