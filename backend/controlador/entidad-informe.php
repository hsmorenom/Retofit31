<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods:GET,PUT,DELETE,POST,OPTIONS');
header('Access-Control-Allow-Headers:Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();

}

require_once '../modelos/entidad-informe.php';

$entidad_informe = new Entidad_informeModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($entidad_informe->filtrarPorId($id));
        } elseif (isset($_GET['entidad']) && isset($_GET['id_referencia'])) {
            $entidad = $_GET['entidad'];
            $id_referencia = $_GET['id_referencia'];
            echo json_encode($entidad_informe->filtrarPorEntidad($entidad, $id_referencia));
        } else {
            echo json_encode($entidad_informe->consultar());
        }
        break;

    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));
        echo json_encode($entidad_informe->insertar($datos));
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($entidad_informe->editar($id, $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($entidad_informe->eliminar($id));
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