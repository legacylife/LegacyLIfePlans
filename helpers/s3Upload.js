const fs = require('fs')
const AWS = require('aws-sdk')
const constants =  require('./../config/constants')

const s3 = new AWS.S3({
    accessKeyId: constants.s3Details.awsKey,
    secretAccessKey: constants.s3Details.awsSecret
});

const uploadFile = (filename, path) => {
  return new Promise(function(resolve, reject) {
    if (fs.existsSync(__dirname + '/../tmp/'+filename)) {
      console.log("File exists")
     fs.readFile(__dirname + '/../tmp/' + filename, (err, data) => {
       if (err){
         console.log(err)
         reject(err)
       }
       const params = {
          Bucket: constants.s3Details.bucketName,
          Key: path + filename,
          Body: data,
          //ACL: "public-read"
          ACL: "bucket-owner-full-control"
       }
       console.log("Reading file")
       s3.upload(params, function(s3Err, data) {
         if (s3Err) {
           console.log(s3Err)
           return s3Err
         } else {
           console.log(`File uploaded successfully at ${data.Location}`)
           fs.unlink(__dirname + '/../tmp/' + filename, (err) => {
             if (err){
               reject(err)
             }
             else {
               console.log("File removed from local")
             }
             resolve(data);
           })
         }
       })
     })
    }
    else {
      reject("Some error occured.")
    }
  })
}


module.exports = { uploadFile, s3 }
