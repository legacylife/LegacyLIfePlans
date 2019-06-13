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
const s3 = require('./../helpers/s3Upload')

var auth = jwt({
  secret: constants.secret,
  userProperty: 'payload'
})

function myEssentialsUpdate(req, res) {
  let { query } = req.body;
  let { proquery } = req.body;
  let { from } = req.body;

  if(query._id ){
    myessentials.findOne(query, function (err, custData) {
      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          let { from } = req.body;
          myessentials.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "User " + from.fromname + "  have been updated successfully!","ppID" : custData._id }
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
    myessential.save({ $set: proquery }, function (err, newEntry) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        let result = { "message": "User " + from.fromname + "  have been updated successfully!","ppID" : newEntry._id }
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
  if(query._id ){
    personalIdProof.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;  
          proquery.modifiedOn = new Date();
          proquery.status = 'Active';
          personalIdProof.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "ID box details have been updated successfully!" }
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
        let result = { "message": "ID box details have been added successfully!" }
        res.status(200).send(resFormat.rSuccess(result))
      }
    })
  }
}





function personalIdUpdate23(req, res) {
  let { query } = req.body;
  let { from } = req.body;
  if (query.customerId) {
    personalIdProof.findOne(query, function (err, custData) {
      if (err) {
        let result = { "message": "Something Wrong! Please signin again." }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData.customerId) {
          let { proquery } = req.body;   
          proquery.status = 'Active';   
          personalIdProof.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "ID box details have been updated successfully!" }
              res.status(200).send(resFormat.rSuccess(result))
            }
          })
        } else {
            let { proquery } = req.body;
            var personal = new personalIdProof();
            personal.customerId = from.customerId;
            personal.status = 'Active';
            personal.createdOn = new Date();
            personal.save({ $set: proquery }, function (err, newEntry) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "ID box details have been added successfully!" }
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
  if(query._id ){
    MyProfessional.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
          let { proquery } = req.body;
          MyProfessional.updateOne({ _id: custData._id }, { $set: proquery }, function (err, updatedDetails) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              let result = { "message": "User  have been updated successfully!","ppID" : custData._id }
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

    profesion.save({ $set: proquery }, function (err, newEntry) {
    if (err) {
          res.send(resFormat.rError(err))
        } else {
          console.log("newEntry :-",newEntry);
          let result = { "message": "ID box details have been added successfully!" }
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

  if(query._id ){
    LegalStuff.findOne(query, function (err, custData) {      
      if (err) {
        let result = { "message": "Something Wrong!" }
        res.send(resFormat.rError(result));
      } else {
        if (custData && custData._id) {
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
        let result = { "message": message.messageText+" have been added successfully!" }
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
  let { query } = req.body
  emergencyContacts.find(query, function (err, eContactsList) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess(eContactsList))
    }
  })
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

router.post("/my-essentials-req", myEssentialsUpdate)
router.post("/essential-profile-list", essentialProfileList)
router.post("/essential-id-list", essentialIdList)
router.post("/view-essential-profile", viewEssentialProfile)
router.post("/essentials-id-form-submit", personalIdUpdate)
router.post("/deleteprofile", deleteProfile)
router.post("/delete-professionals", deleteProfessionals)
router.post("/delete-id-box", deleteIdBox)
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

module.exports = router
