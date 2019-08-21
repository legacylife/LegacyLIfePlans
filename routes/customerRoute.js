var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')

var async = require('async')
var crypto = require('crypto')
var fs = require('fs')
var nodemailer = require('nodemailer')
const { isEmpty, cloneDeep } = require('lodash')
const Busboy = require('busboy')
// const Mailchimp = require('mailchimp-api-v3')
const commonhelper = require('./../helpers/commonhelper')

const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const myessentials = require('./../models/myessentials.js')
const emergencyContacts = require('./../models/EmergencyContacts.js')
const personalIdProof = require('./../models/personalIdProof.js')
const MyProfessional = require('./../models/MyProfessionals.js')
const LegalStuff = require('./../models/LegalStuff.js')
const FileActivityLog = require('./../models/FileActivityLog.js')
const SpecialNeeds = require('./../models/SpecialNeeds.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')
const Trustee = require('./../models/Trustee.js')
const HiredAdvisors = require('./../models/HiredAdvisors.js')
const InviteTemp = require('./../models/InviteTemp.js')
const referEarnSettings = require('./../models/ReferEarnSettings')
var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function myEssentialsUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  var logData = {}
  logData.fileName = proquery.ppFirstName + ' ' + proquery.ppLastName;
  logData.folderName = 'myessential';
  logData.subFolderName = 'personal-profile';

  if (query._id) {
    myessentials.findOne(query, function (err, custData) {

      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          let { from } = req.body;
          proquery.modifiedOn = new Date();
          myessentials.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              if (!proquery.ppFirstName) {
                logData.fileName = custData.ppFirstName + ' ' + custData.ppLastName;
              }
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Personal profile details " + from.personalProfileAction + " successfully", "ppID": custData._id }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else {
    let { proquery } = req.body;
    let { from } = req.body;
    var myessential = new myessentials();
    myessential.customerId = from.customerId;
    myessential.customerLegacyId = proquery.customerLegacyId;
    myessential.customerLegacyType = proquery.customerLegacyType;
    myessential.ppFirstName = proquery.ppFirstName;
    myessential.ppMiddleName = proquery.ppMiddleName;
    myessential.ppLastName = proquery.ppLastName;
    myessential.ppDateOfBirth = proquery.ppDateOfBirth;
    myessential.ppEmails = proquery.ppEmails;
    myessential.ccChurchLandlineNumbers = proquery.ccChurchLandlineNumbers;
    myessential.ccWorkLandlineNumbers = proquery.ccWorkLandlineNumbers;
    myessential.cclandlineNumbers = proquery.cclandlineNumbers;
    myessential.ppAddressLine1 = proquery.ppAddressLine1;
    myessential.ppAddressLine2 = proquery.ppAddressLine2;
    myessential.ppCity = proquery.ppCity;
    myessential.ppCountry = proquery.ppCountry;
    myessential.ppLandlineNumbers = proquery.ppLandlineNumbers;
    myessential.ppState = proquery.ppState;
    myessential.ppZipCode = proquery.ppZipCode;
    myessential.wpLandlineNumbers = proquery.wpLandlineNumbers;
    myessential.status = 'Active';
    myessential.createdOn = new Date();
    myessential.modifiedOn = new Date();
    myessential.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "My Essentials";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        let result = { "message": "Personal profile details added successfully", "ppID": newEntry._id }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }

}
//function to get list of essential profile details as per given criteria
function essentialProfileList(req, res) {

  let { fields, offset, query,personalProfileQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  myessentials.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    myessentials.find(query, fields, function (err, essentialList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalTrusteeRecords = 0;
        if(essentialList){
          Trustee.count(personalProfileQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({ essentialList, totalRecords,totalTrusteeRecords }))
        })
       }else{
        res.send(resFormat.rSuccess({ essentialList, totalRecords,totalTrusteeRecords }))
       }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function essentialIdList(req, res) {
  let { fields, offset, query, idQuery, order, limit, search } = req.body
  personalIdProof.find(query, fields, function (err, essentialIDList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      totalIDRecords = essentialIDList.length;
      let totalTrusteeIDRecords = 0;
    if(totalIDRecords>0){
      Trustee.count(idQuery, function (err, TrusteeCount) {
        if (TrusteeCount) {
          totalTrusteeIDRecords = TrusteeCount
        }
        res.send(resFormat.rSuccess({ essentialIDList, totalIDRecords, totalTrusteeIDRecords }))
      })
    }else{
      res.send(resFormat.rSuccess({ essentialIDList, totalIDRecords, totalTrusteeIDRecords }))
    }
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewEssentialID(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  personalIdProof.findOne(query, fields, function (err, essentialIDList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(essentialIDList))
    }
  })
}

function essentialProfessionalsList(req, res) {
  let { fields, offset, query,professionalsQuery, order, limit, search } = req.body
  MyProfessional.find(query, fields, function (err, essentialProfessionalList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      totalProfessionalRecords = essentialProfessionalList.length;
      let totalTrusteeProfessionalsRecords = 0;
      if(totalProfessionalRecords>0){
        Trustee.count(professionalsQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeProfessionalsRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({ essentialProfessionalList, totalProfessionalRecords ,totalTrusteeProfessionalsRecords}))
        })
      }else{
        res.send(resFormat.rSuccess({ essentialProfessionalList, totalProfessionalRecords, totalTrusteeProfessionalsRecords }))
      }
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewEssentialProfile(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  myessentials.findOne(query, fields, function (err, profileData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(profileData))
    }
  })
}

function emergencyContactsSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  var logData = {}
  logData.fileName = proquery.name;
  logData.folderName = 'emergency_contacts';
  logData.subFolderName = 'emergency_contacts';

  if (query._id) {
    emergencyContacts.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          proquery.modifiedOn = new Date();
          emergencyContacts.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Emergency contacts details have been updated successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else {
    let { proquery } = req.body;
    var emergency = new emergencyContacts();
    emergency.customerId = from.customerId;
    emergency.customerLegacyId = proquery.customerLegacyId;
    emergency.customerLegacyType = proquery.customerLegacyType;
    emergency.address = proquery.address;
    emergency.emailAddress = proquery.emailAddress;
    emergency.mobile = proquery.mobile;
    emergency.name = proquery.name;
    emergency.phone = proquery.phone;
    emergency.relationship = proquery.relationship;
    emergency.status = 'Active';
    emergency.createdOn = new Date();
    emergency.modifiedOn = new Date();
    emergency.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Emergency Contacts";  
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }
        
        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": "Emergency contacts details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function viewEmergencyContacts(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  emergencyContacts.findOne(query, fields, function (err, profileData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(profileData))
    }
  })
}

function deleteEcontact(req, res) {
  let { query } = req.body;
  let fields = {}
  emergencyContacts.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      emergencyContacts.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function viewEssentialProfessionals(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  MyProfessional.findOne(query, fields, function (err, profileData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(profileData))
    }
  })
}

function personalIdUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  var logData = {}
  logData.fileName = constants.documentTypes[proquery.documentType];
  logData.folderName = 'myessential';
  logData.subFolderName = 'id-box';

  if (query._id) {
    personalIdProof.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          let resText = 'added';
          if (custData.documentType) {
            resText = 'updated';
          }else{
            /*
            if(proquery.customerLegacyType == 'advisor'){
              var sendData = {}
              sendData.sectionName = "My Essentials";
              sendData.customerId = custData.customerId;
              sendData.customerLegacyId = proquery.customerLegacyId;
              commonhelper.customerAdvisorLegacyNotifications(sendData)
            }
            */
          }
          proquery.modifiedOn = new Date();
          proquery.status = 'Active';
          personalIdProof.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "ID box details " + resText + " successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else {
    let { proquery } = req.body;
    var personal = new personalIdProof();
    proquery.customerId = from.customerId;
    proquery.customerLegacyId = proquery.customerLegacyId;
    proquery.customerLegacyType = proquery.customerLegacyType;
    proquery.status = 'Active';
    proquery.createdOn = new Date();
    proquery.modifiedOn = new Date();
    personal.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "My Essentials";
          sendData.customerId = from.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        } 

        logData.customerId = from.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);
        let result = { "message": "ID box details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function deleteProfile(req, res) {
  let { query } = req.body;
  let fields = {}
  myessentials.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      myessentials.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function myProfessionalsUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;

  var logData = {}
  logData.fileName = proquery.businessName;
  logData.folderName = 'myessential';
  logData.subFolderName = 'essential-professionals';

  if (query._id) {
    MyProfessional.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          proquery.modifiedOn = new Date();
          MyProfessional.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "Professional details updated successfully!", "ppID": custData._id }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else {
    let { proquery } = req.body;
    var profesion = new MyProfessional();
    profesion.customerId = proquery.customerId;
    profesion.customerLegacyId = proquery.customerLegacyId;
    profesion.customerLegacyType = proquery.customerLegacyType;
    profesion.namedProfessionals = proquery.namedProfessionals;
    profesion.businessName = proquery.businessName;
    profesion.name = proquery.name;
    profesion.address = proquery.address;
    profesion.mpPhoneNumbers = proquery.mpPhoneNumbers;
    profesion.mpEmailAddress = proquery.mpEmailAddress;
    profesion.status = 'Active';
    profesion.createdOn = new Date();
    profesion.modifiedOn = new Date();
    profesion.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        
        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "My Essentials";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = proquery.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": "Professional details added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}


function deleteProfessionals(req, res) {
  let { query } = req.body;
  let fields = {}
  MyProfessional.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      MyProfessional.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function legalStuffUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { message } = req.body;

  var logData = {}
  if (proquery.subFolderName == 'Estate') {
    logData.fileName = constants.EstateTypeOfDocument[proquery.typeOfDocument];
  }
  if (proquery.subFolderName == 'Healthcare') {
    logData.fileName = constants.HealthcareTypeOfDocument[proquery.typeOfDocument];
  }
  if (proquery.subFolderName == 'Personal Affairs') {
    logData.fileName = constants.PersonalAffairsTypeOfDocument[proquery.typeOfDocument];
  }

  logData.folderName = 'legalstuff';
  logData.subFolderName = proquery.subFolderName;

  if (query._id) {
    LegalStuff.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.typeOfDocument) {
            resText = 'details updated';
          }
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          LegalStuff.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": message.messageText + " " + resText + " successfully" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let result = { "message": "No record found." }
          res.send(resFormat.rError(result));
        }
      }
    })
  } else {
    let { proquery } = req.body;
    var legals = new LegalStuff();
    legals.customerId = proquery.customerId;
    legals.customerLegacyId = proquery.customerLegacyId;
    legals.customerLegacyType = proquery.customerLegacyType;
    legals.subFolderName = proquery.subFolderName;
    legals.typeOfDocument = proquery.typeOfDocument;
    legals.comments = proquery.comments;
    legals.status = 'Active';
    legals.createdOn = new Date();
    legals.modifiedOn = new Date();
    legals.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        //created helper for customer to send email about files added by advisor
        if(proquery.customerLegacyType == "advisor"){
          var sendData = {}
          sendData.sectionName = "Legal Stuff";  
          sendData.customerId = proquery.customerId;
          sendData.customerLegacyId = proquery.customerLegacyId;
          commonhelper.customerAdvisorLegacyNotifications(sendData)
        }

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": message.messageText + " added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function legalStuffUpdate1(req, res) {
  let { query } = req.body;
  let { message } = req.body;
  if (query.customerId) {
    LegalStuff.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong! Please signin again." }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData.customerId) {
          let { proquery } = req.body;
          proquery.status = 'Active';
          proquery.modifiedOn = new Date();
          LegalStuff.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": message.messageText + " updated successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
          let { proquery } = req.body;
          var legals = new LegalStuff();
          legals.customerId = query.customerId;
          legals.subFolderName = proquery.subFolderName;
          legals.typeOfDocument = proquery.typeOfDocument;
          legals.comments = proquery.comments;
          legals.status = 'Active';
          legals.createdOn = new Date();
          legals.modifiedOn = new Date();
          legals.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": message.messageText + " have been added successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        }
      }
    })
  } else {
    let result = { "message": "You have logout! Please signin again." }
    res.send(resFormat.rError(result));
  }
}

function viewLegalStuffDetails(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  LegalStuff.findOne(query, fields, function (err, LegalStuffList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(LegalStuffList))
    }
  })
}

function deleteIdBox(req, res) {
  let { query } = req.body;
  let fields = {}
  personalIdProof.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      personalIdProof.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(profileInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


// get emergency Contacts of customer
function getEmergencyContacts(req, res) {
  let { fields, offset, query,trusteeQuery, order, limit, search } = req.body
  emergencyContacts.find(query, function (err, eContactsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      let totalTrusteeRecords = 0;
      if(eContactsList.length>0){
        Trustee.count(trusteeQuery, function (err, TrusteeCount) {
          if (TrusteeCount) {
            totalTrusteeRecords = TrusteeCount
          }
          res.send(resFormat.rSuccess({ eContactsList,totalTrusteeRecords}))
        })
      }else{
        res.send(resFormat.rSuccess({ eContactsList,totalTrusteeRecords}))
      }
    }
  }).sort(order).skip(offset).limit(limit)
}


function legalEstateList(req, res) {
  let { fields, offset, query, trusteeQuery, order, limit, search } = req.body
  let totalRecords = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function (key, index) {
      if (key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }
  LegalStuff.count(query, function (err, listCount) {
    if (listCount) {
      totalRecords = listCount
    }
    LegalStuff.find(query, fields, function (err, legalList) {
      if (err) {
        res.status(401).send(resFormat.rError(err))
      } else {
        let totalEstateTrusteeRecords = 0; let totalHealthTrusteeRecords = 0; let totalPerAffTrusteeRecords = 0;
        if(totalRecords>0){
            Trustee.find(query, function (err, trusteeList) {          
              const EstateList = trusteeList.filter(dtype => {
                return dtype.userAccess.EstateManagement == 'now'
              }).map(el => el)
               totalEstateTrusteeRecords = EstateList.length;

              const HealthList = trusteeList.filter(dtype => {
                return dtype.userAccess.HealthcareManagement == 'now'
              }).map(el => el)
               totalHealthTrusteeRecords = HealthList.length;

              const PersonalAffairsList = trusteeList.filter(dtype => {
                return dtype.userAccess.PersonalAffairsManagement == 'now'
              }).map(el => el)
               totalPerAffTrusteeRecords = PersonalAffairsList.length;
          
              res.send(resFormat.rSuccess({ legalList,totalRecords,totalEstateTrusteeRecords,totalHealthTrusteeRecords,totalPerAffTrusteeRecords}))      
          })
        }else{
          res.send(resFormat.rSuccess({ legalList,totalRecords,totalEstateTrusteeRecords,totalHealthTrusteeRecords,totalPerAffTrusteeRecords}))
        }
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function deleteLegalStuff(req, res) {
  let { query } = req.body;
  let fields = {}
  LegalStuff.findOne(query, fields, function (err, legalInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      LegalStuff.update({ _id: legalInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          actitivityLog.removeActivityLog(legalInfo._id);
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function fileActivityLogList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  FileActivityLog.find(query, fields, function (err, activityLogList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      totalRecords = activityLogList.length;
      res.send(resFormat.rSuccess({ activityLogList, totalRecords }))
    }
  }).sort(order).skip(offset).limit(limit)
}

function getSharedLegaciesList(req,res){  
  let { query } = req.body
  
  Trustee.find(query, {customerId:1},  function (err, list) {
    let trustLength = list.length;
    if(trustLength>0){
      let userData = []
      for(let index=0;index<trustLength;index++){
        userData.push(list[index].customerId)
      }
      User.find({"_id" : { $in: userData } },{ '_id':1, 'firstName': 1, 'lastName': 1 , 'profilePicture': 1}, function (err, results) {
        res.send(resFormat.rSuccess({ results }))
      })
    }
  })
}

function legacyUserRemove(req,res){
  let query  = req.body;
  let userstring = ''
  let userData = { status: 'Deleted', modifiedOn : new Date() }
   if( query.userType == 'advisor'){
    HiredAdvisors.updateMany({ customerId : query.customerId, advisorId : query.advisorId }, userData , function (err, updatedDetails){ });
    userstring = 'Advisor'
  }else{
    Trustee.updateMany({ customerId : query.customerId, trustId : query.trustId }, userData , function (err, updatedDetails){});
    userstring = 'Trustee'
  }
  let result = { "message": userstring + " removed successfully" }
  res.status(200).send(resFormat.rSuccess(result))   
}

function viewInviteDetails(req, res) {
  let { query } = req.body;
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  InviteTemp.find(query, fields, function (err, InviteList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(InviteList))
    }
  })
}

async function referAndEarnParticipate(req, res) {
  //Get latest count and status of refer and Earn settings to update for advisor to getting free access
  let referEarnSettingsArr    = await referEarnSettings.findOne()
  const referEarnTargetCount  = Number(referEarnSettingsArr.targetCount)
  const referEarnExtendedDays = Number(referEarnSettingsArr.extendedDays)
  
  var newDt = new Date()
      newDt.setDate(newDt.getDate() + referEarnExtendedDays)
  var params = {  IamIntrested: 'Yes',
                  refereAndEarnSubscriptionDetail: {  endDate: '',
                                                      targetCount: referEarnTargetCount,
                                                      noOfDaysExtended: referEarnExtendedDays,
                                                      updatedOn: new Date(),
                                                      status: 'Active'
                                                    }
                  }
  User.updateOne({ _id: ObjectId(req.body.userId) }, params, function (err, updatedDetails) {
    
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      let result = { "message": "Record updated successfully!" }
      res.status(200).send(resFormat.rSuccess(result))
    }
  })
}

router.post("/my-essentials-req", myEssentialsUpdate)
router.post("/essential-profile-list", essentialProfileList)
router.post("/essential-id-list", essentialIdList)
router.post("/view-essential-profile", viewEssentialProfile)
router.post("/essentials-id-form-submit", personalIdUpdate)
router.post("/deleteprofile", deleteProfile)
router.post("/delete-professionals", deleteProfessionals)
router.post("/delete-id-box", deleteIdBox)
router.post("/legal-estate-list", legalEstateList)
router.post("/delete-legal-stuff", deleteLegalStuff)
router.post("/my-essentials-profile-submit", myProfessionalsUpdate)
router.post("/essential-professional-list", essentialProfessionalsList)
router.post("/view-professional-details", viewEssentialProfessionals)
router.post("/view-id-details", viewEssentialID)
router.post("/essentials-legal-form-submit", legalStuffUpdate)
router.post("/view-legalStuff-details", viewLegalStuffDetails)
router.post("/emergency-contacts", emergencyContactsSubmit)
router.post("/get-emergency-contacts", getEmergencyContacts)
router.post("/view-emergency-contacts", viewEmergencyContacts)
router.post("/deletecontact", deleteEcontact)
router.post("/file-activity-log-list", fileActivityLogList)
router.post("/shared-legacies-list", getSharedLegaciesList)
router.post("/legacy-user-remove", legacyUserRemove)
router.post("/view-invite-details", viewInviteDetails)
router.post("/refer-and-earn-participate", referAndEarnParticipate)

module.exports = router