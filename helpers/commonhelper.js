const constants = require('./../config/constants')
const mongoose = require('mongoose')
const User = require('./../models/Users')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('../routes/emailTemplatesRoute.js')

const customerAdvisorLegacyNotifications = (sendData) => {
  return new Promise(function() {
    let CUSTOMER_NAME = ''
    let ADVISOR_NAME = ''
    let SECTION_NAME =  "'" + sendData.sectionName + "'"
    let emailId = ''
    let userData = [ObjectId(sendData.customerId),ObjectId(sendData.customerLegacyId)]    
    User.find({"_id" : { $in: userData } },{ '_id':1, 'firstName': 1, 'lastName': 1 , 'username': 1, 'userType':1}, function (err, Dataresults) {
      Dataresults.forEach(results => {
        ADVISOR_NAME = (results.userType == "advisor" ? results.firstName + " " + results.lastName : "")
        if(results.userType == "customer"){
          CUSTOMER_NAME = results.firstName + " " + results.lastName
          emailId = results.username
        }
      });
    })
    emailTemplatesRoute.getEmailTemplateByCode("LegacyAdvisorFileNotification").then((template) => {
        template = JSON.parse(JSON.stringify(template));
        let body = template.mailBody.replace("{CUSTOMER_NAME}", CUSTOMER_NAME);
        body = body.replace("{ADVISOR_NAME}", ADVISOR_NAME);
        body = body.replace("{SECTION_NAME}", SECTION_NAME);
        const mailOptions = {
            to: emailId,
            subject: template.mailSubject,
            html: body
        }
        sendEmail(mailOptions)
    })
  })
}
module.exports = { customerAdvisorLegacyNotifications }