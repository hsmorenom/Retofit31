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

            /* ======================================================
               REGISTRO EN ENTIDAD INFORME SEGÚN TIPO DE INFORME
            ====================================================== */

            require_once '../modelos/entidad-informe.php';
            $entidad = new Entidad_informeModelo();

            // ▶ CASO 1: INFORMES DE ASISTENCIA (asistencias, inasistencias, porcentaje)
            $informesAsistencia = ["asistencias", "inasistencias", "porcentaje"];

            if (in_array($datos->tipoInforme, $informesAsistencia)) {

                $paramEntidad = (object) [
                    'INFORME' => $idInforme,
                    'ENTIDAD' => 'evento',
                    'ID_REFERENCIA' => $datos->evento
                ];

                $respuestaEntidad = $entidad->insertar($paramEntidad);

            }

            // ▶ CASO 2: INFORME ADMINISTRATIVO POR USUARIO (listado detallado con filtro)
            if (
                $datos->tipoInforme === "listado_detallado" &&
                isset($datos->cliente) &&
                !empty($datos->cliente)
            ) {

                $paramEntidad = (object) [
                    'INFORME' => $idInforme,
                    'ENTIDAD' => 'cliente',
                    'ID_REFERENCIA' => $datos->cliente
                ];

                $respuestaEntidad = $entidad->insertar($paramEntidad);

            }

            echo json_encode([
                'resultado' => 'OK',
                'urlPDF' => $pdf['urlPDF'],
                'informe' => $respuestaInforme,
                'entidad' => isset($respuestaEntidad) ? $respuestaEntidad : null
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