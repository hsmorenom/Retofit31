<?php
/**
 * Endpoint API: Enviar recordatorio (correo o mensaje)
 * Ruta: backend/api/correo/enviar-recordatorio.php
 * Método: POST (JSON)
 */

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../controlador/correoController.php';

try {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);

    error_log("📩 Datos recibidos: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $correo   = trim($data['correo'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $nombre   = trim($data['nombre'] ?? '');
    $tipo     = strtolower(trim($data['tipo'] ?? 'correo')); // 'correo' o 'mensaje'
    $evento   = $data['evento'] ?? [];

    $errores = [];

    if ($tipo === 'correo' && empty($correo)) $errores[] = 'Falta el correo del destinatario.';
    if ($tipo === 'mensaje' && empty($telefono)) $errores[] = 'Falta el número de teléfono.';
    if (empty($nombre)) $errores[] = 'Falta el nombre del cliente.';
    if (empty($evento['nombre']) || empty($evento['fecha']) || empty($evento['hora']) || empty($evento['lugar'])) {
        $errores[] = 'Datos incompletos del evento.';
    }

    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Errores en los parámetros', 'detalles' => $errores], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $destino = [
        'correo' => filter_var($correo, FILTER_SANITIZE_EMAIL),
        'telefono' => preg_replace('/[^0-9+]/', '', $telefono),
        'nombre' => substr(strip_tags($nombre), 0, 120)
    ];

    $eventoSan = [
        'nombre' => substr(strip_tags($evento['nombre'] ?? ''), 0, 120),
        'fecha' => substr(strip_tags($evento['fecha'] ?? ''), 0, 10),
        'hora' => substr(strip_tags($evento['hora'] ?? ''), 0, 5),
        'lugar' => substr(strip_tags($evento['lugar'] ?? ''), 0, 120)
    ];

    $ctrl = new CorreoController();
    $res = $ctrl->enviarRecordatorio($destino, $eventoSan, $tipo);

    echo json_encode($res, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => $e->getMessage()]);
}
