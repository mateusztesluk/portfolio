package com.portfolio.files

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration

object S3ClientFactory {

  def apply(config: AppConfig): S3Client =
    val credentials = AwsBasicCredentials.create(config.accessKey, config.secretKey)
    S3Client
      .builder()
      .endpointOverride(config.s3Endpoint)
      .region(Region.of(config.s3Region))
      .credentialsProvider(StaticCredentialsProvider.create(credentials))
      .serviceConfiguration(
        S3Configuration
          .builder()
          .pathStyleAccessEnabled(true)
          .build()
      )
      .build()
}
