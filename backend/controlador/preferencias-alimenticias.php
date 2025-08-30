<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods:GET,PUT,DELETE,POST,OPTIONS');
header('Access-Control-Allow-Headers:Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();

}

require_once '../modelos/preferencias-alimenticias.php';

$preferencias_alimenticias = new Preferencias_alimenticiasModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        if (isset($_GET['id_cliente'])) {
            $id = $_GET['id_cliente'];
            echo json_encode($preferencias_alimenticias->filtrarIdCliente($id));
        } else {
            echo json_encode($preferencias_alimenticias->consultar());
        }
        break;

    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));
        echo json_encode($preferencias_alimenticias->insertar($datos));
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($preferencias_alimenticias->editar($datos, $id));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($preferencias_alimenticias->eliminar($id));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

    default:

        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
;



?>