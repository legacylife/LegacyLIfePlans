var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var pipelineStagesSchema = new mongoose.Schema({
    pipelineName: String,
    userId: String,
    stageName: String,
    defaultProbability: Number,
    sequenceNo: Number,
    deals:[{
      name: String,
      description: String,
      value: Number,
      currency: String,
      personId: String,
      organisationId:String,
      actions:[{
        actionType: String, // note, activity, email, upload
        createdOn: Date,
        actionId: String,  //if actionType is addActivity/sendEmail, save ids respectively
        notes: String, //if actionType is takeNotes
        fileDetails: { //if actionType is fileDetails
          fileName: String,
          url: String,
        }
      }],
      products:[{
        productId: String,
        productName: String,
        sellCost: Number,
        quantity: Number,
        discount: Number,
        totalCost: Number
      }],
      probability: Number,
      expectedCloseDate: Date,
      closeDate: Date,
      reopenDate: Date,
      lostReason: String,
      comments: String,
      status: String,  //open, won, lost
      createdOn: Date,
      isDeleted: {
        type: Boolean,
        default: false
      },
      lastModifiedOn: Date,
    }],
    createdOn: Date
})


module.exports = mongoose.model('pipelineStages', pipelineStagesSchema)
