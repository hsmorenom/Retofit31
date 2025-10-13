<?php
ob_clean(); // ✅ Limpia cualquier salida anterior

require_once '../../conexion.php';
require_once '../../library/vendor/autoload.php';

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

try {
    $conexion = DB::conectar();

    // Buscar eventos que no tienen QR asignado
    $sqlSelect = "SELECT ID_EVENTOS, QR_DE_EVENTO 
                  FROM eventos 
                  WHERE QR_DE_EVENTO IS NULL 
                     OR QR_DE_EVENTO = '' 
                     OR QR_DE_EVENTO NOT LIKE '%.png'";
    $stmt = $conexion->prepare($sqlSelect);
    $stmt->execute();
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($eventos)) {
        echo "✅ Todos los eventos ya tienen su QR generado.";
        exit;
    }

    foreach ($eventos as $evento) {
        $idEvento = $evento['ID_EVENTOS'];

        // ✅ Aquí defines la URL que se codificará en el QR
        // Cambia 'localhost:8000' por tu dominio si lo subes a hosting
        $baseUrl = "http://localhost:8000/backend/api/asistencia/registrar.php";
        $qrTexto = "{$baseUrl}?id_evento={$idEvento}";

        // ✅ Configurar QR
        $options = new QROptions([
            'version'      => 5,
            'outputType'   => QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel'     => QRCode::ECC_L,
            'scale'        => 5,
            'imageBase64'  => false, // No queremos base64
        ]);

        // ✅ Generar QR en binario
        $qr = new QRCode($options);
        $imageData = $qr->render($qrTexto);

        // ✅ Validar que sea PNG real
        if (strpos($imageData, 'PNG') === false) {
            throw new Exception("GD no generó una imagen PNG válida. Verifica que la extensión GD esté habilitada en PHP.");
        }

        // ✅ Guardar QR
        $qrFilePath = __DIR__ . "/../../uploads/qr/qr_evento{$idEvento}.png";
        $qrUrl = "uploads/qr/qr_evento{$idEvento}.png";

        file_put_contents($qrFilePath, $imageData);

        // ✅ Actualizar base de datos
        $sqlUpdate = "UPDATE eventos SET QR_DE_EVENTO = :qr WHERE ID_EVENTOS = :id";
        $stmtUpdate = $conexion->prepare($sqlUpdate);
        $stmtUpdate->bindParam(':qr', $qrUrl);
        $stmtUpdate->bindParam(':id', $idEvento);
        $stmtUpdate->execute();

        echo "✅ QR generado correctamente para el evento ID $idEvento <br>";
    }

    echo "<br>🎉 Todos los QR fueron generados exitosamente.";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
