var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var customerCmsSchema = new mongoose.Schema({
  pageFor: String,
  pageTitle: String,
  pagesubTitle: String,  
  topBanner: String,
  middleBanner: String,
  middleTitle: String,
  middleText: String,
  lowerBanner: String,
  lowerTitle: String,
  lowerText: String,
  bulletPoints: [{name:String}],
  facts: {
    title : String, 
    subTitle : String,
    savedFiles : String, 
    trustedAdvisors : String,
    successLogin : String,
    LLPMembers : String
  },
  quickOverview1 : {
    title : String, 
    subTitle : String,
    videoLink : String
  }, 
  quickOverview2 : {
    title : String, 
    subTitle : String,
    videoLink : String
  },  
  testimonials: [{
    name:String,
    profilePhoto:String,
    certifications:String,
    comment:String,
  }],
  status: String,
  createdOn: Date,
  createdBy: String,
  modifiedOn: Date,
  modifiedBy: String,
})




module.exports = mongoose.model('customercms', customerCmsSchema)
