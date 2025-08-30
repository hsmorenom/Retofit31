<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../conexion.php'; // Ajusta según tu estructura

// Leer el JSON enviado por Angular
$data = json_decode(file_get_contents('php://input'), true);

// Debug: mostrar qué datos llegan
if (!$data) {
    echo json_encode(['error' => 'No se recibió JSON', 'raw_input' => file_get_contents('php://input')]);
    exit;
}

$id_cliente = $data['id_cliente'] ?? null;
$foto_url = $data['foto_url'] ?? null;

// Validar datos
if (!$id_cliente || !$foto_url) {
    echo json_encode(['error' => 'Faltan datos', 'id_cliente' => $id_cliente, 'foto_url' => $foto_url]);
    exit;
}

try {
    $sql = "UPDATE cliente SET FOTO_PERFIL_URL = :foto_url WHERE ID_CLIENTE = :id_cliente";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':foto_url' => $foto_url, ':id_cliente' => $id_cliente]);

    $filasActualizadas = $stmt->rowCount();

    if ($filasActualizadas > 0) {
        echo json_encode(['mensaje' => 'Foto actualizada correctamente', 'filas_actualizadas' => $filasActualizadas]);
    } else {
        echo json_encode(['error' => 'No se encontró el cliente o la URL es igual a la anterior', 'id_cliente' => $id_cliente]);
    }

} catch (PDOException $e) {
    echo json_encode(['error' => 'Error PDO: ' . $e->getMessage()]);
}
