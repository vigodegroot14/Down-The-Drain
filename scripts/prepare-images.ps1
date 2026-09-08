# Make web-sized copies; original photographs stay untouched.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $root 'assets/images/web'
New-Item -ItemType Directory -Force $destination | Out-Null
$selection = @(
  @{ Number = 65; Name = 'solar-crowd-hero' },
  @{ Number = 4; Name = 'solar-bathhouse' },
  @{ Number = 122; Name = 'solar-bathtub-booth' },
  @{ Number = 23; Name = 'solar-blue-shower' },
  @{ Number = 17; Name = 'solar-bubbles' },
  @{ Number = 41; Name = 'solar-behind-the-decks' },
  @{ Number = 60; Name = 'solar-friends' },
  @{ Number = 73; Name = 'solar-rubber-duck' },
  @{ Number = 100; Name = 'solar-after-dark' },
  @{ Number = 108; Name = 'solar-night-lights' },
  @{ Number = 155; Name = 'solar-soap-bubbles' }
)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$quality = New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$manifest = @()
foreach ($photo in $selection) {
  $source = "Down The drain 2k26-$($photo.Number).jpg"
  $original = [System.Drawing.Image]::FromFile((Join-Path $root "assets/images/$source"))
  # Respect camera orientation before exporting and strip metadata from web copies.
  if ($original.PropertyIdList -contains 274) {
    $orientation = $original.GetPropertyItem(274).Value[0]
    $rotation = @{ 2=4; 3=2; 4=6; 5=5; 6=1; 7=7; 8=3 }
    if ($rotation.ContainsKey([int]$orientation)) { $original.RotateFlip($rotation[[int]$orientation]) }
  }
  $sizes = @(800, 1600)
  $jpegQuality = 82
  if ($photo.Name -eq 'solar-crowd-hero') {
    $sizes = @(800, 1600, 2560, 3840)
    $jpegQuality = 94
  }
  $quality.Param[0].Dispose()
  $quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$jpegQuality)
  foreach ($size in $sizes) {
    $ratio = [math]::Min(1.0, $size / [math]::Max($original.Width, $original.Height))
    $width = [int][math]::Round($original.Width * $ratio)
    $height = [int][math]::Round($original.Height * $ratio)
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($original, 0, 0, $width, $height)
    $name = "$($photo.Name)-$size.jpg"
    $bitmap.Save((Join-Path $destination $name), $codec, $quality)
    $manifest += [pscustomobject]@{ file=$name; source=$source; width=$width; height=$height }
    $graphics.Dispose()
    $bitmap.Dispose()
  }
  $original.Dispose()
}
$logo = [System.Drawing.Image]::FromFile((Join-Path $root 'assets/images/down_the_drain_logo.jpg'))
$bitmap = New-Object System.Drawing.Bitmap(600,600)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($logo,0,0,600,600)
$bitmap.Save((Join-Path $destination 'drain-logo.jpg'), $codec, $quality)
$graphics.Dispose(); $bitmap.Dispose(); $logo.Dispose(); $quality.Dispose()
$manifest | ConvertTo-Json | Set-Content (Join-Path $destination 'selection.json') -Encoding utf8
Write-Output "Prepared $($selection.Count) photographs and the logo."
