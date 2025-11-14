<?php

require_once __DIR__ . '/../library/vendor/autoload.php';
use Dompdf\Dompdf;
use Dompdf\Options;

function generarInformePDF($datos)
{
    date_default_timezone_set('America/Bogota');

    // Configuración de Dompdf
    $options = new Options();
    $options->set('isRemoteEnabled', true);

    $pdf = new Dompdf($options);

    // COLORES RETROFIT 31
    $verdeOscuro = "#004D00";
    $verdeClaro = "#7CE54F";

    // ---- TÍTULO AUTOMÁTICO SEGÚN INFORME ----
    $titulos = [
        "cantidad_estados" => "Informe de Usuarios por Estado",
        "cantidad_sexos" => "Informe de Usuarios por Sexo",
        "cantidad_por_tipo_usuario" => "Informe de Usuarios por Tipo",
        "listado_detallado" => "Listado Detallado de Usuarios",
        "asistencias" => "Informe de Asistencias",
        "inasistencias" => "Informe de Inasistencias",
        "porcentaje" => "Informe de Porcentaje de Asistencia"
    ];

    $titulo = isset($titulos[$datos->tipoInforme])
        ? $titulos[$datos->tipoInforme]
        : "Informe del Sistema";

    // ---- INICIO HTML ----
    $html = "
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0 25px;
                font-size: 12px;
            }

            header { 
                text-align: center;
                margin-bottom: 10px;
                color:{$verdeOscuro};
                text-size:30px;
            }

            .titlebox {
                background: {$verdeOscuro};
                color: white;
                padding: 12px;
                text-align: center;
                font-size: 20px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: {$verdeOscuro};
                margin: 15px 0 8px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 8px;
            }
            table th {
                background: {$verdeOscuro};
                color: white;
                padding: 6px;
                border: 1px solid {$verdeOscuro};
                font-size: 12px;
            }
            table td {
                padding: 6px;
                border: 1px solid #CCC;
                font-size: 12px;
            }
            .footer {
                position: fixed;
                bottom: 10px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 10px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <header> <h2> Retofit31- Football Players Training</h2> </header>

        <div class='titlebox'>{$titulo}</div>

                <p><b>Fecha de generación:</b> " . date('Y-m-d H:i') . "</p>

        <!-- INFORMACIÓN ESPECIAL PARA ASISTENCIA -->
    ";

    $informesAsistencia = ["asistencias", "inasistencias", "porcentaje"];

    if (in_array($datos->tipoInforme, $informesAsistencia)) {

        // Mostrar evento si viene desde Angular
        $html .= "
        <p><b>Tipo de informe:</b> {$datos->tipoInforme}</p>
        <p><b>ID del evento:</b> {$datos->evento}</p>
    ";

        // Mostrar rangos de fechas solo si fueron enviados
        if (!empty($datos->fechaInicio) && !empty($datos->fechaFin)) {
            $html .= "
            <p><b>Rango de fechas:</b> {$datos->fechaInicio} a {$datos->fechaFin}</p>
        ";
        }

        // Título de resultados
        $html .= "
        <div class='section-title'>Resultados:</div>
    ";

    } else {

        // Caso administrativo
        $html .= "
        <div class='section-title'>Resultados:</div>
    ";
    }

    // -------------------------
    // TABLAS SEGÚN INFORME
    // -------------------------

    // ▶ INFORMES ESTADÍSTICOS
    if (
        $datos->tipoInforme === "cantidad_estados" ||
        $datos->tipoInforme === "cantidad_sexos" ||
        $datos->tipoInforme === "cantidad_por_tipo_usuario"
    ) {

        $html .= "
        <table>
            <tr>
                <th>Descripción</th>
                <th>Valor</th>
            </tr>";

        foreach ($datos->datos as $item) {
            $html .= "
            <tr>
                <td>{$item->ETIQUETA}</td>
                <td>{$item->VALOR}</td>
            </tr>";
        }

        $html .= "</table>";
    }

    // ▶ INFORME DETALLADO DE USUARIOS
    if ($datos->tipoInforme === "listado_detallado") {

        $html .= "
        <table>
            <tr>
                <th>Identificación</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Sexo</th>
                <th>Estado</th>
                <th>Tipo</th>
            </tr>";

        foreach ($datos->datos as $item) {
            $html .= "
            <tr>
                <td>{$item->IDENTIFICACION}</td>
                <td>{$item->NOMBRES}</td>
                <td>{$item->APELLIDOS}</td>
                <td>{$item->SEXO}</td>
                <td>{$item->ESTADO}</td>
                <td>{$item->TIPO_USUARIO_NOMBRE}</td>
            </tr>";
        }

        $html .= "</table>";
    }

    // ▶ GRÁFICA (solo si viene)
    if (!empty($datos->grafica)) {
        $html .= "
            <div class='section-title'>Gráfica</div>
            <br><br>
            <img src='{$datos->grafica}' style='width:100%; margin-top:10px;'>
        ";
    }

    $html .= "
        <div class='footer'>
            Página {PAGE_NUM} de {PAGE_COUNT}
        </div>

    </body></html>";

    // Renderizar PDF
    $pdf->loadHtml($html);
    $pdf->setPaper('A4', 'vertical');
    $pdf->render();

    // Guardar archivo
    $nombrePDF = 'informe_' . time() . '.pdf';
    $rutaCarpeta = __DIR__ . '/../uploads/informes/';

    if (!file_exists($rutaCarpeta)) {
        mkdir($rutaCarpeta, 0777, true);
    }

    $rutaPDF = $rutaCarpeta . $nombrePDF;
    file_put_contents($rutaPDF, $pdf->output());

    $urlPDF = "http://localhost:8000/backend/uploads/informes/" . $nombrePDF;

    return [
        'resultado' => 'OK',
        'urlPDF' => $urlPDF,
        'rutaPDF' => $rutaPDF,
        'nombrePDF' => $nombrePDF,
        'FECHA_CREACION' => date('Y-m-d H:i:s')
    ];
}
