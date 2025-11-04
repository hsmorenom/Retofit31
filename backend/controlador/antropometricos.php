<?php
// Este header le dice al frontend que el servidor recibirá la info en formato json
header('Content-Type: application/json');
// Permite que cualquier localhost haga peticiones al servidor, el * significa que cualquiera puede hacerlo
header('Access-Control-Allow-Origin: *');
// Le dice al navegador el tipo de metodos que se emplearan para el api
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
//Se permite el tipo de contenido en el dominio
header('Access-Control-Allow-Headers: Content-Type');

// $_SERVER['REQUEST_METHOD'] es una variable global de php que contiene todos los metodos del crud y options, se hace una condicional para que en caso de que el metodo sea options este marque como un ok, que el codigo 200 respalda esta respuesta

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// es usado para usar otra clase ya creado en este mismo documento, en otras palabras, reutiliza codigo que sirve en este espacio
require_once '../modelos/antropometricos.php';
// crea un objeto de la clase que en este caso es AntropometricosModelo
$antropometricos = new AntropometricosModelo();
//guarda dentro de una variable las peticiones que $_SERVER da de post, get, delete, put,etc
$metodo = $_SERVER['REQUEST_METHOD'];
//se usa switch para ejecutar el tipo de metodo 
switch ($metodo) {
    // El case GET lo que hace es si la url, esta como ?cliente=5, el get filtre los cliente y que coincida con este id, si no se especifica devuelve todos los datos,
    // El isset es una herramienta que nos dice si la variable existe y que no este vacia o sea null
    // $_get sirve para recibir datos enviados en la url
    // json_encode convierte cualquier objeto,array y cualquier cosa en lenguaje universal de json
    case 'GET':
        if (isset($_GET['cliente'])) {
            $id_cliente = $_GET['cliente'];
            echo json_encode($antropometricos->filtrarIdCliente($id_cliente));
        } else {
            echo json_encode($antropometricos->consultar());
        }
        break;
    // Crea un nuevo registro leyendo que mediante el json se recibio, json_decode decodifica esta estructura, y lo pasa al metodo de insertar relacionado por antropometricos
    // json_decode hace lo contrario, de un lenguaje json lo traduce a un lenguaje de programacion que en este caso es php
    case 'POST':
        $datos = json_decode(file_get_contents("php://input"));

        if (!$datos) {
            echo json_encode([
                'resultado' => 'ERROR',
                'mensaje' => 'Datos incompletos o formato inválido'
            ]);
            break;
        }

        echo json_encode($antropometricos->insertar($datos));
        break; // ✅✅✅ ESTE ES OBLIGATORIO



    // primero identifica si el id a editar esta dentro de la base de datos, cuando se reconozca el post recoge los datos guardados con este id y llama el metodo de editar
    case 'PUT':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $datos = json_decode(file_get_contents("php://input"));
            echo json_encode($antropometricos->editar($id, $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    // Primero se verifica si el id que se quiere eliminar esta en la url, y si existe, llama a eliminar
    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode($antropometricos->eliminar($id));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
