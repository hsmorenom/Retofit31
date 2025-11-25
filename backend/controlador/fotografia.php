<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../modelos/fotografia.php';

$fotografia = new FotografiaModelo();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // =====================================================
    // 🔍 GET
    // =====================================================
    case 'GET':

        // 1️⃣ Obtener últimas fechas
        if (isset($_GET['accion']) && $_GET['accion'] === 'fechas') {
            if (!isset($_GET['idCliente'])) {
                echo json_encode([]);
                exit();
            }

            echo json_encode(
                $fotografia->obtenerFechasPorCliente($_GET['idCliente'])
            );
            exit();
        }

        // 2️⃣ Obtener fotos por fecha seleccionada
        if (isset($_GET['accion']) && $_GET['accion'] === 'fotosPorFecha') {

            if (!isset($_GET['idCliente']) || !isset($_GET['fecha'])) {
                echo json_encode(null);
                exit();
            }

            echo json_encode(
                $fotografia->obtenerFotosPorFecha($_GET['idCliente'], $_GET['fecha'])
            );
            exit();
        }

        // 3️⃣ Filtrar por ID cliente
        if (isset($_GET['id'])) {
            echo json_encode($fotografia->filtrar($_GET['id']));
            exit();
        }

        // 4️⃣ Consultar todas
        echo json_encode($fotografia->consultar());
        break;



    // =====================================================
    // ✏️ POST (Crear, editar, guardar observación)
    // =====================================================
    case 'POST':

        // 1️⃣ Guardar observación
        if (isset($_GET['accion']) && $_GET['accion'] === 'guardarObservacion') {

            $input = json_decode(file_get_contents("php://input"), true);

            if (!$input) {
                echo json_encode(['error' => 'Datos inválidos']);
                exit();
            }

            echo json_encode($fotografia->guardarObservacion($input));
            exit();
        }


        // 2️⃣ Editar fotos
        if (isset($_GET['accion']) && $_GET['accion'] === 'editar') {

            if (!isset($_GET['id'])) {
                echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID requerido']);
                exit();
            }

            $datos = (object)[
                'desc_frontal'      => $_POST['desc_frontal'] ?? null,
                'etiqueta_frontal'  => $_POST['etiqueta_frontal'] ?? null,

                'desc_lateral'      => $_POST['desc_lateral'] ?? null,
                'etiqueta_lateral'  => $_POST['etiqueta_lateral'] ?? null,

                'desc_posterior'    => $_POST['desc_posterior'] ?? null,
                'etiqueta_posterior'=> $_POST['etiqueta_posterior'] ?? null,

                'cliente'           => $_POST['cliente'] ?? null
            ];

            echo json_encode($fotografia->editar($_GET['id'], $datos));
            exit();
        }


        // 3️⃣ Insertar fotos (registro normal)
        if (!isset($_POST['cliente'])) {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Falta cliente']);
            exit();
        }

        $datos = (object)[
            'cliente'  => $_POST['cliente'],
            'usuario'  => $_POST['usuario'] ?? null,
            'identificacion' => $_POST['identificacion'],

            'desc_frontal'   => $_POST['desc_frontal'] ?? '',
            'etiqueta_frontal' => $_POST['etiqueta_frontal'] ?? '',

            'desc_lateral'   => $_POST['desc_lateral'] ?? '',
            'etiqueta_lateral' => $_POST['etiqueta_lateral'] ?? '',

            'desc_posterior' => $_POST['desc_posterior'] ?? '',
            'etiqueta_posterior' => $_POST['etiqueta_posterior'] ?? ''
        ];

        echo json_encode($fotografia->insertar($datos));
        exit();


    // =====================================================
    // ❌ DELETE
    // =====================================================
    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID requerido']);
            exit();
        }


    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método no permitido']);
        break;
}
?>
