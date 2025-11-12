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

    // COLORS RETROFIT 31
    $verdeOscuro = "#004D00";
    $verdeClaro = "#7CE54F";

    // LOGO (puede ser PNG o JPG)
    $logoUrl = "http://127.0.0.1:8000/backend/assets/images/logo_retofit-removebg-preview.jpg";
    // si aún no tienes logo, te lo dejo comentado
    // $logoUrl = "";

    // ---- HTML del PDF ----
    $html = "
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/>
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
                padding: 10px;
                text-align: center;
                font-size: 20px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: {$verdeOscuro};
                margin: 10px 0 5px;
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

        <header>
            <h2> Retofit31- Football Players Training</h2>
        </header>

        <div class='titlebox'>
            INFORME DE ASISTENCIA
        </div>

        <p><b>Tipo de informe:</b> {$datos->tipoInforme}</p>
        <p><b>Evento:</b> {$datos->evento}</p>
        <p><b>Rango de fechas:</b> {$datos->fechaInicio} a {$datos->fechaFin}</p>
        <p><b>Fecha de generación:</b> " . date('Y-m-d H:i') . "</p>

        <div class='section-title'>Resultados:</div>

        <table>
            <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Resultado</th>
            </tr>";

    foreach ($datos->datos as $item) {
        $html .= "
            <tr>
                <td>{$item->NOMBRES}</td>
                <td>{$item->APELLIDOS}</td>
                <td>{$item->RESULTADO}</td>
            </tr>";
    }

    $html .= "</table>";

    if (!empty($datos->grafica)) {
        $html .= "
            <div class='section-title'>Gráfica asociada</div>
            <br>
            <br>
            <br>
            <img src='{$datos->grafica}' style='width:100%; margin-top:10px;'>
        ";
    }

    $html .= "
        <div class='footer'>
            Página {PAGE_NUM} de {PAGE_COUNT}
        </div>

    </body>
    </html>";

    // Renderizar
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
