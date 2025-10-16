<?php
// Este header le dice al frontend que el servidor recibirá la info en formato json
header('Content-Type: application/json');
// Permite que cualquier localhost haga peticiones al servidor, el * significa que cualquiera puede hacerlo
header('Access-Control-Allow-Origin: *');
// Le dice al navegador el tipo de metodos que se emplearan para el api
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
// Se permite el tipo de contenido en el dominio
header('Access-Control-Allow-Headers: Content-Type');

// 🔹 Evitar que los errores rompan el JSON
ini_set('display_errors', 0); // No mostrar errores en pantalla
ini_set('log_errors', 1);     // Guardar errores en el log de PHP
error_reporting(E_ALL);       // Reportar todos los errores

// Si el navegador hace una petición OPTIONS (preflight), se responde con 200 OK sin más procesamiento
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Se incluye el modelo correspondiente
require_once '../modelos/cliente.php';
$cliente = new ClienteModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    // GET: devuelve todos los clientes o filtra por nombre si se envía un parámetro "buscar"
    case 'GET':
        if (isset($_GET['usuario'])) {
            $idUsuario = $_GET['usuario'];
            echo json_encode($cliente->obtenerClientePorUsuario($idUsuario));
        } elseif (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($cliente->filtrarPorId($id));
        } elseif (isset($_GET['modo']) && $_GET['modo'] === 'admon') {
            // Usar la nueva consulta especial para administrativo
            echo json_encode($cliente->consultarParaAdmon());
        } 
        elseif (isset($_GET['documento'])) {
    $documento = $_GET['documento'];
    $resultado = $cliente->buscarPorDocumento($documento);

    // ✅ Devolver SIEMPRE un arreglo
    if ($resultado) {
        echo json_encode([$resultado]);
    } else {
        echo json_encode([]);
    }
}
else {
            echo json_encode($cliente->consultar());
        }
        break;

    // POST: se crea un nuevo cliente
    case 'POST':
        $accion = $_GET['accion'] ?? null;
        $datos = json_decode(file_get_contents("php://input"));

        if ($accion === 'insertarParaAdmon') {
            // Insertar usando la función para administrador
            echo json_encode($cliente->insertarParaAdmon($datos));
        } else {
            // Validamos si viene también la info de usuario
            if (isset($datos->usuario) && isset($datos->cliente)) {

                echo json_encode($cliente->insertarClienteConUsuario($datos->usuario, $datos->cliente));
            } else {
                echo json_encode($cliente->insertar($datos));
            }
        }
        break;

    // PUT: se actualiza un cliente con ID
    case 'PUT':
        $accion = $_GET['accion'] ?? null;

        if ($accion === 'editarParaAdmon') {
            // Lógica para editar con permisos de administrador
            if (isset($_GET['id'])) {
                $id = $_GET['id'];
                $datos = json_decode(file_get_contents("php://input"), true);
                echo json_encode($cliente->editarParaAdmon($id, $datos));
            } else {
                echo json_encode([
                    'resultado' => 'ERROR',
                    'mensaje' => 'ID no proporcionado para edición de administrador'
                ]);
            }
        } else {
            // Lógica de edición normal (la que ya tienes)
            if (isset($_GET['id'])) {
                $id = $_GET['id'];
                $datos = json_decode(file_get_contents("php://input"), true);
                $datos = array_change_key_case($datos, CASE_LOWER);
                error_log("Datos recibidos en cliente.php: " . print_r($datos, true));
                echo json_encode($cliente->editar($id, $datos));
            } else {
                echo json_encode([
                    'resultado' => 'ERROR',
                    'mensaje' => 'ID no proporcionado para actualización'
                ]);
            }
        }
        break;


    // DELETE: elimina un cliente con ID
    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($cliente->eliminar($id));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

    // Método no permitido
    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
