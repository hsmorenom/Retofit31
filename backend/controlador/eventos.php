<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods:GET,PUT,DELETE,POST,OPTIONS');
header('Access-Control-Allow-Headers:Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();

}

require_once '../modelos/eventos.php';

$eventos = new EventosModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        
        if (isset($_GET['texto'])) {
            $filtro = $_GET['texto'];
            echo json_encode($eventos->filtrar($filtro));
        }
        // Consultar solo eventos vigentes
        else if (isset($_GET['vigentes'])) {
            echo json_encode($eventos->consultarVigentes());
        }
        // Cualquier otro caso por defecto
        else {
            echo json_encode($eventos->consultar());
        }
        break;


    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));
        echo json_encode($eventos->insertar($datos));
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($eventos->editar($id, $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $resultado = $eventos->eliminar($id);
            http_response_code(200);
            echo json_encode($resultado);
        } else {
            http_response_code(400);
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

}
;



?>