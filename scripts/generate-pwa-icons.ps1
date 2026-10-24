Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$iconDirectory = Join-Path $root 'public\icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null

foreach ($size in @(192, 512)) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(8, 16, 14))

  $scale = $size / 512.0
  function Point([float]$x, [float]$y) { [System.Drawing.PointF]::new([float]($x * $scale), [float]($y * $scale)) }
  $frame = [System.Drawing.PointF[]]@((Point 96 62),(Point 416 62),(Point 454 122),(Point 402 438),(Point 110 438),(Point 58 122))
  $frameBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20,35,30))
  $framePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(74,112,96), 4*$scale)
  $graphics.FillPolygon($frameBrush, $frame)
  $graphics.DrawPolygon($framePen, $frame)

  $amber = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(246,188,77))
  $coral = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(226,94,69))
  $cyan = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(105,224,208))
  $rift = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(8,16,14))
  $graphics.FillPolygon($amber, [System.Drawing.PointF[]]@((Point 142 114),(Point 350 78),(Point 330 182),(Point 122 220)))
  $graphics.FillPolygon($coral, [System.Drawing.PointF[]]@((Point 121 237),(Point 327 199),(Point 310 292),(Point 105 330)))
  $graphics.FillPolygon($cyan, [System.Drawing.PointF[]]@((Point 104 349),(Point 307 311),(Point 293 388),(Point 91 425)))
  $graphics.FillPolygon($rift, [System.Drawing.PointF[]]@((Point 277 82),(Point 229 232),(Point 276 219),(Point 216 431),(Point 339 250),(Point 287 261),(Point 347 100)))

  $output = Join-Path $iconDirectory "icon-$size.png"
  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
  $frameBrush.Dispose(); $framePen.Dispose(); $amber.Dispose(); $coral.Dispose(); $cyan.Dispose(); $rift.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
