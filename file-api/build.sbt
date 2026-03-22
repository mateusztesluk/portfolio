ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "3.3.5"
ThisBuild / organization := "com.portfolio"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    name := "file-api",
    libraryDependencies ++= Seq(
      guice,
      "software.amazon.awssdk" % "s3" % "2.29.45"
    ),
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked")
  )
