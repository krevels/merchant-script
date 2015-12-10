require('./../environment');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var AWS = require('aws-sdk');

var bucket = process.env.S3_BUCKET;
var output_file = process.env.OUTPUT_FILE;
var s3 = new AWS.S3();

var build_path = path.join(__dirname, '..', process.env.BUILD_DIR + '/' + output_file);

fs.readFile(build_path, function(err, data) {

  if(process.env.COMPRESS){
    zlib.gzip(data, function(err, data) {
      build_path = build_path + '.gz';
      fs.writeFile(build_path, data, function(err) {
        if(err) throw err;

        fs.readFile(build_path, function(err, data) {
          if(err) throw err;
          checkExistsAndUpload(data);
        });
      });
    });
  }
  else {
    checkExistsAndUpload(data);
  }
});

function checkExistsAndUpload(upload_data){
  s3.headObject({Bucket: bucket, Key: output_file}, function(err, data) {
    if(err){
      if(err.code == 'NotFound') {
        uploadToS3(upload_data)
      }
      else {
        throw err;
      }
    }
    else {
      // file found
      s3.copyObject({ACL: 'private', Bucket: bucket, CopySource: encodeURIComponent(bucket + '/' + output_file), Key: (output_file + Date.now())}, function(err, data) {
        if(err) throw err;
        uploadToS3(upload_data);
      });
    }
  });
}

function uploadToS3(upload_data){
  var upload_options = {
    ACL: 'public-read', 
    Bucket: bucket, 
    Key: output_file, 
    Body: upload_data
  };

  if(process.env.COMPRESS) {
    upload_options['ContentType'] = 'binary/octet-stream';
    upload_options['ContentEncoding'] = 'gzip';
  }

  s3.putObject(upload_options, function(err, data) {
    if(err) throw err;
    console.log("Upload Complete!");
  });
}
