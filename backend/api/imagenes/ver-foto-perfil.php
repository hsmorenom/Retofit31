<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (!isset($_GET['archivo']) || empty($_GET['archivo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se especificó el archivo']);
    exit;
}

// Ajusta la ruta según tu estructura real
$uploadsDir = __DIR__ . '/../../uploads/fotos/perfil/'; 

$archivo = basename($_GET['archivo']);
$rutaArchivo = $uploadsDir . $archivo;

// Verificar existencia
if (!file_exists($rutaArchivo)) {
    http_response_code(404);
    echo json_encode(['error' => 'Archivo no encontrado', 'ruta' => $rutaArchivo]);
    exit;
}

// Inferir MIME por extensión
$ext = strtolower(pathinfo($rutaArchivo, PATHINFO_EXTENSION));
switch ($ext) {
    case 'png': $mimeType = 'image/png'; break;
    case 'jpg':
    case 'jpeg': $mimeType = 'image/jpeg'; break;
    case 'webp': $mimeType = 'image/webp'; break;
    default: $mimeType = 'application/octet-stream';
}

// Enviar imagen
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($rutaArchivo));
readfile($rutaArchivo);
exit;

