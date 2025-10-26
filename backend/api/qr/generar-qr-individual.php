<?php
// 🔹 Evita cualquier salida previa (espacios, saltos de línea, BOM, etc.)
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once '../../conexion.php';
require_once '../../library/vendor/autoload.php';

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

try {
    $conexion = DB::conectar();

    // ✅ Validar ID
    $idEvento = $_GET['id_evento'] ?? null;
    if (!$idEvento) {
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID del evento no proporcionado']);
        exit;
    }

    // ✅ Verificar que el evento exista
    $stmt = $conexion->prepare("SELECT ID_EVENTOS FROM eventos WHERE ID_EVENTOS = :id");
    $stmt->execute([':id' => $idEvento]);
    if (!$stmt->fetch()) {
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Evento no encontrado']);
        exit;
    }

    // ✅ URL codificada dentro del QR
    $baseUrl = "http://localhost:8000/backend/api/asistencia/registrar.php";
    $qrTexto = "{$baseUrl}?id_evento={$idEvento}";

    // ✅ Configuración del QR
    $options = new QROptions([
        'version'      => 5,
        'outputType'   => QRCode::OUTPUT_IMAGE_PNG,
        'eccLevel'     => QRCode::ECC_L,
        'scale'        => 5,
        'imageBase64'  => false
    ]);

    $qr = new QRCode($options);
    $imageData = $qr->render($qrTexto);

    // ✅ Validar que sea una imagen PNG válida
    if (substr($imageData, 1, 3) !== 'PNG') {
        throw new Exception("El contenido generado no es un PNG válido.");
    }

    // ✅ Guardar archivo
    $qrFilePath = __DIR__ . "/../../uploads/qr/qr_evento{$idEvento}.png";
    file_put_contents($qrFilePath, $imageData);

    // ✅ Actualizar registro del evento
    $qrUrl = "uploads/qr/qr_evento{$idEvento}.png";
    $stmtUpdate = $conexion->prepare("UPDATE eventos SET QR_DE_EVENTO = :qr WHERE ID_EVENTOS = :id");
    $stmtUpdate->execute([':qr' => $qrUrl, ':id' => $idEvento]);

    echo json_encode([
        'resultado' => 'OK',
        'mensaje'   => 'QR generado correctamente',
        'qr'        => $qrUrl
    ]);
    exit;

} catch (Exception $e) {
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => $e->getMessage()]);
    exit;
}
