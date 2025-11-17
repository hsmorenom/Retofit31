<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../conexion.php';

if (!isset($_GET['token'])) {
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Token no proporcionado.']);
    exit;
}

$token = $_GET['token'];
$db = DB::conectar();

$stmt = $db->prepare("
    SELECT ID_USUARIO, EMAIL, RESET_EXPIRA
    FROM usuario
    WHERE RESET_TOKEN = :token
");
$stmt->execute([':token' => $token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Token inválido']);
    exit;
}

// Validar expiración
if (strtotime($user['RESET_EXPIRA']) < time()) {
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'El enlace ha expirado']);
    exit;
}

echo json_encode([
    'resultado' => 'OK',
    'email' => $user['EMAIL'],
    'idUsuario' => $user['ID_USUARIO']
]);
