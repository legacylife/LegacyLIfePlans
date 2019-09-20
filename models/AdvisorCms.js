var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var advisorCmsSchema = new mongoose.Schema({
  pageFor: String,
  sectionOne: {
    title:String,
    middleTitle:String,
    subTitle:String,
    topBanner:String,
  },
  sectionTwo: [{
    title:String,
    subTitle:String,
  }],
  sectionThree: {
    title:String,
    subTitle:String,
    bannerImage:String,
  },
  sectionFour: {
    title:String,
    subTitle:String,
    bannerImage:String,
  },
  sectionFive: [{
    title:String,
    subTitle:String,
  }],
  facts: {
    title : String, 
    subTitle : String,
    savedFiles : String, 
    trustedAdvisors : String,
    LLPMembers : String,
    referralConnection : String
  },
  sectionSix: [{
    title:String,
    subTitle:String,
  }],
  featuredAdvisors:[{
    name:String,
    certifications:String,
    profilePhoto:String,
  }],
  sectionEight: {
    title:String,
    subTitle:String,
    bannerImage:String,    
    benefitsPoints: [{name:String}],
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




module.exports = mongoose.model('advisorcms', advisorCmsSchema)
