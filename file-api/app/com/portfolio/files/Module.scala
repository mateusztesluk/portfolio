package com.portfolio.files

import com.google.inject.{AbstractModule, Provides}
import jakarta.inject.Singleton
import play.api.inject.ApplicationLifecycle
import software.amazon.awssdk.services.s3.S3Client

import scala.concurrent.{ExecutionContext, Future}

class Module extends AbstractModule {

  override def configure(): Unit =
    bind(classOf[BucketInitializer]).asEagerSingleton()

  @Provides
  @Singleton
  def appConfig(): AppConfig =
    AppConfig.load match
      case Left(msg) => throw new IllegalStateException(msg)
      case Right(c)  => c

  @Provides
  @Singleton
  def s3Client(config: AppConfig, lifecycle: ApplicationLifecycle): S3Client =
    val client = S3ClientFactory(config)
    lifecycle.addStopHook { () =>
      Future(client.close())(ExecutionContext.global)
    }
    client
}
