#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

func value(after name: String, in args: [String]) -> String? {
  guard let index = args.firstIndex(of: name), args.indices.contains(index + 1) else {
    return nil
  }
  return args[index + 1]
}

func loadImage(at url: URL) throws -> CGImage {
  guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    throw NSError(
      domain: "RenderTileContactSheet",
      code: 1,
      userInfo: [NSLocalizedDescriptionKey: "Could not read \(url.path)"]
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
      domain: "RenderTileContactSheet",
      code: 2,
      userInfo: [NSLocalizedDescriptionKey: "Could not create \(url.path)"]
    )
  }

  CGImageDestinationAddImage(destination, image, nil)

  if !CGImageDestinationFinalize(destination) {
    throw NSError(
      domain: "RenderTileContactSheet",
      code: 3,
      userInfo: [NSLocalizedDescriptionKey: "Could not write \(url.path)"]
    )
  }
}

let args = Array(CommandLine.arguments.dropFirst())
let root = URL(fileURLWithPath: value(after: "--tiles", in: args) ?? "/private/tmp/campaign-map-tiles/circular-city")
let output = URL(fileURLWithPath: value(after: "--output", in: args) ?? "/private/tmp/circular-city-z0-preview.png")
let zoom = Int(value(after: "--zoom", in: args) ?? "0") ?? 0
let tileSize = Int(value(after: "--tile-size", in: args) ?? "256") ?? 256
let columns = Int(value(after: "--columns", in: args) ?? "") ?? 1
let rows = Int(value(after: "--rows", in: args) ?? "") ?? 1
let imageWidth = Int(value(after: "--image-width", in: args) ?? "") ?? columns * tileSize
let imageHeight = Int(value(after: "--image-height", in: args) ?? "") ?? rows * tileSize

guard let context = CGContext(
  data: nil,
  width: imageWidth,
  height: imageHeight,
  bitsPerComponent: 8,
  bytesPerRow: 0,
  space: CGColorSpaceCreateDeviceRGB(),
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
  throw NSError(
    domain: "RenderTileContactSheet",
    code: 4,
    userInfo: [NSLocalizedDescriptionKey: "Could not create output context"]
  )
}

context.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: imageWidth, height: imageHeight))

for x in 0..<columns {
  for y in 0..<rows {
    let tileURL = root
      .appendingPathComponent(String(zoom))
      .appendingPathComponent(String(x))
      .appendingPathComponent("\(y).png")
    let tile = try loadImage(at: tileURL)
    let drawX = x * tileSize
    let drawY = y * tileSize

    context.draw(
      tile,
      in: CGRect(x: drawX, y: drawY, width: tileSize, height: tileSize)
    )
  }
}

guard let image = context.makeImage() else {
  throw NSError(
    domain: "RenderTileContactSheet",
    code: 5,
    userInfo: [NSLocalizedDescriptionKey: "Could not render output"]
  )
}

try writePNG(image, to: output)
print(output.path)
