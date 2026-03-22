package controllers

import com.portfolio.files.FileStorageService
import jakarta.inject.{Inject, Singleton}
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.StreamConverters
import play.api.http.HeaderNames.CONTENT_DISPOSITION
import play.api.http.{ContentTypes, HttpEntity}
import play.api.mvc._

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

@Singleton
class FileController @Inject() (
    cc: ControllerComponents,
    storage: FileStorageService
)(using ec: ExecutionContext, mat: Materializer)
    extends AbstractController(cc) {

  def upload: Action[AnyContent] =
    Action.async(parse.anyContent) { request =>
      request.body.asMultipartFormData match
        case Some(mp) =>
          mp.file("file") match
            case Some(f) =>
              import java.nio.file.Files
              val bytes = Files.readAllBytes(f.ref.path)
              val ct = f.contentType
              val originalName = Option(f.filename).map(_.trim).filter(_.nonEmpty)
              val id = UUID.randomUUID().toString
              storage.put(id, bytes, ct, originalName).map { _ =>
                val nameJson = originalName.fold("null")(n => s""""${escapeJson(n)}"""")
                Ok(s"""{"id":"$id","name":$nameJson}""")
              }
            case None =>
              Future.successful(BadRequest("multipart part named 'file' required"))
        case None =>
          request.body.asRaw match
            case Some(raw) =>
              raw.asBytes() match
                case Some(bytes) if bytes.nonEmpty =>
                  val ct = request.contentType
                  val headerName = request.headers.get("X-Original-Filename").map(_.trim).filter(_.nonEmpty)
                  val id = UUID.randomUUID().toString
                  storage.put(id, bytes.toArray, ct, headerName).map { _ =>
                    val nameJson = headerName.fold("null")(n => s""""${escapeJson(n)}"""")
                    Ok(s"""{"id":"$id","name":$nameJson}""")
                  }
                case _ =>
                  Future.successful(BadRequest("expected non-empty body or multipart"))
            case None =>
              Future.successful(
                BadRequest("use multipart/form-data with part \"file\" (name in filename) or raw body + X-Original-Filename")
              )
    }

  def download(id: String): Action[AnyContent] = Action.async {
    parseUuid(id) match
      case None => Future.successful(BadRequest("id must be a valid UUID"))
      case Some(uuid) =>
        storage.get(uuid).map {
          case None =>
            NotFound
          case Some((stream, maybeCt, maybeName)) =>
            val mime = maybeCt.getOrElse(ContentTypes.BINARY)
            val entity = HttpEntity.Streamed(
              StreamConverters.fromInputStream(() => stream, 8192),
              None,
              Some(mime)
            )
            maybeName match
              case Some(name) if name.nonEmpty =>
                Ok.sendEntity(entity).withHeaders(CONTENT_DISPOSITION -> contentDispositionInline(name))
              case _ =>
                Ok.sendEntity(entity)
        }
    }

  def remove(id: String): Action[AnyContent] = Action.async {
    parseUuid(id) match
      case None => Future.successful(BadRequest("id must be a valid UUID"))
      case Some(uuid) => storage.delete(uuid).map(_ => NoContent)
  }

  /** Zwraca kanoniczny string UUID (jak przy zapisie), żeby GET działał niezależnie od wielkości liter. */
  private def parseUuid(s: String): Option[String] =
    Try(UUID.fromString(s.trim)).toOption.map(_.toString)

  /** `inline` — przeglądarka wyświetla obraz/PDF w karcie; `attachment` wymusza pobieranie. */
  private def contentDispositionInline(filename: String): String =
    val safe = filename.replace("\"", "\\\"")
    s"""inline; filename="$safe""""

  private def escapeJson(s: String): String =
    s.flatMap {
      case '"'  => "\\\""
      case '\\' => "\\\\"
      case '\b' => "\\b"
      case '\f' => "\\f"
      case '\n' => "\\n"
      case '\r' => "\\r"
      case '\t' => "\\t"
      case c    => c.toString
    }
}
