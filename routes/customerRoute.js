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

const User = require('./../models/Users')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const myessentials = require('./../models/myessentials.js')
const emergencyContacts = require('./../models/EmergencyContacts.js')
const personalIdProof = require('./../models/personalIdProof.js')
const MyProfessional = require('./../models/MyProfessionals.js')
const LegalStuff = require('./../models/LegalStuff.js')
const RealEstate = require('./../models/RealEstate.js')
const Vehicles = require('./../models/Vehicles.js')
const Assets = require('./../models/Assets.js')
const FileActivityLog = require('./../models/FileActivityLog.js')
const SpecialNeeds = require('./../models/SpecialNeeds.js')
const s3 = require('./../helpers/s3Upload')
const actitivityLog = require('./../helpers/fileAccessLog')

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
    myessential.ppFirstName = proquery.ppFirstName;
    myessential.ppMiddleName = proquery.ppMiddleName;
    myessential.ppLastName = proquery.ppLastName;
    myessential.ppDateOfBirth = proquery.ppDateOfBirth;
    myessential.ppEmails = proquery.ppEmails;
    myessential.status = 'Active';
    myessential.createdOn = new Date();
    myessential.modifiedOn = new Date();
    myessential.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
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

  let { fields, offset, query, order, limit, search } = req.body
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
        res.send(resFormat.rSuccess({ essentialList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function essentialIdList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body  
  personalIdProof.find(query, fields, function (err, essentialIDList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      totalIDRecords = essentialIDList.length; 
      res.send(resFormat.rSuccess({ essentialIDList, totalIDRecords }))
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
  let { fields, offset, query, order, limit, search } = req.body  
  MyProfessional.find(query, fields, function (err, essentialProfessionalList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      totalProfessionalRecords = essentialProfessionalList.length; 
      res.send(resFormat.rSuccess({ essentialProfessionalList, totalProfessionalRecords }))
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

  if(query._id ){
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
    emergency.address = proquery.address;
    emergency.emailAddress= proquery.emailAddress;
    emergency.mobile= proquery.mobile;
    emergency.name= proquery.name;
    emergency.phone= proquery.phone;
    emergency.relationship= proquery.relationship;
    emergency.status = 'Active';
    emergency.createdOn = new Date();
    emergency.modifiedOn = new Date();
    emergency.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
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
  let fields = { }
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

  if(query._id ){
    personalIdProof.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'added';
          if (custData.documentType){
            resText = 'updated';
          }
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          proquery.status = 'Active';
          personalIdProof.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {

              logData.customerId = custData.customerId;
              logData.fileId = custData._id;
              actitivityLog.updateActivityLog(logData);

              let result = { "message": "ID box details "+resText+" successfully!" }
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
    proquery.status = 'Active';
    proquery.createdOn = new Date();
    proquery.modifiedOn = new Date();
    personal.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

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
  let fields = { }
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

  if(query._id ){
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

              let result = { "message": "Professional details updated successfully!","ppID" : custData._id }
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
    profesion.customerId = query.customerId;
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
          console.log("newEntry :-",newEntry);

          logData.customerId = query.customerId;
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
  let fields = { }
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
  let {message} = req.body;

  var logData = {}
  if(proquery.subFolderName == 'Estate') {
    logData.fileName = constants.EstateTypeOfDocument[proquery.typeOfDocument];
  }
  if(proquery.subFolderName == 'Healthcare') {
    logData.fileName = constants.HealthcareTypeOfDocument[proquery.typeOfDocument];
  }
  if(proquery.subFolderName == 'Personal Affairs') {
    logData.fileName = constants.PersonalAffairsTypeOfDocument[proquery.typeOfDocument];
  }
  
  logData.folderName = 'legalstuff';
  logData.subFolderName = proquery.subFolderName;

  if(query._id ){
    LegalStuff.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let resText = 'details  added';
          if (custData.typeOfDocument){
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

              let result = { "message": message.messageText+" "+resText+" successfully" }
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
            legals.customerId = query.customerId;
            legals.subFolderName = proquery.subFolderName;
            legals.typeOfDocument = proquery.typeOfDocument;
            legals.comments = proquery.comments;            
            legals.status = 'Active';
            legals.createdOn = new Date();
            legals.modifiedOn = new Date();
            legals.save({$set:proquery}, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {

        logData.customerId = query.customerId;
        logData.fileId = newEntry._id;
        actitivityLog.updateActivityLog(logData);

        let result = { "message": message.messageText+" added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function legalStuffUpdate1(req, res) {
  let { query } = req.body;
  let {message} = req.body;
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
              let result = { "message": message.messageText+" updated successfully!" }
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
            legals.save({$set:proquery}, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": message.messageText+" have been added successfully!" }
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
  let fields = { }
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
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


// get emergency Contacts of customer
function getEmergencyContacts(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  emergencyContacts.find(query, function (err, eContactsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(eContactsList))
    }
  }).sort(order).skip(offset).limit(limit)
}


function legalEstateList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
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
        res.send(resFormat.rSuccess({ legalList, totalRecords }))
      }
    }).sort(order).skip(offset).limit(limit)
  })
}

function deleteLegalStuff(req, res) {
  let { query } = req.body;
  let fields = { }
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
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function realEstateSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  if(query._id ){
    RealEstate.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          RealEstate.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Real Estate details have been updated successfully!" }
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
    var realEstate = new RealEstate();
    realEstate.customerId = from.customerId;
    realEstate.estateType = proquery.estateType;
    realEstate.address = proquery.address;
    realEstate.mortgageHolder = proquery.mortgageHolder;
    realEstate.accountNumber = proquery.accountNumber;
    realEstate.phoneContact = proquery.phoneContact;
    realEstate.deedLocation = proquery.deedLocation;
    realEstate.comments = proquery.comments;
    realEstate.status = 'Active';
    realEstate.createdOn = new Date();
    realEstate.modifiedOn = new Date();
    realEstate.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Real Estate details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getRealEstateList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  RealEstate.find(query, function (err, realEstateList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateList))
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewRealEstate(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  RealEstate.findOne(query, fields, function (err, realEstateData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateData))
    }
  })
}

function deleteRealEstate(req, res) {
  let { query } = req.body;
  let fields = { }
  RealEstate.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      RealEstate.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}

function realEstateVehicleSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  if(query._id ){
    Vehicles.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          Vehicles.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Vehicle details have been updated successfully!" }
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
    var vehiclesObj = new Vehicles();
    vehiclesObj.customerId = from.customerId;
    vehiclesObj.model = proquery.model;
    vehiclesObj.year = proquery.year;
    vehiclesObj.make = proquery.make;
    vehiclesObj.titleLocation = proquery.titleLocation;
    vehiclesObj.financeCompanyName = proquery.financeCompanyName;
    vehiclesObj.accountNumber = proquery.accountNumber;
    vehiclesObj.payment = proquery.payment;
    vehiclesObj.comments = proquery.comments;
    vehiclesObj.status = 'Active';
    vehiclesObj.createdOn = new Date();
    vehiclesObj.modifiedOn = new Date();
    vehiclesObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Vehicle details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}
 
function viewRealEstateVehicle(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Vehicles.findOne(query, fields, function (err, vehiclesData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(vehiclesData))
    }
  })
}

function getRealEstateVehiclesList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  Vehicles.find(query, function (err, realEstateVehiclesList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateVehiclesList))
    }
  }).sort(order).skip(offset).limit(limit)
}

function deleteRealEstateVehicle(req, res) {
  let { query } = req.body;
  let fields = { }
  Vehicles.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Vehicles.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
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


function realEstateAssetsSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  if(query._id ){
    Assets.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          Assets.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Assets details have been updated successfully!" }
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
    var assetsObj = new Assets();
    assetsObj.customerId = from.customerId;
    assetsObj.asset = proquery.asset;
    assetsObj.assetNew = proquery.assetNew;
    assetsObj.assetType = proquery.assetType;
    assetsObj.assetValue = proquery.assetValue;
    assetsObj.location = proquery.location;
    assetsObj.comments = proquery.comments;
    assetsObj.status = 'Active';
    assetsObj.createdOn = new Date();
    assetsObj.modifiedOn = new Date();
    assetsObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Assets details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getRealEstateAssetsList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  Assets.find(query, function (err, realEstateAssetsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateAssetsList))
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewRealEstateAsset(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  Assets.findOne(query, fields, function (err, realEstateAssetsData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(realEstateAssetsData))
    }
  })
}

function deleteRealEstateAsset(req, res) {
  let { query } = req.body;
  let fields = { }
  Assets.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      Assets.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
    }
  })
}


function specialNeedsSubmit(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;
  if(query._id ){
    SpecialNeeds.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          SpecialNeeds.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "Special Needs details have been updated successfully!" }
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
    var snObj = new SpecialNeeds();
    snObj.customerId = from.customerId;
    snObj.folderName = proquery.folderName;
    snObj.comments = proquery.comments;
    snObj.status = 'Active';
    snObj.createdOn = new Date();
    snObj.modifiedOn = new Date();
    snObj.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "Special Needs details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}

function getSpecialNeedsList(req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  SpecialNeeds.find(query, function (err, youngChildrenList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(youngChildrenList))
    }
  }).sort(order).skip(offset).limit(limit)
}

function viewSpecialNeeds(req, res) {
  let { query } = req.body
  let fields = {}
  if (req.body.fields) {
    fields = req.body.fields
  }
  SpecialNeeds.findOne(query, fields, function (err, scData) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(scData))
    }
  })
}

function deleteSpecialNeeds(req, res) {
  let { query } = req.body;
  let fields = { }
  SpecialNeeds.findOne(query, fields, function (err, profileInfo) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      var upStatus = 'Delete';
      var params = { status: upStatus }
      SpecialNeeds.update({ _id: profileInfo._id }, { $set: params }, function (err, updatedinfo) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          let result = { "message": "Record deleted successfully!" }
          res.status(200).send(resFormat.rSuccess(result))
        }
      })
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
router.post("/legal-estate-list", legalEstateList)
router.post("/real-estate", realEstateSubmit)
router.post("/real-estate-list", getRealEstateList)
router.post("/view-real-estate", viewRealEstate)
router.post("/delete-real-estate", deleteRealEstate)
router.post("/real-estate-vehicle", realEstateVehicleSubmit)
router.post("/view-real-estate-vehicle", viewRealEstateVehicle)
router.post("/real-estate-vehicles-list", getRealEstateVehiclesList)
router.post("/delete-real-estate-vehicle", deleteRealEstateVehicle)
router.post("/file-activity-log-list", fileActivityLogList)
router.post("/real-estate-assets", realEstateAssetsSubmit)
router.post("/real-estate-assets-list", getRealEstateAssetsList)
router.post("/view-real-estate-asset", viewRealEstateAsset)
router.post("/delete-real-estate-asset", deleteRealEstateAsset)
router.post("/special-needs", specialNeedsSubmit)
router.post("/special-needs-list", getSpecialNeedsList)
router.post("/view-special-needs", viewSpecialNeeds)
router.post("/delete-special-needs", deleteSpecialNeeds)
module.exports = router