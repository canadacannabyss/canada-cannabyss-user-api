/* eslint-disable no-console */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const s3 = new aws.S3();

const ResellerProfileImageSchema = new mongoose.Schema({
  id: String,
  name: String,
  size: Number,
  key: String,
  url: String,
  deletion: {
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    when: {
      type: Date,
      required: false,
    },
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

ResellerProfileImageSchema.pre('save', function () {
  if (!this.url) {
    this.url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${this.key}`;
  }
});

ResellerProfileImageSchema.pre('remove', function () {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key,
      })
      .promise()
      .then((response) => {
        console.log(response.status);
      })
      .catch((response) => {
        console.log(response.status);
      });
  }
  return promisify(fs.unlink)(
    path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key),
  );
});

module.exports = mongoose.model('ResellerProfileImage', ResellerProfileImageSchema);
