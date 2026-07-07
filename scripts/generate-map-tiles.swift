#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Options {
  var sourcePath = ""
  var outputRoot = "/private/tmp/campaign-map-tiles/circular-city"
  var minZoom = -3
  var maxZoom = 2
  var tileSize = 256
}

func value(after name: String, in args: [String]) -> String? {
  guard let index = args.firstIndex(of: name), args.indices.contains(index + 1) else {
    return nil
  }
  return args[index + 1]
}

func parseOptions() throws -> Options {
  let args = Array(CommandLine.arguments.dropFirst())
  var options = Options()

  options.sourcePath = value(after: "--source", in: args) ?? ""
  options.outputRoot = value(after: "--output", in: args) ?? options.outputRoot
  options.minZoom = Int(value(after: "--min-zoom", in: args) ?? "") ?? options.minZoom
  options.maxZoom = Int(value(after: "--max-zoom", in: args) ?? "") ?? options.maxZoom
  options.tileSize = Int(value(after: "--tile-size", in: args) ?? "") ?? options.tileSize

  if options.sourcePath.isEmpty {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 1,
      userInfo: [NSLocalizedDescriptionKey: "Usage: scripts/generate-map-tiles.swift --source <image.png> [--output <tile-root>] [--min-zoom -3] [--max-zoom 2]"]
    )
  }

  if options.minZoom > options.maxZoom {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 2,
      userInfo: [NSLocalizedDescriptionKey: "min zoom must be less than or equal to max zoom"]
    )
  }

  return options
}

func loadImage(at path: String) throws -> CGImage {
  let url = URL(fileURLWithPath: path)
  guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 3,
      userInfo: [NSLocalizedDescriptionKey: "Could not read source image at \(path)"]
    )
  }
  return image
}

func writePNG(_ image: CGImage, to url: URL) throws {
  guard let destination = CGImageDestinationCreateWithURL(
    url as CFURL,
    UTType.png.identifier as CFString,
    1,
    nil
  ) else {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 4,
      userInfo: [NSLocalizedDescriptionKey: "Could not create PNG destination at \(url.path)"]
    )
  }

  CGImageDestinationAddImage(destination, image, nil)

  if !CGImageDestinationFinalize(destination) {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 5,
      userInfo: [NSLocalizedDescriptionKey: "Could not write PNG at \(url.path)"]
    )
  }
}

func makeScaledImage(_ sourceImage: CGImage, width: Int, height: Int) throws -> CGImage {
  guard let context = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  ) else {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 6,
      userInfo: [NSLocalizedDescriptionKey: "Could not create scaled image context"]
    )
  }

  context.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.interpolationQuality = .high
  context.draw(sourceImage, in: CGRect(x: 0, y: 0, width: width, height: height))

  guard let image = context.makeImage() else {
    throw NSError(
      domain: "GenerateMapTiles",
      code: 7,
      userInfo: [NSLocalizedDescriptionKey: "Could not render scaled image"]
    )
  }

  return image
}

let options = try parseOptions()
let sourceImage = try loadImage(at: options.sourcePath)
let fileManager = FileManager.default
var generated = 0

for zoom in options.minZoom...options.maxZoom {
  let scale = pow(2.0, Double(zoom))
  let scaledWidth = Int(ceil(Double(sourceImage.width) * scale))
  let scaledHeight = Int(ceil(Double(sourceImage.height) * scale))
  let columns = Int(ceil(Double(scaledWidth) / Double(options.tileSize)))
  let rows = Int(ceil(Double(scaledHeight) / Double(options.tileSize)))
  let scaledImage = try makeScaledImage(sourceImage, width: scaledWidth, height: scaledHeight)

  for x in 0..<columns {
    for y in 0..<rows {
      let tileURL = URL(fileURLWithPath: options.outputRoot)
        .appendingPathComponent(String(zoom))
        .appendingPathComponent(String(x))
        .appendingPathComponent("\(y).png")

      try fileManager.createDirectory(
        at: tileURL.deletingLastPathComponent(),
        withIntermediateDirectories: true
      )

      guard let context = CGContext(
        data: nil,
        width: options.tileSize,
        height: options.tileSize,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
      ) else {
        throw NSError(
          domain: "GenerateMapTiles",
          code: 8,
          userInfo: [NSLocalizedDescriptionKey: "Could not create tile context"]
        )
      }

      context.clear(CGRect(x: 0, y: 0, width: options.tileSize, height: options.tileSize))
      context.interpolationQuality = .high

      let sourceLeft = x * options.tileSize
      let sourceTop = max(0, scaledHeight - ((y + 1) * options.tileSize))
      let sourceBottom = scaledHeight - (y * options.tileSize)
      let cropWidth = max(0, min(options.tileSize, scaledWidth - sourceLeft))
      let cropHeight = max(0, sourceBottom - sourceTop)

      if cropWidth > 0 && cropHeight > 0,
         let crop = scaledImage.cropping(
          to: CGRect(
            x: sourceLeft,
            y: sourceTop,
            width: cropWidth,
            height: cropHeight
          )
         ) {
        context.draw(
          crop,
          in: CGRect(
            x: 0,
            y: 0,
            width: cropWidth,
            height: cropHeight
          )
        )
      }

      guard let tileImage = context.makeImage() else {
        throw NSError(
          domain: "GenerateMapTiles",
          code: 9,
          userInfo: [NSLocalizedDescriptionKey: "Could not render tile \(zoom)/\(x)/\(y).png"]
        )
      }

      try writePNG(tileImage, to: tileURL)
      generated += 1
    }
  }

  print("z=\(zoom) scale=\(scale) size=\(scaledWidth)x\(scaledHeight) tiles=\(columns)x\(rows)")
}

print("generated \(generated) tiles in \(options.outputRoot)")
