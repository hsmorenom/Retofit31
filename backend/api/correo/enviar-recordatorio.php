<?php
/**
 * Endpoint API: Enviar recordatorio por correo
 * Ruta: backend/api/correo/enviarRecordatorio.php
 * Método: POST (JSON)
 * 
 * Body de ejemplo:
 * {
 *   "correo": "cliente.ficticio@mail.com",
 *   "nombre": "Juan Pérez",
 *   "evento": {
 *     "nombre": "Entrenamiento funcional",
 *     "fecha": "2025-11-02",
 *     "hora": "18:00",
 *     "lugar": "Sede Norte"
 *   }
 * }
 */

declare(strict_types=1);

// CORS básico (ajústalo según tu dominio)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // preflight
    exit;
}

require_once __DIR__ . '/../../controlador/correoController.php';

try {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);

    $correo = trim($data['correo'] ?? '');
    $nombre = trim($data['nombre'] ?? '');
    $evento = $data['evento'] ?? [];

    if ($correo === '' || $nombre === '' || empty($evento)) {
        http_response_code(400);
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Parámetros incompletos']);
        exit;
    }

    // Sanitización básica
    $destino = [
        'correo' => filter_var($correo, FILTER_SANITIZE_EMAIL),
        'nombre' => substr(strip_tags($nombre), 0, 120),
    ];
    $eventoSan = [
        'nombre' => substr(strip_tags($evento['nombre'] ?? ''), 0, 120),
        'fecha' => substr(strip_tags($evento['fecha'] ?? ''), 0, 10),
        'hora' => substr(strip_tags($evento['hora'] ?? ''), 0, 5),
        'lugar' => substr(strip_tags($evento['lugar'] ?? ''), 0, 120),
    ];

    $ctrl = new CorreoController();
    $res = $ctrl->enviarRecordatorio($destino, $eventoSan);

    echo json_encode($res, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => $e->getMessage()]);
}
