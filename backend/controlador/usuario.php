<?php
header('Content-Type:application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 🔹 Evitar que los errores rompan el JSON
ini_set('display_errors', 0); // No mostrar errores en pantalla
ini_set('log_errors', 1);     // Guardar errores en el log de PHP
error_reporting(E_ALL);       // Reportar todos los errores

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../modelos/usuario.php';

$usuario = new UsuarioModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        if (isset($_GET['id']) && isset($_GET['clave'])) {
            // 🔹 Verificar clave actual
            echo json_encode($usuario->validarClave($_GET['id'], $_GET['clave']));
        } elseif (isset($_GET['id'])) {
            // 🔹 Consultar usuario por ID
            echo json_encode($usuario->filtrarPorId($_GET['id']));
        } else {
            // 🔹 Consultar todos los usuarios
            echo json_encode($usuario->consultar());
        }
        break;


    case 'POST':
        $input = file_get_contents("php://input");
        $datos = json_decode($input, true);

        // Validar que $datos no sea null
        if (!$datos) {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'No se recibió JSON válido.']);
            exit();
        }

        // Si tiene email y clave, intentamos login
        if (isset($datos['email']) && isset($datos['clave'])) {
            echo json_encode($usuario->login($datos['email'], $datos['clave']));

            //Cambiar el estado del usuario
        } elseif (isset($_GET['accion']) && $_GET['accion'] === 'cambiarEstado') {

            if (isset($datos['id'])) {
                echo json_encode($usuario->cambiarEstadoUsuario($datos['id']));
            } else {
                echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado']);
            }
        } else {
            // Insertar solo si vienen datos válidos
            if (is_array($datos) && count($datos) > 0) {
                echo json_encode($usuario->insertar($datos));
            } else {
                echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Datos de inserción inválidos.']);
            }
        }

        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            $datos = json_decode(file_get_contents("php://input"), true);

            if (!$datos) {
                echo json_encode([
                    'resultado' => 'ERROR',
                    'mensaje' => 'No se recibió JSON válido para actualización'
                ]);
                exit();
            }

            // Normalizar claves a minúsculas
            $datos = array_change_key_case($datos, CASE_LOWER);

            // Si  viene clave actual y nuevaClave, se trata de un cambio de clave
            if (isset($datos['claveactual']) && isset($datos['nuevaclave'])) {
                echo json_encode($usuario->cambiarClave($_GET['id'], $datos['claveactual'], $datos['nuevaclave']));
            } else {
                echo json_encode($usuario->editar($_GET['id'], $datos));
            }
        } else {
            echo json_encode([
                'resultado' => 'ERROR',
                'mensaje' => 'ID no proporcionado para actualización'
            ]);
        }
        break;


    case 'DELETE':
        if (isset($_GET['id'])) {
            echo json_encode($usuario->eliminar($_GET['id']));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
