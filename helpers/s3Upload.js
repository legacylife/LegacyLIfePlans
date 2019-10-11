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


const uploadFilePublic = (filename, path) => {
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
          ACL: "public-read"
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

//Delete Multiple files
const deleteFiles = (filearray, path) => {
  let fileObject = [];
  fileObject["Objects"] = filearray;
  const params = {Bucket: constants.s3Details.bucketName,Delete:fileObject}
  let resMsg = false;
         try {
            s3.deleteObjects(params).promise()
            resMsg = true;     
         } catch (err) {
           resMsg = false;//"ERROR in file Deleting : " + JSON.stringify(err);
           console.log("0","ERROR in file Deleting : " +path+filename+ JSON.stringify(err))
         }
     return resMsg;
}

//Delete single file
const deleteFile = (filename, path) => {
  let filePath = path+filename;
  const params = {Bucket: constants.s3Details.bucketName,Key:filePath}
  let resMsg = false;
     try {
         s3.headObject(params).promise()
         try {
            s3.deleteObject(params).promise()
            resMsg = true;     
         } catch (err) {
           resMsg = false;//"ERROR in file Deleting : " + JSON.stringify(err);
           console.log("0","ERROR in file Deleting : " +path+filename+ JSON.stringify(err))
         }
     } catch (err) {
             resMsg = false;
             console.log("00","File not Found ERROR : " +path+filename+ err.code)
     }
     return resMsg;
}

module.exports = { uploadFile,uploadFilePublic,s3,deleteFiles }
