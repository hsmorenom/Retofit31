<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


// Ajusta la ruta según donde esté tu conexion.php
require_once '../../conexion.php'; // <-- Asegúrate de que este path sea correcto

$directorioDestino = '../../uploads/fotos/perfil/';
$urlBase = 'http://localhost:8000/backend/uploads/fotos/perfil/';

$maxSizeMB = 5;
$maxSizeBytes = $maxSizeMB * 1024 * 1024;

// Verifica que llegue la imagen
if (!isset($_FILES['foto'])) {
    echo json_encode(['error' => 'No se recibió ninguna imagen']);
    exit;
}

if ($_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'Error al subir la imagen: código ' . $_FILES['foto']['error']]);
    exit;
}

if ($_FILES['foto']['size'] > $maxSizeBytes) {
    echo json_encode(['error' => 'La imagen excede el tamaño máximo de ' . $maxSizeMB . 'MB']);
    exit;
}

$archivo = $_FILES['foto'];
$nombreOriginal = basename($archivo['name']);
$extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

$extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $extensionesPermitidas)) {
    echo json_encode(['error' => 'Extensión no permitida']);
    exit;
}

// Crear nombre único
$nombreUnico = uniqid('perfil_') . '.' . $extension;
$rutaFinal = $directorioDestino . $nombreUnico;
$urlPublica = $urlBase . $nombreUnico;

// Crear carpeta si no existe
if (!is_dir($directorioDestino)) {
    mkdir($directorioDestino, 0775, true);
}

// Eliminar foto anterior si se envió
if (isset($_POST['fotoAnterior']) && !empty($_POST['fotoAnterior'])) {
    $rutaAnterior = basename($_POST['fotoAnterior']); // Evita rutas maliciosas
    $rutaCompleta = $directorioDestino . $rutaAnterior;
    if (file_exists($rutaCompleta)) {
        unlink($rutaCompleta);
    }
}

// Guardar nueva imagen
if (move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
    echo json_encode(['mensaje' => 'Imagen subida exitosamente', 'url' => $urlPublica]);
} else {
    echo json_encode(['error' => 'No se pudo guardar la imagen']);
}
