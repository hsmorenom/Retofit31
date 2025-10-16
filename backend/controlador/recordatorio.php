<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../modelos/recordatorio.php';

$recorda = new RecordatorioModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

// ✅ Si hay un parámetro "accion" lo tomamos (por ejemplo: registrarQR)
$accion = isset($_GET['accion']) ? $_GET['accion'] : null;

switch ($metodo) {

    // 🔹 Registrar asistencia mediante QR
    case 'POST':

        // Registro normal (manual)
        $datos = json_decode(file_get_contents("php://input"));
        echo json_encode($asistencia->insertar($datos));

        break;

    case 'GET':

        echo json_encode($asistencia->consultar());

        break;


    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($asistencia->editar($id, $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (!empty($_GET['id'])) {
            $id = (int) $_GET['id']; // aseguramos que sea numérico
            echo json_encode($asistencia->eliminar($id));
        } else {
            echo json_encode([
                'resultado' => 'ERROR',
                'mensaje' => 'ID no proporcionado o inválido para eliminación'
            ]);
        }
        break;


    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
?>