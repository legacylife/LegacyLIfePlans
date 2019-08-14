
let serverUrlEnv= ""
let nylasConnectionLinkEnv = ""
let gmailConnectionLinkEnv = ""
let officeConnectionLinkEnv = ""
let mailchimpLinkEnv = ""
let bucketName = ""
let stripeSecretKey= ""

//localhost
if(window.location.hostname.indexOf("localhost") > -1){ // local server
  serverUrlEnv = "http://localhost:8080"  
  stripeSecretKey = "pk_test_mB9cnQ2EBtmIiIPUi0kQgIxC"
}
else if(window.location.hostname.indexOf("ec2-3-212-172-15.compute-1.amazonaws.com") > -1 || window.location.hostname.indexOf("ec2-3-212-172-15.compute-1.amazonaws.com:8080") > -1){ // client server
  serverUrlEnv = "http://ec2-3-212-172-15.compute-1.amazonaws.com:8080"  
  stripeSecretKey = "pk_test_K9i8VTQjzDdEwtjyKLZLLtjA00ukf8cqnk"
}
else if(window.location.hostname.indexOf("ec2-3-209-230-58.compute-1.amazonaws.com") > -1){ // test server
  serverUrlEnv = "http://ec2-3-209-230-58.compute-1.amazonaws.com"  
  stripeSecretKey = "pk_test_K9i8VTQjzDdEwtjyKLZLLtjA00ukf8cqnk"
}
else {  //dev server
  serverUrlEnv = "http://ec2-3-212-172-15.compute-1.amazonaws.com:8080" 
  stripeSecretKey = "pk_test_K9i8VTQjzDdEwtjyKLZLLtjA00ukf8cqnk"
}

if(window.location.hostname.indexOf("ec2-3-212-172-15.compute-1.amazonaws.com") > -1 || window.location.hostname.indexOf("ec2-3-212-172-15.compute-1.amazonaws.com:8080") > -1 )
{
  bucketName = "llp-dev";
} else {
  bucketName = "llp-staging";
}
export const stripeKey = stripeSecretKey
export const serverUrl = serverUrlEnv

export const emailLimit = 20
export const adminWebTitle = "LLP"
export const s3Details = {
  url : "https://s3.amazonaws.com/"+bucketName,
  bucketName: bucketName,
  awsKey: "AKIAUPQ3GZ6WDCCRWVY5",
  awsSecret: "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",
  profilePicturesPath: "profilePictures/",
  advisorsDocumentsPath:"advisorDocs/",
  myEssentialsDocumentsPath:"myEssentials/",
  legalStuffDocumentsPath:"legalStuff/",
  finalWishesFilePath:"finalWishes/",
  timeCapsuleFilePath:"timeCapsule/",
  insuranceFilePath:"insurance/",
  financeFilePath:"finance/",
  debtFilePath:"debt/",
  petsFilePath:"pets/",
  inviteDocumentsPath:"invite/",
  letterMessageDocumentsPath:"letterMessage/",
  apiGatewayUrl: ""
}

export const stripePublishableKey = ""

export const adminSections = [{
  name: 'Customer Management',
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

export const userSections = [
  {
    "id" : "1",
    "folderName" : "My Essentials",
    'fileNames': [{
      name: 'Personal Profile',
      code: "PersonalProfileManagement"
    }, {
      name: 'ID Box',
      code: "IDBoxManagement"
    }, {
      name: 'My Professionals',
      code: "MyProfessionalsManagement"
    }],
  }, {
    "id" : "2",
    "folderName" : "Insurance Finance & Debt",
    'fileNames': [{
      name: 'Insurance',
      code: "InsuranceManagement"
    }, {
      name: 'Finances',
      code: "FinancesManagement"
    }, {
      name: 'Debt',
      code: "DebtManagement"
    }
    ],
  }, {
    "id" : "3",
    "folderName" : "Pets",
    'fileNames': [{
      name: 'Pets',
      code: "PetsManagement"
    }],
  }, {
    "id" : "4",
    "folderName" : "Special Needs",
    'fileNames':[{
      name: 'Young Children',
      code: "YoungChildrenManagement"
    }, {
      name: 'Child/Parent with Disability',
      code: "ChildParentDisabilityManagement"
    }, {
      name: 'Friend/Neighbor you provide or care for',
      code: "FriendNeighborCareManagement"
    }],
  }, {
    "id" : "5",
    "folderName" : "Legal Stuff",
    'fileNames':[{
      name: 'Estate',
      code: "EstateManagement"
    }, {
      name: 'Healthcare',
      code: "HealthcareManagement"
    }, {
      name: 'Personal Affairs',
      code: "PersonalAffairsManagement"
    }],
  }, {
    "id" : "6", 
    "folderName" : "Passwords Digital & Assests",
    'fileNames': [{
      name: 'Devices',
      code: "DevicesManagement"
    }, {
      name: 'Electronic Media',
      code: "ElectronicMediaManagement"
    }],
  }, {
    "id" : "7",
    "folderName" : "Emergency Contacts",
    'fileNames':[{
      name: 'Contacts',
      code: "emergencyContactsManagement"
    }],
  }, {
    "id" : "8",
    "folderName" : "Real Estates & Assets",
    'fileNames':[{
      name: 'Real Estate',
      code: "RealEstateManagement"
    }, {
      name: 'Vehicles',
      code: "VehiclesManagement"
    }, {
      name: 'Assets',
      code: "AssetsManagement"
    }],
  }, {
    "id" : "9",
    "folderName" : "Time Capsule",
    'fileNames': [{
      name: 'Time Capsule',
      code: "TimeCapsuleManagement"
    }],
  }, {
    "id" : "10",
    "folderName" : "Legacy Life Letters & Messages",
    'fileNames':[{
      name: 'Legacy Life Letters & Messages',
      code: "LegacyLifeLettersMessagesManagement"
    }],
  }, {
    "id" : "11",
    "folderName" : "Final Wishes",
    'fileNames':[{
      name: 'Funeral Plans',
      code: "FuneralPlansManagement"
    }, {
      name: 'Obituary',
      code: "ObituaryManagement"
    }, {
      name: 'Celebration of Life',
      code: "CelebrationLifeManagement"
    }],
  }
]
//   name: 'My People',
//   code: "MyPeopleManagement"

