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

$recordatorio = new RecordatorioModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

$accion = isset($_GET['accion']) ? $_GET['accion'] : null;

switch ($metodo) {

    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));

        if ($datos) {
            echo json_encode($recordatorio->insertar($datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Datos inválidos o incompletos.']);
        }
        break;


    case 'GET':
        if (isset($_GET['tipo']) && $_GET['tipo'] === 'vigencia') {
            echo json_encode($recordatorio->consultarVigencia());
        } else {
            echo json_encode($recordatorio->consultar()); // por defecto, vigentes
        }
        break;




    case 'PUT':
        // 🔹 Si solo se quiere actualizar el estado
        if (isset($_GET['id']) && isset($_GET['estado'])) {
            $id = (int) $_GET['id'];
            $nuevoEstado = $_GET['estado'];
            echo json_encode($recordatorio->actualizarEstado($id, $nuevoEstado));
        }
        // 🔹 Si se quiere editar un registro completo
        else if (isset($_GET['id'])) {
            $id = (int) $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($recordatorio->editar($id, $datos));
        } 
        else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (!empty($_GET['id'])) {
            $id = (int) $_GET['id']; // aseguramos que sea numérico
            echo json_encode($recordatorio->eliminar($id));
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