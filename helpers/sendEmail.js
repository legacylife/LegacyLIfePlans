const constants = require('./../config/constants')
const ses = require('node-ses'),
  client = ses.createClient({ key: constants.ses.key, secret: constants.ses.secret })

module.exports = (mailOptions) => {
  console.log(mailOptions)
  client.sendEmail({
    to: mailOptions.to,
    from: constants.ses.fromEmail,
    subject: mailOptions.subject,
    message: mailOptions.html,
  }, function(err, data, res){
      console.log(constants.ses)
      console.log("Email Status:");
      if(err) {
        console.log("err --->")
        console.log(err);
      } else {
        console.log("Email Sent!")
      }
  })
}
