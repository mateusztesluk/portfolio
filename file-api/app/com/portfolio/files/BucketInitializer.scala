package com.portfolio.files

import jakarta.inject.{Inject, Singleton}
import software.amazon.awssdk.services.s3.S3Client

@Singleton
class BucketInitializer @Inject() (client: S3Client, config: AppConfig) {
  BucketService.ensureBucketExists(client, config.bucket)
}
