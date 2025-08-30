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
        // Aca se valida si la variable blobal esta vacia, si lo es devuelve true si contiene algo da false y procede a hacer filtro
        if (empty($_GET)) {
            echo json_encode($eventos->consultar());
        } else {
            // Convertimos los parámetros GET en un objeto, el $_GET segun la peticion esta en json como ?id= 1, esto se traduce como ["id"=>"1"], json_encode lo vuelve json así,{"id"="1"} y de ello se usa json_decode para volverlo     objeto en php
            //  stdClass Object
            // (
            //   [id] => 1
            // )
            // al final, la funcion filtrar puede usar esto porque ya es un objeto
            $filtros = json_decode(json_encode($_GET));
            echo json_encode($eventos->filtrar($filtros));
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
            echo json_encode($eventos->eliminar($id));
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