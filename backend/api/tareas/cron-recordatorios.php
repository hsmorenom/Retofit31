<?php
declare(strict_types=1);

// ✅ Seguridad: API KEY
$API_KEY = "retrofit_cron_2025_secret";
$key = $_GET['key'] ?? '';
if ($key !== $API_KEY) {
    http_response_code(403);
    echo json_encode(["resultado" => "ERROR", "mensaje" => "Acceso denegado"]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../controlador/correoController.php';

$db = DB::conectar();
$correoCtrl = new CorreoController();

// ✅ Selecciona recordatorios cuya hora ya llegó
$sql = "SELECT 
        r.*, 
        u.EMAIL,
        c.TELEFONO,
        CONCAT(u.PRIMER_NOMBRE, ' ', u.PRIMER_APELLIDO) AS NOMBRE_CLIENTE,
        e.NOMBRE_EVENTO, 
        e.FECHA_ACTIVIDAD, 
        e.HORA_INICIO, 
        e.LUGAR_DE_ACTIVIDAD
    FROM recordatorio r
    INNER JOIN cliente c ON r.CLIENTE = c.ID_CLIENTE
    INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
    INNER JOIN eventos e ON r.EVENTO = e.ID_EVENTOS
    WHERE r.ESTADO IN ('pendiente', 'parcial')
    AND r.FECHA_HORA <= NOW()
    ORDER BY r.FECHA_HORA ASC";

$stmt = $db->prepare($sql);
$stmt->execute();
$recordatorios = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$recordatorios) {
    echo json_encode(["resultado" => "OK", "envios" => []]);
    exit;
}

$envios = [];

foreach ($recordatorios as $rec) {

    $destino = [
        'correo' => $rec['EMAIL'],
        'telefono' => $rec['TELEFONO'],
        'nombre' => $rec['NOMBRE_CLIENTE']
    ];

    $evento = [
        'nombre' => $rec['NOMBRE_EVENTO'],
        'fecha' => $rec['FECHA_ACTIVIDAD'],
        'hora' => $rec['HORA_INICIO'],
        'lugar' => $rec['LUGAR_DE_ACTIVIDAD']
    ];

    $res = $correoCtrl->enviarRecordatorio($destino, $evento, $rec['TIPO_NOTIFICACION']);

    if ($res['resultado'] === 'OK') {

        $nuevoEstado = ($rec['FRECUENCIA'] === '2_dia' && $rec['ESTADO'] === 'pendiente')
            ? 'parcial'
            : 'enviado';

        $update = $db->prepare("UPDATE recordatorio 
                                SET ESTADO = :estado 
                                WHERE ID_RECORDATORIO = :id");
        $update->execute([':estado' => $nuevoEstado, ':id' => $rec['ID_RECORDATORIO']]);

        $envios[] = [
            "id" => $rec['ID_RECORDATORIO'],
            "nuevo_estado" => $nuevoEstado
        ];
    }
}

echo json_encode(["resultado" => "OK", "envios" => $envios], JSON_UNESCAPED_UNICODE);


