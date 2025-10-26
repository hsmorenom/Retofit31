<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../../conexion.php';

try {
    $conexion = DB::conectar();

    // ✅ Obtener el ID del evento desde la URL
    $idEvento = $_GET['id_evento'] ?? null;

    if (!$idEvento) {
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID del evento no proporcionado']);
        exit;
    }

    // ✅ Verificar que el evento exista
    $sqlEvento = "SELECT NOMBRE_EVENTO, FECHA_ACTIVIDAD FROM eventos WHERE ID_EVENTOS = :id";
    $stmt = $conexion->prepare($sqlEvento);
    $stmt->execute([':id' => $idEvento]);
    $evento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$evento) {
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Evento no encontrado']);
        exit;
    }

    // ⚙️ Aquí puedes cambiar el ID del cliente según el usuario logueado
    // o leerlo desde la URL si el QR lleva ?id_evento=20&id_cliente=15
    $idCliente = $_GET['id_cliente'] ?? null;

    if (!$idCliente) {
        // Modo de demostración (sin login)
        echo json_encode([
            'resultado' => 'OK',
            'mensaje' => 'QR escaneado correctamente',
            'evento' => $evento['NOMBRE_EVENTO'],
            'fecha' => $evento['FECHA_ACTIVIDAD'],
            'nota' => 'No se registró asistencia porque no hay cliente definido'
        ]);
        exit;
    }

    // ✅ Registrar la asistencia
    $sqlInsert = "INSERT INTO asistencia (CLIENTE, EVENTO, NOTIFICACION) 
                  VALUES (:cliente, :evento, :notificacion)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->execute([
        ':cliente' => $idCliente,
        ':evento' => $idEvento,
        ':notificacion' => 'Asistencia registrada automáticamente vía QR'
    ]);

    echo json_encode([
        'resultado' => 'OK',
        'mensaje' => 'Asistencia registrada exitosamente',
        'evento' => $evento['NOMBRE_EVENTO'],
        'fecha' => $evento['FECHA_ACTIVIDAD']
    ]);

} catch (Exception $e) {
    echo json_encode(['resultado' => 'ERROR', 'mensaje' => $e->getMessage()]);
    exit;
}
