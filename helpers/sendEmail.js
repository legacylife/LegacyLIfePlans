const constants = require('./../config/constants')
const ses = require('node-ses'),
  client = ses.createClient({ key: constants.ses.key, secret: constants.ses.secret })

module.exports = (mailOptions, callback) => {
  //let emailBody = '<html><head><link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet"></head><body style="margin: 0;background: #fff;"><table style="border: 1px solid #ddd; margin: 15px auto;font-family: \'Open Sans\', \'Arial\', \'sans-serif\'; font-size: 13px; color: #2c2c2c; background: #f7f7f7;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td style="background: #f6f7f7;border-bottom: 1px solid #ccc;padding: 0 60px;"><table style="width:100%"><tr><td style="padding: 21px 0; text-align:center"><img src="'+constants.mailServerUrl+'/assets/images/email-logo.png" alt="LLP"></td></tr></table></td></tr><tr><td><table style="background: #fff;padding: 20px 60px;" width="600" cellspacing="0" cellpadding="0"><tbody>'+mailOptions.html+'<tr><td style="line-height: 27px; padding: 17px 0 0;text-align: center;"><span style="font-weight: 600;font-size: 15px;">Begin searching for your perfect Advisor!</span><br/><span style="font-size: 13px;">You\'re receiving this email because you signed up at legacylifeplans.com</span></td></tr></tbody></table></td></tr><tr><td style="font-size: 14px;padding: 17px;border-top: 1px solid #ccc;text-align: center;background: #f6f7f7;color: #999;font-weight: 600;"><span style="margin: 0;display: block;">© Legacy Life Plans 2019</span></td></tr></tbody></table></body></html>';  
  let emailBody = '<html><head><link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet"></head><body style="margin: 0;background: #fff;"><table style="border: 1px solid #ddd; margin: 15px auto;font-family: \'Open Sans\', \'Arial\', \'sans-serif\'; font-size: 13px; color: #2c2c2c; background: #f7f7f7;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td style="background: #f6f7f7;border-bottom: 1px solid #ccc;padding: 0 60px;"><table style="width:100%"><tr><td style="padding: 21px 0; text-align:center"><img src="https://llp-production.s3.amazonaws.com/assets/emailtemplates/email-logo.png" alt="LLP"></td></tr></table></td></tr><tr><td><table style="background: #fff;padding: 20px 60px;" width="600" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-size: 14px;padding-bottom: 26px;"> '+mailOptions.html+' </td></tr><tr><td style="line-height: 27px; padding: 17px 0 0;text-align: center;"> <span style="font-weight: 600;font-size: 15px;">Begin searching for your perfect Advisor!</span><br /> <span style="font-size: 13px;">You\'re receiving this email because you signed up at legacylifeplans.com</span></td></tr></tbody></table></td></tr><tr><td style="font-size: 14px;padding: 17px;border-top: 1px solid #ccc;text-align: center;background: #f6f7f7;color: #999;font-weight: 600;"><span style="margin: 0;display: block;">© Legacy Life Plans 2019</span></td></tr></tbody></table></body></html>';
  
  let options = ''
  if( mailOptions.bcc ) {
    options = {
      bcc: mailOptions.bcc,
      from: constants.ses.fromEmail,
      subject: mailOptions.subject,
      message: emailBody,
    }
  }
  else{
    options = {
      to: mailOptions.to,
      from: constants.ses.fromEmail,
      subject: mailOptions.subject,
      message: emailBody,
    }
  }
  
  client.sendEmail(options, function(error, data, response){
      if(error) {
        console.log("************ Email Error! ************ ")
        console.log(error);
        if(callback){
          callback(response)
        }
        
      } else {
        console.log("************ Email Sent! ************ ")
        if(callback){
          callback(response)
        }
      }
  })
}
