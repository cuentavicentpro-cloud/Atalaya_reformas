param (
    [int]$Port = 3000
)

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Warning "El puerto $Port no esta disponible, probando puerto 8080..."
    $Port = 8080
    $prefix = "http://localhost:$Port/"
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Yellow
Write-Host "  ATALAYA REFORMAS MURCIA - SERVIDOR LOCAL ACTIVO" -ForegroundColor Green
Write-Host "  URL: $prefix" -ForegroundColor Cyan
Write-Host "  Directorio raiz: $rootDir" -ForegroundColor Gray
Write-Host "  Presiona Ctrl+C en cualquier momento para detener el servidor" -ForegroundColor Gray
Write-Host "===============================================================" -ForegroundColor Yellow
Write-Host ""

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
    ".woff" = "font/woff"
    ".ttf"  = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        # Decodificar URL y normalizar separadores
        $safePath = [System.Uri]::UnescapeDataString($urlPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($rootDir, $safePath)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 200 OK: $urlPath ($contentType)" -ForegroundColor DarkGreen
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/html; charset=utf-8"
            $msg = "<h1>404 Recurso no encontrado</h1><p>El archivo $urlPath no existe en el servidor local de Atalaya Reformas.</p><p><a href='/'>Volver al Inicio</a></p>"
            $msgBytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.ContentLength64 = $msgBytes.Length
            $response.OutputStream.Write($msgBytes, 0, $msgBytes.Length)
            Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 404 NOT FOUND: $urlPath" -ForegroundColor DarkRed
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
