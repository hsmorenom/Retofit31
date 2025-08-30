<?php
require_once '../conexion.php';
class ClienteModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    public function consultar()
    {
        try {
            $sql = "SELECT c.ID_CLIENTE,u.ID_USUARIO, tu.TIPO AS TIPO_USUARIO, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.EMAIL, u.CLAVE,u.ESTADO, c.TIPO_DOCUMENTO, c.IDENTIFICACION,   c.FECHA_NACIMIENTO, c.SEXO, c.FOTO_PERFIL_URL, c.DIRECCION, c.TELEFONO, c.CONTACTO_EMERGENCIA, c.TELEFONO_EMERGENCIA,ciu.ID_CIUDAD, ciu.NOMBRE AS CIUDAD, 
            
            CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, '')) AS NOMBRES,
            CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, '')) AS APELLIDOS

            FROM cliente c INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO LEFT JOIN tipo_usuario tu ON u.TIPO_USUARIO = tu.ID_TIPO_USUARIO LEFT JOIN ciudad ciu ON c.CIUDAD = ciu.ID_CIUDAD ";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO cliente (USUARIO,TIPO_DOCUMENTO,IDENTIFICACION,FECHA_NACIMIENTO  ,FOTO_PERFIL_URL  ,DIRECCION ,TELEFONO  ,CONTACTO_EMERGENCIA  ,TELEFONO_EMERGENCIA ,CIUDAD  ,SEXO ) VALUES (:usuario,:tipo_documento,:identificacion,:fecha_nacimiento,:foto_perfil_url,:direccion, :telefono, :contacto_emergencia, :telefono_emergencia, :ciudad, :sexo)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->bindParam(':tipo_documento', $parametros->tipo_documento);
            $stmt->bindParam(':identificacion', $parametros->identificacion);
            $stmt->bindParam(':fecha_nacimiento', $parametros->fecha_nacimiento);
            $stmt->bindParam(':foto_perfil_url', $parametros->foto_perfil_url);
            $stmt->bindParam(':direccion', $parametros->direccion);
            $stmt->bindParam(':telefono', $parametros->telefono);
            $stmt->bindParam(':contacto_emergencia', $parametros->contacto_emergencia);
            $stmt->bindParam(':telefono_emergencia', $parametros->telefono_emergencia);
            $stmt->bindParam(':ciudad', $parametros->ciudad);
            $stmt->bindParam(':sexo', $parametros->sexo);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Cliente guardado correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }


    }


    public function insertarClienteConUsuario($usuarioData, $clienteData)
    {
        try {
            // Iniciar transacción
            $this->conexion->beginTransaction();

            // 1️⃣ Preparar estado booleano (1 = activo, 0 = inactivo)
            $estado = isset($usuarioData->ESTADO) ? ($usuarioData->ESTADO ? 1 : 0) : 1;

            // 1. Insertar usuario
            $sqlUsuario = "INSERT INTO usuario (PRIMER_NOMBRE, SEGUNDO_NOMBRE, PRIMER_APELLIDO, SEGUNDO_APELLIDO, EMAIL, CLAVE, TIPO_USUARIO, ESTADO) 
                       VALUES (:primer_nombre, :segundo_nombre, :primer_apellido, :segundo_apellido, :email, :clave, :tipo_usuario, :estado)";
            $stmtUsuario = $this->conexion->prepare($sqlUsuario);

            $claveHash = password_hash($usuarioData->CLAVE, PASSWORD_DEFAULT);

            $stmtUsuario->execute([
                ':primer_nombre' => $usuarioData->PRIMER_NOMBRE,
                ':segundo_nombre' => $usuarioData->SEGUNDO_NOMBRE ?? null,
                ':primer_apellido' => $usuarioData->PRIMER_APELLIDO,
                ':segundo_apellido' => $usuarioData->SEGUNDO_APELLIDO ?? null,
                ':email' => $usuarioData->EMAIL,
                ':clave' => $claveHash,
                ':tipo_usuario' => $usuarioData->TIPO_USUARIO ?? 4, // usuario normal
                ':estado' => $estado      // activo
            ]);

            // ID del usuario recién creado
            $idUsuario = $this->conexion->lastInsertId();

            // 2. Insertar cliente
            $sqlCliente = "INSERT INTO cliente (USUARIO, TIPO_DOCUMENTO, IDENTIFICACION, FECHA_NACIMIENTO, FOTO_PERFIL_URL, DIRECCION, TELEFONO, CONTACTO_EMERGENCIA, TELEFONO_EMERGENCIA, CIUDAD, SEXO) 
                       VALUES (:usuario, :tipo_documento, :identificacion, :fecha_nacimiento, :foto_perfil_url, :direccion, :telefono, :contacto_emergencia, :telefono_emergencia, :ciudad, :sexo)";
            $stmtCliente = $this->conexion->prepare($sqlCliente);

            $stmtCliente->execute([
                ':usuario' => $idUsuario,
                ':tipo_documento' => $clienteData->TIPO_DOCUMENTO,
                ':identificacion' => $clienteData->IDENTIFICACION,
                ':fecha_nacimiento' => $clienteData->FECHA_NACIMIENTO,
                ':foto_perfil_url' => $clienteData->FOTO_PERFIL_URL ?? null,
                ':direccion' => $clienteData->DIRECCION ?? null,
                ':telefono' => $clienteData->TELEFONO ?? null,
                ':contacto_emergencia' => $clienteData->CONTACTO_EMERGENCIA ?? '',
                ':telefono_emergencia' => $clienteData->TELEFONO_EMERGENCIA ?? '',
                ':ciudad' => $clienteData->CIUDAD,
                ':sexo' => $clienteData->SEXO ?? '',
            ]);

            // Confirmar transacción
            $this->conexion->commit();

            return [
                'resultado' => 'OK',
                'mensaje' => 'Cliente y usuario creados correctamente',
                'id_usuario' => $idUsuario
            ];
        } catch (PDOException $e) {
            // Revertir cambios si algo falla
            $this->conexion->rollBack();
            return [
                'resultado' => 'ERROR',
                'mensaje' => $e->getMessage()
            ];
        }
    }


    public function eliminar($idUsuario)
    {
        try {
            // Iniciar transacción
            $this->conexion->beginTransaction();

            // 1️⃣ Obtener ID del cliente asociado al usuario
            $sqlGetCliente = "SELECT ID_CLIENTE FROM cliente WHERE USUARIO = :id";
            $stmtGetCliente = $this->conexion->prepare($sqlGetCliente);
            $stmtGetCliente->bindParam(':id', $idUsuario);
            $stmtGetCliente->execute();
            $cliente = $stmtGetCliente->fetch(PDO::FETCH_ASSOC);

            if ($cliente) {
                $idCliente = $cliente['ID_CLIENTE'];

                // 2️⃣ Eliminar datos relacionados con el cliente en orden correcto

                // Asistencia
                $sqlAsistencia = "DELETE FROM asistencia WHERE CLIENTE = :idCliente";
                $stmtAsistencia = $this->conexion->prepare($sqlAsistencia);
                $stmtAsistencia->bindParam(':idCliente', $idCliente);
                $stmtAsistencia->execute();

                // Suscripciones y pagos
                $sqlGetSuscripciones = "SELECT ID_SUSCRIPCIONES FROM suscripciones WHERE CLIENTE = :idCliente";
                $stmtGetSuscripciones = $this->conexion->prepare($sqlGetSuscripciones);
                $stmtGetSuscripciones->bindParam(':idCliente', $idCliente);
                $stmtGetSuscripciones->execute();
                $suscripciones = $stmtGetSuscripciones->fetchAll(PDO::FETCH_ASSOC);

                foreach ($suscripciones as $suscripcion) {
                    $sqlPagos = "DELETE FROM pago WHERE SUSCRIPCION = :idSuscripcion";
                    $stmtPagos = $this->conexion->prepare($sqlPagos);
                    $stmtPagos->bindParam(':idSuscripcion', $suscripcion['ID_SUSCRIPCIONES']);
                    $stmtPagos->execute();
                }

                $sqlSuscripciones = "DELETE FROM suscripciones WHERE CLIENTE = :idCliente";
                $stmtSuscripciones = $this->conexion->prepare($sqlSuscripciones);
                $stmtSuscripciones->bindParam(':idCliente', $idCliente);
                $stmtSuscripciones->execute();

                // Antropométricos
                $sqlAntropometricos = "DELETE FROM antropometricos WHERE USUARIO = :idUsuario";
                $stmtAntropometricos = $this->conexion->prepare($sqlAntropometricos);
                $stmtAntropometricos->bindParam(':idUsuario', $idUsuario);
                $stmtAntropometricos->execute();

                // Fotografías
                $sqlGetFotos = "SELECT ID_FOTOGRAFIA FROM fotografia WHERE CLIENTE = :idCliente";
                $stmtGetFotos = $this->conexion->prepare($sqlGetFotos);
                $stmtGetFotos->bindParam(':idCliente', $idCliente);
                $stmtGetFotos->execute();
                $fotos = $stmtGetFotos->fetchAll(PDO::FETCH_ASSOC);

                foreach ($fotos as $foto) {
                    // Plan alimenticio y sus relaciones
                    $sqlPlanAlim = "DELETE FROM plan_alimenticio WHERE FOTOGRAFIA = :idFoto";
                    $stmtPlanAlim = $this->conexion->prepare($sqlPlanAlim);
                    $stmtPlanAlim->bindParam(':idFoto', $foto['ID_FOTOGRAFIA']);
                    $stmtPlanAlim->execute();

                    // Objetivos, preferencias y restricciones se eliminan por cascada al eliminar plan_alimenticio
                }

                $sqlFotos = "DELETE FROM fotografia WHERE CLIENTE = :idCliente";
                $stmtFotos = $this->conexion->prepare($sqlFotos);
                $stmtFotos->bindParam(':idCliente', $idCliente);
                $stmtFotos->execute();

                // Informes
                $sqlGetInformes = "SELECT ID_INFORME FROM informe WHERE CLIENTE = :idCliente";
                $stmtGetInformes = $this->conexion->prepare($sqlGetInformes);
                $stmtGetInformes->bindParam(':idCliente', $idCliente);
                $stmtGetInformes->execute();
                $informes = $stmtGetInformes->fetchAll(PDO::FETCH_ASSOC);

                foreach ($informes as $informe) {
                    $sqlEntidadInf = "DELETE FROM entidad_informe WHERE INFORME = :idInforme";
                    $stmtEntidadInf = $this->conexion->prepare($sqlEntidadInf);
                    $stmtEntidadInf->bindParam(':idInforme', $informe['ID_INFORME']);
                    $stmtEntidadInf->execute();
                }

                $sqlInformes = "DELETE FROM informe WHERE CLIENTE = :idCliente";
                $stmtInformes = $this->conexion->prepare($sqlInformes);
                $stmtInformes->bindParam(':idCliente', $idCliente);
                $stmtInformes->execute();

                // 3️⃣ Eliminar cliente
                $sqlCliente = "DELETE FROM cliente WHERE ID_CLIENTE = :idCliente";
                $stmtCliente = $this->conexion->prepare($sqlCliente);
                $stmtCliente->bindParam(':idCliente', $idCliente);
                $stmtCliente->execute();
            }

            // 4️⃣ Eliminar usuario
            $sqlUsuario = "DELETE FROM usuario WHERE ID_USUARIO = :id";
            $stmtUsuario = $this->conexion->prepare($sqlUsuario);
            $stmtUsuario->bindParam(':id', $idUsuario);
            $stmtUsuario->execute();

            // Confirmar transacción
            $this->conexion->commit();

            return ['resultado' => 'OK', 'mensaje' => 'Usuario, cliente y todos los datos relacionados eliminados correctamente'];
        } catch (PDOException $e) {
            // Revertir transacción en caso de error
            $this->conexion->rollBack();
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {

            $parametros = array_change_key_case($parametros, CASE_LOWER);
            $set = [];
            $params = [':id' => $id];

            if (isset($parametros['usuario'])) {
                $set[] = "USUARIO = :usuario";
                $params[':usuario'] = $parametros['usuario'];
            }
            if (isset($parametros['tipo_documento'])) {
                $set[] = "TIPO_DOCUMENTO = :tipo_documento";
                $params[':tipo_documento'] = $parametros['tipo_documento'];
            }
            if (isset($parametros['identificacion'])) {
                $set[] = "IDENTIFICACION = :identificacion";
                $params[':identificacion'] = $parametros['identificacion'];
            }
            if (isset($parametros['fecha_nacimiento'])) {
                $set[] = "FECHA_NACIMIENTO = :fecha_nacimiento";
                $params[':fecha_nacimiento'] = $parametros['fecha_nacimiento'];
            }
            if (isset($parametros['foto_perfil_url'])) {
                $set[] = "FOTO_PERFIL_URL = :foto_perfil_url";
                $params[':foto_perfil_url'] = $parametros['foto_perfil_url'];
            }
            if (isset($parametros['direccion'])) {
                $set[] = "DIRECCION = :direccion";
                $params[':direccion'] = $parametros['direccion'];
            }
            if (isset($parametros['telefono'])) {
                $set[] = "TELEFONO = :telefono";
                $params[':telefono'] = $parametros['telefono'];
            }
            if (isset($parametros['contacto_emergencia'])) {
                $set[] = "CONTACTO_EMERGENCIA = :contacto_emergencia";
                $params[':contacto_emergencia'] = $parametros['contacto_emergencia'];
            }
            if (isset($parametros['telefono_emergencia'])) {
                $set[] = "TELEFONO_EMERGENCIA = :telefono_emergencia";
                $params[':telefono_emergencia'] = $parametros['telefono_emergencia'];
            }
            if (isset($parametros['ciudad'])) {
                $set[] = "CIUDAD = :ciudad";
                $params[':ciudad'] = $parametros['ciudad'];
            }
            if (isset($parametros['sexo'])) {
                $set[] = "SEXO = :sexo";
                $params[':sexo'] = $parametros['sexo'];
            }

            if (empty($set)) {
                http_response_code(400);
                echo json_encode([
                    'resultado' => 'ERROR',
                    'mensaje' => 'No se enviaron campos para actualizar'
                ]);
                exit;
            }

            $sql = "UPDATE cliente SET " . implode(", ", $set) . " WHERE ID_CLIENTE = :id";
            $stmt = $this->conexion->prepare($sql);

            if (!$stmt->execute($params)) {
                $errorInfo = $stmt->errorInfo();
                http_response_code(500);
                echo json_encode([
                    'resultado' => 'ERROR',
                    'mensaje' => $errorInfo[2],
                    'sql' => $sql,
                    'params' => $params
                ]);
                exit;
            }

            return [
                'resultado' => 'OK',
                'mensaje' => 'Cliente actualizado correctamente',
                'sql' => $sql,
                'params' => $params
            ];

        } catch (PDOException $e) {
            http_response_code(500);
            return [
                'resultado' => 'ERROR',
                'mensaje' => $e->getMessage()
            ];
        }
    }





    public function filtrarPorId($id_cliente)
    {
        try {
            $sql = "SELECT c.ID_CLIENTE,u.ID_USUARIO, tu.TIPO AS TIPO_USUARIO, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.EMAIL, u.CLAVE,u.ESTADO, c.TIPO_DOCUMENTO, c.IDENTIFICACION,   c.FECHA_NACIMIENTO, c.SEXO, c.FOTO_PERFIL_URL, c.DIRECCION, c.TELEFONO, c.CONTACTO_EMERGENCIA, c.TELEFONO_EMERGENCIA, ciu.ID_CIUDAD,  ciu.NOMBRE AS CIUDAD ,ciu.DEPARTAMENTO AS ID_DEPARTAMENTO, d.NOMBRE AS NOMBRE_DEPARTAMENTO FROM cliente c INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO LEFT JOIN tipo_usuario tu ON u.TIPO_USUARIO = tu.ID_TIPO_USUARIO LEFT JOIN ciudad ciu ON c.CIUDAD = ciu.ID_CIUDAD JOIN departamento d ON d.ID_DEPARTAMENTO = ciu.DEPARTAMENTO WHERE c.ID_CLIENTE =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id_cliente);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }

    }

    // Funcion de saul

    public function obtenerClientePorUsuario($id_usuario)
    {
        $sql = "SELECT 
                c.ID_CLIENTE, c.TIPO_DOCUMENTO, c.IDENTIFICACION, c.FECHA_NACIMIENTO,
                c.FOTO_PERFIL_URL, c.DIRECCION, c.TELEFONO, c.CONTACTO_EMERGENCIA,
                c.TELEFONO_EMERGENCIA, ci.NOMBRE AS CIUDAD,
                u.ID_USUARIO, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,
                u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.EMAIL,
                tu.TIPO AS TIPO_USUARIO
            FROM cliente c
            INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
            INNER JOIN ciudad ci ON c.CIUDAD = ci.ID_CIUDAD
            INNER JOIN tipo_usuario tu ON u.TIPO_USUARIO = tu.ID_TIPO_USUARIO
            WHERE u.ID_USUARIO = :id_usuario";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function consultarParaAdmon()
    {
        try {
            $sql = "SELECT 
    C.ID_CLIENTE,
    C.TIPO_DOCUMENTO,
    C.IDENTIFICACION,
    C.FECHA_NACIMIENTO,
    C.FOTO_PERFIL_URL,
    C.DIRECCION,
    C.TELEFONO,
    C.CONTACTO_EMERGENCIA,
    C.TELEFONO_EMERGENCIA,
    C.CIUDAD,
    C.SEXO,
    
    U.ID_USUARIO,
    U.TIPO_USUARIO,
    U.PRIMER_NOMBRE,
    U.SEGUNDO_NOMBRE,
    U.PRIMER_APELLIDO,
    U.SEGUNDO_APELLIDO,
    U.EMAIL,
    U.CLAVE,
    U.ESTADO,
    
    CONCAT(U.PRIMER_NOMBRE, ' ', IFNULL(U.SEGUNDO_NOMBRE, '')) AS NOMBRES,
    CONCAT(U.PRIMER_APELLIDO, ' ', IFNULL(U.SEGUNDO_APELLIDO, '')) AS APELLIDOS FROM cliente C LEFT JOIN usuario U ON C.USUARIO = U.ID_USUARIO;";

            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editarParaAdmon($idCliente, $parametros)
    {
        try {
            $this->conexion->beginTransaction();

            // ============================
            // ACTUALIZAR TABLA CLIENTE
            // ============================
            $setCliente = [];
            $paramsCliente = [':idCliente' => $idCliente];

            $camposCliente = [
                'tipo_documento',
                'identificacion',
                'fecha_nacimiento',
                'foto_perfil_url',
                'direccion',
                'telefono',
                'contacto_emergencia',
                'telefono_emergencia',
                'ciudad',
                'sexo'
            ];

            foreach ($camposCliente as $campo) {
                if (isset($parametros[$campo])) {
                    $setCliente[] = strtoupper($campo) . " = :$campo";
                    $paramsCliente[":$campo"] = $parametros[$campo];
                }
            }

            if (!empty($setCliente)) {
                $sqlCliente = "UPDATE cliente 
                           SET " . implode(", ", $setCliente) . " 
                           WHERE ID_CLIENTE = :idCliente";
                $stmtCliente = $this->conexion->prepare($sqlCliente);
                $stmtCliente->execute($paramsCliente);
            }

            // ============================
            // OBTENER USUARIO RELACIONADO
            // ============================
            $stmt = $this->conexion->prepare("SELECT USUARIO AS ID_USUARIO FROM cliente WHERE ID_CLIENTE = :idCliente");
            $stmt->execute([':idCliente' => $idCliente]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                $this->conexion->rollBack();
                return ['resultado' => 'ERROR', 'mensaje' => 'Cliente no encontrado'];
            }

            $idUsuario = $row['ID_USUARIO'];

            // ============================
            // ACTUALIZAR TABLA USUARIO
            // ============================
            $setUsuario = [];
            $paramsUsuario = [':idUsuario' => $idUsuario];

            $camposUsuario = [
                'tipo_usuario',
                'primer_nombre',
                'segundo_nombre',
                'primer_apellido',
                'segundo_apellido',
                'email'
            ];

            foreach ($camposUsuario as $campo) {
                if (isset($parametros[$campo])) {
                    $setUsuario[] = strtoupper($campo) . " = :$campo";
                    $paramsUsuario[":$campo"] = $parametros[$campo];
                }
            }

            // CLAVE
            if (isset($parametros['clave']) && $parametros['clave'] !== '') {
                $setUsuario[] = "CLAVE = :clave";
                $paramsUsuario[':clave'] = password_hash($parametros['clave'], PASSWORD_BCRYPT);
            }

            // ESTADO
            if (isset($parametros['estado'])) {
                $estado = strtolower($parametros['estado']) === 'activo' ? 1 : 0;
                $setUsuario[] = "ESTADO = :estado";
                $paramsUsuario[':estado'] = $estado;
            }

            if (!empty($setUsuario)) {
                $sqlUsuario = "UPDATE usuario 
                           SET " . implode(", ", $setUsuario) . " 
                           WHERE ID_USUARIO = :idUsuario";
                $stmtUsuario = $this->conexion->prepare($sqlUsuario);
                $stmtUsuario->execute($paramsUsuario);
            }

            $this->conexion->commit();
            return ['resultado' => 'OK', 'mensaje' => 'Cliente y usuario actualizados'];

        } catch (PDOException $e) {
            $this->conexion->rollBack();
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function insertarParaAdmon($parametros)
{
    try {
        $this->conexion->beginTransaction();

        // ==============================
        // MAPEAR CAMPOS OBLIGATORIOS
        // ==============================

        $parametros = (array) $parametros;

        $tipo_usuario      = $parametros['TIPO_USUARIO'] ?? $parametros['tipo_usuario'] ?? null;
        $primer_nombre     = $parametros['PRIMER_NOMBRE'] ?? $parametros['primer_nombre'] ?? null;
        $segundo_nombre    = $parametros['SEGUNDO_NOMBRE'] ?? $parametros['segundo_nombre'] ?? '';
        $primer_apellido   = $parametros['PRIMER_APELLIDO'] ?? $parametros['primer_apellido'] ?? null;
        $segundo_apellido  = $parametros['SEGUNDO_APELLIDO'] ?? $parametros['segundo_apellido'] ?? '';
        $email             = $parametros['EMAIL'] ?? $parametros['email'] ?? null;
        $clave             = $parametros['CLAVE'] ?? $parametros['CONTRASENA'] ?? $parametros['clave'] ?? null;
        $fecha_nacimiento  = $parametros['FECHA_NACIMIENTO'] ?? $parametros['fecha_nacimiento'] ?? null;
        $direccion         = $parametros['DIRECCION'] ?? $parametros['direccion'] ?? '';
        $telefono          = $parametros['TELEFONO'] ?? $parametros['telefono'] ?? '';
        $ciudad            = $parametros['CIUDAD'] ?? $parametros['ciudad'] ?? '';
        $estado            = isset($parametros['ESTADO']) ? (int)$parametros['ESTADO'] : 1;

        // Validación simple de campos obligatorios
        if (!$tipo_usuario || !$primer_nombre || !$primer_apellido || !$email || !$clave) {
            return ['resultado' => 'ERROR', 'mensaje' => 'Campos obligatorios no completados'];
        }

        // ==============================
        // VERIFICAR DUPLICADO DE EMAIL
        // ==============================
        $stmtEmail = $this->conexion->prepare("SELECT ID_USUARIO FROM usuario WHERE EMAIL = :email");
        $stmtEmail->execute([':email' => $email]);
        if ($stmtEmail->fetch()) {
            return ['resultado' => 'ERROR', 'mensaje' => 'El correo electrónico ya está registrado'];
        }

        // ==============================
        // INSERTAR EN USUARIO
        // ==============================
        $sqlUsuario = "INSERT INTO usuario 
            (TIPO_USUARIO, PRIMER_NOMBRE, SEGUNDO_NOMBRE, PRIMER_APELLIDO, SEGUNDO_APELLIDO, EMAIL, CLAVE, ESTADO)
            VALUES
            (:tipo_usuario, :primer_nombre, :segundo_nombre, :primer_apellido, :segundo_apellido, :email, :clave, :estado)";

        $claveHash = password_hash($clave, PASSWORD_DEFAULT);


        $stmtUsuario = $this->conexion->prepare($sqlUsuario);
        $stmtUsuario->bindParam(':tipo_usuario', $tipo_usuario, PDO::PARAM_INT);
        $stmtUsuario->bindParam(':primer_nombre', $primer_nombre);
        $stmtUsuario->bindParam(':segundo_nombre', $segundo_nombre);
        $stmtUsuario->bindParam(':primer_apellido', $primer_apellido);
        $stmtUsuario->bindParam(':segundo_apellido', $segundo_apellido);
        $stmtUsuario->bindParam(':email', $email);
        $stmtUsuario->bindParam(':clave', $claveHash);
        $stmtUsuario->bindParam(':estado', $estado);

        $stmtUsuario->execute();
        $ultimoUsuarioId = $this->conexion->lastInsertId();

        // ==============================
        // PREPARAR CAMPOS DE CLIENTE
        // ==============================
        $tipo_documento      = $parametros['TIPO_DOCUMENTO'] ?? $parametros['tipo_documento'] ?? 'N/A';
        $contacto_emergencia = $parametros['CONTACTO_EMERGENCIA'] ?? $parametros['contacto_emergencia'] ?? 'N/A';
        $telefono_emergencia = $parametros['TELEFONO_EMERGENCIA'] ?? $parametros['telefono_emergencia'] ?? 'N/A';
        $sexo                = $parametros['SEXO'] ?? $parametros['sexo'] ?? 'N/A';
        $foto_perfil_url     = $parametros['FOTO_PERFIL_URL'] ?? $parametros['foto_perfil_url'] ?? null;

        // ==============================
        // GENERAR IDENTIFICACION AUTOMÁTICA ALEATORIA SIN DUPLICADOS
        // ==============================
        if (!isset($parametros['IDENTIFICACION']) || $parametros['IDENTIFICACION'] == 0) {
            $maxIntentos = 1000; // evitar bucles infinitos
            $intentos = 0;
            do {
                // Generar número aleatorio de 7 dígitos
                $identificacion = str_pad(rand(1, 9999999), 7, '0', STR_PAD_LEFT);

                // Verificar que no exista
                $stmtCheck = $this->conexion->prepare("SELECT ID_CLIENTE FROM cliente WHERE IDENTIFICACION = :identificacion");
                $stmtCheck->execute([':identificacion' => $identificacion]);
                $existe = $stmtCheck->fetch();

                $intentos++;
                if ($intentos >= $maxIntentos) {
                    throw new Exception("No se pudo generar un identificador único después de $maxIntentos intentos");
                }
            } while ($existe);
        } else {
            $identificacion = $parametros['IDENTIFICACION'];
        }


        // ==============================
        // INSERTAR EN CLIENTE
        // ==============================
        $sqlCliente = "INSERT INTO cliente 
            (USUARIO, TIPO_DOCUMENTO, IDENTIFICACION, FECHA_NACIMIENTO, FOTO_PERFIL_URL, DIRECCION, TELEFONO, CONTACTO_EMERGENCIA, TELEFONO_EMERGENCIA, CIUDAD, SEXO)
            VALUES
            (:usuario, :tipo_documento, :identificacion, :fecha_nacimiento, :foto_perfil_url, :direccion, :telefono, :contacto_emergencia, :telefono_emergencia, :ciudad, :sexo)";

        $stmtCliente = $this->conexion->prepare($sqlCliente);
        $stmtCliente->bindParam(':usuario', $ultimoUsuarioId, PDO::PARAM_INT);
        $stmtCliente->bindParam(':tipo_documento', $tipo_documento);
        $stmtCliente->bindParam(':identificacion', $identificacion);
        $stmtCliente->bindParam(':fecha_nacimiento', $fecha_nacimiento);
        $stmtCliente->bindParam(':foto_perfil_url', $foto_perfil_url);
        $stmtCliente->bindParam(':direccion', $direccion);
        $stmtCliente->bindParam(':telefono', $telefono);
        $stmtCliente->bindParam(':contacto_emergencia', $contacto_emergencia);
        $stmtCliente->bindParam(':telefono_emergencia', $telefono_emergencia);
        $stmtCliente->bindParam(':ciudad', $ciudad);
        $stmtCliente->bindParam(':sexo', $sexo);

        $stmtCliente->execute();

        $this->conexion->commit();
        return ['resultado' => 'OK', 'mensaje' => 'Usuario y cliente guardados correctamente'];

    } catch (PDOException $e) {
        $this->conexion->rollBack();
        return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
    }
}
}




