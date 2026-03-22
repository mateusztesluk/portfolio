package com.portfolio.files

import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.CreateBucketRequest
import software.amazon.awssdk.services.s3.model.HeadBucketRequest
import software.amazon.awssdk.services.s3.model.NoSuchBucketException

object BucketService {

  def ensureBucketExists(client: S3Client, bucket: String): Unit =
    try client.headBucket(HeadBucketRequest.builder.bucket(bucket).build())
    catch
      case _: NoSuchBucketException =>
        client.createBucket(CreateBucketRequest.builder.bucket(bucket).build())
}
