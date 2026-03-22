package com.portfolio.files

import java.net.URI

final case class AppConfig(
    s3Endpoint: URI,
    s3Region: String,
    accessKey: String,
    secretKey: String,
    bucket: String
)

object AppConfig {

  def load: Either[String, AppConfig] =
    for {
      endpoint <- requiredEnv("FILE_API_S3_ENDPOINT").map(URI.create)
      region <- optionalEnv("FILE_API_S3_REGION", "us-east-1")
      accessKey <- requiredEnv("FILE_API_S3_ACCESS_KEY")
      secretKey <- requiredEnv("FILE_API_S3_SECRET_KEY")
      bucket <- requiredEnv("FILE_API_S3_BUCKET")
    } yield AppConfig(endpoint, region, accessKey, secretKey, bucket)

  private def requiredEnv(key: String): Either[String, String] =
    Option(System.getenv(key))
      .map(_.trim)
      .filter(_.nonEmpty)
      .toRight(s"Missing or empty environment variable: $key")

  private def optionalEnv(key: String, default: String): Either[String, String] =
    Right(Option(System.getenv(key)).map(_.trim).filter(_.nonEmpty).getOrElse(default))
}
