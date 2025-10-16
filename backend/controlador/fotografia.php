<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../modelos/fotografia.php';

$fotografia = new FotografiaModelo();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            echo json_encode($fotografia->filtrar($_GET['id']));
        } else {
            echo json_encode($fotografia->consultar());
        }
        break;

case 'POST':

    $datos = (object) [
        'fecha_inicio' => date("Y-m-d"), // Fecha del servidor
        'fecha_final' => date("Y-m-d"),
        'cliente' => $_POST['cliente'],
        'usuario' => $_POST['usuario'],
        'imagen_url' => $_POST['imagen_url'] ?? ''
    ];

    $ruta = "C:/xampp/htdocs/retofit31/backend/uploads/fotografias/";
    if (!file_exists($ruta)) mkdir($ruta, 0777, true);

    $documento = $_POST['identificacion']; // Documento para renombrar

    // ---------- FOTO FRONTAL ----------
    if (!empty($_FILES['foto_frontal']['name'])) {
        $ext = pathinfo($_FILES['foto_frontal']['name'], PATHINFO_EXTENSION);
        $nombreFrontal = $documento . "-" . date("d-m-Y") . "-frontal." . $ext;
        move_uploaded_file($_FILES['foto_frontal']['tmp_name'], $ruta . $nombreFrontal);
        $datos->foto_frontal = $nombreFrontal;
        $datos->desc_frontal = $_POST['desc_frontal'] ?? null;
        $datos->etiqueta_frontal = $_POST['etiqueta_frontal'] ?? null;
    }

    // ---------- FOTO LATERAL ----------
    if (!empty($_FILES['foto_lateral']['name'])) {
        $ext = pathinfo($_FILES['foto_lateral']['name'], PATHINFO_EXTENSION);
        $nombreLateral = $documento . "-" . date("d-m-Y") . "-lateral." . $ext;
        move_uploaded_file($_FILES['foto_lateral']['tmp_name'], $ruta . $nombreLateral);
        $datos->foto_lateral = $nombreLateral;
        $datos->desc_lateral = $_POST['desc_lateral'] ?? null;
        $datos->etiqueta_lateral = $_POST['etiqueta_lateral'] ?? null;
    }

    // ---------- FOTO POSTERIOR ----------
    if (!empty($_FILES['foto_posterior']['name'])) {
        $ext = pathinfo($_FILES['foto_posterior']['name'], PATHINFO_EXTENSION);
        $nombrePosterior = $documento . "-" . date("d-m-Y") . "-posterior." . $ext;
        move_uploaded_file($_FILES['foto_posterior']['tmp_name'], $ruta . $nombrePosterior);
        $datos->foto_posterior = $nombrePosterior;
        $datos->desc_posterior = $_POST['desc_posterior'] ?? null;
        $datos->etiqueta_posterior = $_POST['etiqueta_posterior'] ?? null;
    }

    echo json_encode($fotografia->insertar($datos));
    break;





    case 'PUT':
        parse_str(file_get_contents("php://input"), $put_vars);

        $datos = (object) $put_vars;
        if (isset($_GET['id'])) {
            echo json_encode($fotografia->editar($_GET['id'], $datos));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para actualización']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            echo json_encode($fotografia->eliminar($_GET['id']));
        } else {
            echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'ID no proporcionado para eliminación']);
        }
        break;

    default:
        echo json_encode(['resultado' => 'ERROR', 'mensaje' => 'Método HTTP no permitido']);
        break;
}
?>
