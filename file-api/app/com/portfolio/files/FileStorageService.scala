package com.portfolio.files

import jakarta.inject.{Inject, Singleton}
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest

import java.io.InputStream
import java.util.Locale
import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.jdk.CollectionConverters.*

object FileStorageService {
  val MetaOriginalFilename = "original-filename"
}

@Singleton
class FileStorageService @Inject() (client: S3Client, config: AppConfig)(implicit
    ec: ExecutionContext
) {

  private val bucket = config.bucket

  /** Klucz obiektu w S3 = `id` (UUID), bez ścieżek folderów. */
  def put(
      id: String,
      bytes: Array[Byte],
      contentType: Option[String],
      originalFilename: Option[String]
  ): Future[Unit] =
    Future {
      blocking {
        val meta = originalFilename
          .map(sanitizeFilename)
          .filter(_.nonEmpty)
          .map(n => Map(FileStorageService.MetaOriginalFilename -> n).asJava)
          .getOrElse(Map.empty[String, String].asJava)

        val builder = PutObjectRequest.builder.bucket(bucket).key(id).metadata(meta)
        contentType.foreach(builder.contentType)
        client.putObject(builder.build(), RequestBody.fromBytes(bytes))
      }
    }

  def get(id: String): Future[Option[(InputStream, Option[String], Option[String])]] =
    Future {
      blocking {
        try
          val in =
            client.getObject(GetObjectRequest.builder.bucket(bucket).key(id).build())
          val resp = in.response()
          val ct = Option(resp.contentType())
          val name = readOriginalFilename(resp.metadata())
          Some((in, ct, name))
        catch case _: NoSuchKeyException => None
      }
    }

  def delete(id: String): Future[Unit] =
    Future {
      blocking {
        client.deleteObject(DeleteObjectRequest.builder.bucket(bucket).key(id).build())
      }
    }

  private def readOriginalFilename(meta: java.util.Map[String, String]): Option[String] =
    if meta == null || meta.isEmpty then None
    else
      val m = meta.asScala
      m.get(FileStorageService.MetaOriginalFilename)
        .orElse(m.get(FileStorageService.MetaOriginalFilename.toLowerCase(Locale.ROOT)))

  /** Odcina ścieżki, ogranicza długość (metadane S3 ~2 KB). */
  private def sanitizeFilename(name: String): String =
    val t = name.trim
    val base = t.split("[/\\\\]").filter(_.nonEmpty).lastOption.getOrElse(t)
    if base.length > 200 then base.take(200) else base
}
