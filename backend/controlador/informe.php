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
require_once '../utilidades/generadorPDF.php';


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

        // --- Si es generación de PDF ---
        if (isset($datos->generarPDF) && $datos->generarPDF === true) {

            // 1. Generar PDF
            $pdf = generarInformePDF($datos);

            // 2. Registrar INFORME
            $parametrosInforme = (object) [
                'FECHA_CREACION' => $pdf['FECHA_CREACION'],
                'TIPO_INFORME' => $datos->tipoInforme,
                'USUARIO' => $datos->usuario,
                'CLIENTE' => isset($datos->cliente) ? $datos->cliente : null,
                'URL_PDF' => $pdf['urlPDF']
            ];

            $respuestaInforme = $informe->insertar($parametrosInforme);

            if ($respuestaInforme['resultado'] !== 'OK') {
                echo json_encode($respuestaInforme);
                break;
            }

            $idInforme = $respuestaInforme['idInforme'];

            require_once '../modelos/entidad-informe.php';
            $entidad = new Entidad_informeModelo();

            // ==============================
            // ▶ CASO 1: INFORMES DE ASISTENCIA
            // ==============================
            $informesAsistencia = ["asistencias", "inasistencias", "porcentaje"];

            if (in_array($datos->tipoInforme, $informesAsistencia)) {

                $paramEntidad = (object) [
                    'INFORME' => $idInforme,
                    'ENTIDAD' => 'evento',
                    'ID_REFERENCIA' => $datos->evento
                ];

                $respuestaEntidad = $entidad->insertar($paramEntidad);
            }

            // ==============================
            // ▶ CASO 2: INFORMES ADMINISTRATIVOS
            // ==============================
            $informesAdministrativos = [
                "cantidad_estados",
                "cantidad_sexos",
                "cantidad_por_tipo_usuario",
                "listado_detallado"
            ];

            if (in_array($datos->tipoInforme, $informesAdministrativos)) {

                // Fila 1: marca que es un informe administrativo
                $paramAdm = (object) [
                    'INFORME' => $idInforme,
                    'ENTIDAD' => 'administrativo',
                    'ID_REFERENCIA' => null
                ];
                $entidad->insertar($paramAdm);

                // Fila 2 (opcional): si hay cliente específico, lo relaciona
                if (isset($datos->cliente) && !empty($datos->cliente)) {
                    $paramCli = (object) [
                        'INFORME' => $idInforme,
                        'ENTIDAD' => 'cliente',
                        'ID_REFERENCIA' => $datos->cliente
                    ];
                    $entidad->insertar($paramCli);
                }
            }

            echo json_encode([
                'resultado' => 'OK',
                'urlPDF' => $pdf['urlPDF'],
                'informe' => $respuestaInforme
            ]);
            break;
        }

        // Inserción normal
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