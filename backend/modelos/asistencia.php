<?php
require_once '../conexion.php';

class AsistenciaModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar($tipoUsuario = 4)
    {
        try {
            $sql = "SELECT 
            a.ID_ASISTENCIA,
            c.IDENTIFICACION,
            TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
            TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
            e.NOMBRE_EVENTO,
            e.FECHA_ACTIVIDAD,
            a.NOTIFICACION,
            a.FECHA_ASISTENCIA
        FROM asistencia a
        INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
        INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
        INNER JOIN eventos e ON a.EVENTO = e.ID_EVENTOS
        WHERE u.TIPO_USUARIO = :tipo
        ORDER BY e.FECHA_ACTIVIDAD DESC";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':tipo', $tipoUsuario);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO asistencia (cliente,evento,notificacion) VALUES (:cliente,:evento,:notificacion)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':notificacion', $parametros->notificacion);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia insertado'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM asistencia WHERE ID_ASISTENCIA = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia eliminada correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE asistencia SET cliente=:cliente, qr=:qr, evento=:evento, notificacion=:notificacion WHERE id_asistencia=:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':evento', $parametros->evento);
            $stmt->bindParam(':notificacion', $parametros->notificacion);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Asistencia actualizados'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function filtrarIdentificacion($identificacion)
    {
        try {
            $sql = "SELECT 
            a.ID_ASISTENCIA,
            c.IDENTIFICACION,
            TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
            TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
            e.NOMBRE_EVENTO,
            e.FECHA_ACTIVIDAD,
            a.NOTIFICACION
        FROM asistencia a
        INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
        INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
        INNER JOIN eventos e ON a.EVENTO = e.ID_EVENTOS
        WHERE u.TIPO_USUARIO = 4 
          AND c.IDENTIFICACION = :identificacion
        ORDER BY e.FECHA_ACTIVIDAD DESC";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':identificacion', $identificacion);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function registrarPorQR($id_evento, $id_cliente)
    {
        try {
            // 📅 Obtener fecha y hora del evento
            $sqlEvento = "SELECT FECHA_ACTIVIDAD, HORA_INICIO, HORA_FIN 
                      FROM eventos 
                      WHERE ID_EVENTOS = :evento";
            $stmtEvento = $this->conexion->prepare($sqlEvento);
            $stmtEvento->bindParam(':evento', $id_evento);
            $stmtEvento->execute();
            $evento = $stmtEvento->fetch(PDO::FETCH_ASSOC);

            if (!$evento) {
                return ['resultado' => 'ERROR', 'mensaje' => 'El evento no existe.'];
            }

            // 🔧 Establecer zona horaria Colombia
            $zona = new DateTimeZone('America/Bogota');

            $fechaActual = new DateTime('now', $zona);
            $fechaEvento = new DateTime($evento['FECHA_ACTIVIDAD'] . ' ' . $evento['HORA_INICIO'], $zona);
            $fechaFinEvento = new DateTime($evento['FECHA_ACTIVIDAD'] . ' ' . $evento['HORA_FIN'], $zona);

            // 🕒 Comparaciones con hora local
            if ($fechaActual < $fechaEvento) {
                return [
                    'resultado' => 'PENDIENTE',
                    'mensaje' => 'El evento aún no ha comenzado. Intenta más tarde.'
                ];
            }

            if ($fechaActual > $fechaFinEvento) {
                return [
                    'resultado' => 'FINALIZADO',
                    'mensaje' => 'El evento ya finalizó. No se puede registrar asistencia.'
                ];
            }

            // 🧩 Validar que el usuario sea tipo 4 (cliente)
            $sqlTipo = "SELECT u.TIPO_USUARIO 
                    FROM cliente c
                    INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
                    WHERE c.ID_CLIENTE = :cliente";
            $stmtTipo = $this->conexion->prepare($sqlTipo);
            $stmtTipo->bindParam(':cliente', $id_cliente);
            $stmtTipo->execute();
            $tipoUsuario = $stmtTipo->fetchColumn();

            if (!$tipoUsuario || (int) $tipoUsuario !== 4) {
                return [
                    'resultado' => 'NO_CLIENTE',
                    'mensaje' => 'Solo los usuarios tipo cliente pueden registrar asistencia.'
                ];
            }

            // ⚙️ Verificar duplicados
            $sqlCheck = "SELECT COUNT(*) FROM asistencia WHERE cliente = :cliente AND evento = :evento";
            $stmtCheck = $this->conexion->prepare($sqlCheck);
            $stmtCheck->bindParam(':cliente', $id_cliente);
            $stmtCheck->bindParam(':evento', $id_evento);
            $stmtCheck->execute();

            if ($stmtCheck->fetchColumn() > 0) {
                return [
                    'resultado' => 'DUPLICADO',
                    'mensaje' => 'Ya se registró la asistencia para este evento.'
                ];
            }

            // ✅ Registrar asistencia
            $sqlInsert = "INSERT INTO asistencia (cliente, evento, notificacion)
                      VALUES (:cliente, :evento, :notificacion)";
            $stmtInsert = $this->conexion->prepare($sqlInsert);
            $notificacion = "Asistencia registrada automáticamente mediante QR.";
            $stmtInsert->bindParam(':cliente', $id_cliente);
            $stmtInsert->bindParam(':evento', $id_evento);
            $stmtInsert->bindParam(':notificacion', $notificacion);
            $stmtInsert->execute();

            return [
                'resultado' => 'OK',
                'mensaje' => 'Asistencia registrada correctamente.'
            ];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function resumenEvento($id_evento)
    {
        try {
            // 1. Obtener los que debían asistir (recordatorio)
            $sqlProgramados = "SELECT c.ID_CLIENTE, c.IDENTIFICACION, 
            TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
            TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
            c.SEXO, c.FECHA_NACIMIENTO,e.FECHA_ACTIVIDAD,e.NOMBRE_EVENTO
                           FROM recordatorio r
                           INNER JOIN eventos e ON r.EVENTO = e.ID_EVENTOS
                           INNER JOIN cliente c ON r.CLIENTE = c.ID_CLIENTE
                           INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
                           WHERE r.EVENTO = :evento";

            $stmt1 = $this->conexion->prepare($sqlProgramados);
            $stmt1->bindParam(':evento', $id_evento);
            $stmt1->execute();
            $programados = $stmt1->fetchAll(PDO::FETCH_ASSOC);

            // 2. Obtener los que asistieron
            $sqlAsistieron = "SELECT CLIENTE FROM asistencia WHERE EVENTO = :evento";
            $stmt2 = $this->conexion->prepare($sqlAsistieron);
            $stmt2->bindParam(':evento', $id_evento);
            $stmt2->execute();
            $asistieron = $stmt2->fetchAll(PDO::FETCH_COLUMN);

            // 3. Separar asistencia e inasistencia
            $asistencias = [];
            $inasistencias = [];

            foreach ($programados as $p) {
                if (in_array($p['ID_CLIENTE'], $asistieron)) {
                    $asistencias[] = $p;
                } else {
                    $inasistencias[] = $p;
                }
            }

            return [
                'programados' => $programados,
                'asistencias' => $asistencias,
                'inasistencias' => $inasistencias
            ];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }






}


?>