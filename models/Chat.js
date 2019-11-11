var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var chatSchema = new mongoose.Schema({
  chatfromid:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatwithid:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chats:[{
    contactId: String,  
    text: String,
    status: String,
    time:Date
    }], 
  status: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('chat', chatSchema)
