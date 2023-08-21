let serverUrlEnv= "http://ec2-44-212-224-69.compute-1.amazonaws.com" // 'http://localhost:3000' // "https://legacylifeplans.com"
let bucketName = "llp-dev";
let awsKey = "AKIATWZWUVETWRGZ3DCN"
let awsSecret =  "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"
let googleauthkey= "AIzaSyA_UFLb71U2E5y_O7F967fwj5KjUfQcz1Q"; 
let stripePublishablekey = "pk_test_K9i8VTQjzDdEwtjyKLZLLtjA00ukf8cqnk" //sandbox
export const googleauthenticationkey = googleauthkey;
export const stripeKey = stripePublishablekey
export const serverUrl = serverUrlEnv

export const emailLimit = 20
export const adminWebTitle = "LLP"
export const s3Details = {
  url : "https://s3.amazonaws.com/"+bucketName,
  awsserverUrl : "https://"+bucketName+".s3.amazonaws.com/",
  bucketName: bucketName,
  awsKey: awsKey,
  awsSecret: awsSecret,
  profilePicturesPath: "profilePictures/",
  advisorsDocumentsPath:"advisorDocs/",
  myEssentialsDocumentsPath:"myEssentials/",
  legalStuffDocumentsPath:"legalStuff/",
  finalWishesFilePath:"finalWishes/",
  obituaryFilePath:"obituary/",
  funeralServicesFilePath:"funeralServices/",
  funeralExpensesFilePath:"funeralExpenses/",
  celebrationofLifeFilePath:"celebrationofLife/",
  timeCapsuleFilePath:"timeCapsule/",
  insuranceFilePath:"insurance/",
  financeFilePath:"finance/",
  debtFilePath:"debt/",
  petsFilePath:"pets/",
  inviteDocumentsPath:"invite/",
  letterMessageDocumentsPath:"letterMessage/",
  deceasedFilessPath:"deceased/",
  coachCornerArticlePath:"coachCorner/",
  assetsPath:"assets/",
  apiGatewayUrl: ""
}

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
}, {
  name: 'EmailTemplate Management',
  code: "emailTemplate"
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
    }, {
      name: 'Digital Publications',
      code: "DigitalPublicationManagement"
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
  }, /*{
    "id" : "10",
    "folderName" : "Legacy Life Letters & Messages",
    'fileNames':[{
      name: 'Legacy Life Letters & Messages',
      code: "LegacyLifeLettersMessagesManagement"
    }],
  },*/ {
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
    }, {
      name: 'Funeral Expenses',
      code: "FuneralExpenseManagement"
    }],
  }
]