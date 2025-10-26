<?php
// 🔹 Permitir acceso desde Angular (localhost:4200)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 🔹 Tipo de contenido: imagen PNG
header("Content-Type: image/png");

// 🔹 Recibir nombre del archivo
$archivo = $_GET['archivo'] ?? null;
if (!$archivo) {
    http_response_code(400);
    echo "Falta el parámetro 'archivo'";
    exit;
}

// 🔹 Ruta protegida (evita acceso a otros directorios)
$ruta = __DIR__ . "/../../uploads/qr/" . basename($archivo);

if (!file_exists($ruta)) {
    http_response_code(404);
    echo "Archivo no encontrado";
    exit;
}

// 🔹 Mostrar la imagen
readfile($ruta);
