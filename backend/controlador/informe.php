<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods:GET,PUT,DELETE,POST,OPTIONS');
header('Access-Control-Allow-Headers:Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();

}

require_once '../modelos/informe.php';

$informe = new InformeModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':

        if (empty($_GET)) {
            echo json_encode($informe->consultar());
        } else {

            $filtros = json_decode(json_encode($_GET));
            echo json_encode($informe->filtrar($filtros));
        }
        break;

    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));
        echo json_encode($informe->insertar($datos));
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($informe->editar($id, $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($informe->eliminar($id));
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