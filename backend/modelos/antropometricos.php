<?php
require_once '../conexion.php';

class AntropometricosModelo
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
            a.ID_ANTROPOMETRICOS,
            c.IDENTIFICACION,
            TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
            TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
            a.PESO,
            a.ALTURA,
            a.PORCENTAJE_GRASA_CORPORAL,
            a.INDICE_DE_MASA_CORPORAL,
            a.CIRCUNFERENCIA_CUELLO,
            a.CIRCUNFERENCIA_CINTURA,
            a.CIRCUNFERENCIA_CADERA,
            a.FECHA_REGISTRO,
            a.USUARIO
        FROM antropometricos a
        INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
        INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
        WHERE u.TIPO_USUARIO = :tipo
        ORDER BY a.FECHA_REGISTRO DESC";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':tipo', $tipoUsuario);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function insertar($p)
    {
        try {
            $sql = "INSERT INTO antropometricos (
                    CLIENTE, PESO, ALTURA, PORCENTAJE_GRASA_CORPORAL, 
                    INDICE_DE_MASA_CORPORAL, CIRCUNFERENCIA_CUELLO,
                    CIRCUNFERENCIA_CINTURA, CIRCUNFERENCIA_CADERA, USUARIO
                ) VALUES (
                    :cliente, :peso, :altura, :pgc,
                    :imc, :cuello,
                    :cintura, :cadera, :usuario
                )";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $p->cliente);
            $stmt->bindParam(':peso', $p->peso);
            $stmt->bindParam(':altura', $p->altura);
            $stmt->bindParam(':pgc', $p->pgc);
            $stmt->bindParam(':imc', $p->imc);
            $stmt->bindParam(':cuello', $p->cuello);
            $stmt->bindParam(':cintura', $p->cintura);
            $stmt->bindParam(':cadera', $p->cadera);
            $stmt->bindParam(':usuario', $p->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Datos antropométricos insertados ✅'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM antropometricos WHERE id_antropometricos =:id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Datos antropométricos eliminados'];

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE antropometricos SET
                    PESO = :peso,
                    ALTURA = :altura,
                    PORCENTAJE_GRASA_CORPORAL = :pgc,
                    INDICE_DE_MASA_CORPORAL = :imc,
                    CIRCUNFERENCIA_CUELLO = :cuello,
                    CIRCUNFERENCIA_CINTURA = :cintura,
                    CIRCUNFERENCIA_CADERA = :cadera
                WHERE ID_ANTROPOMETRICOS = :id";

            $stmt = $this->conexion->prepare($sql);

            // 🧩 Vincular parámetros de manera segura
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':peso', $parametros->PESO);
            $stmt->bindParam(':altura', $parametros->ALTURA);
            $stmt->bindParam(':pgc', $parametros->PGC);
            $stmt->bindParam(':imc', $parametros->IMC);
            $stmt->bindParam(':cuello', $parametros->CUELLO);
            $stmt->bindParam(':cintura', $parametros->CINTURA);
            $stmt->bindParam(':cadera', $parametros->CADERA);

            $stmt->execute();

            // Verificar cuántas filas se afectaron
            if ($stmt->rowCount() > 0) {
                return ['resultado' => 'OK', 'mensaje' => 'Datos antropométricos actualizados correctamente'];
            } else {
                return ['resultado' => 'SIN_CAMBIOS', 'mensaje' => 'No se modificó ningún valor'];
            }

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }


    public function filtrarIdCliente($id_cliente)
    {
        try {
            $sql = "SELECT 
                    a.ID_ANTROPOMETRICOS,
                    c.IDENTIFICACION,
                    TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
                    TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
                    c.SEXO,
                    a.PESO,
                    a.ALTURA,
                    a.PORCENTAJE_GRASA_CORPORAL AS PGC,
                    a.INDICE_DE_MASA_CORPORAL AS IMC,
                    a.CIRCUNFERENCIA_CUELLO AS CUELLO,
                    a.CIRCUNFERENCIA_CINTURA AS CINTURA,
                    a.CIRCUNFERENCIA_CADERA AS CADERA,
                    a.FECHA_REGISTRO
                FROM antropometricos a
                INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
                INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
                WHERE c.ID_CLIENTE = :cliente
                ORDER BY a.FECHA_REGISTRO ASC";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $id_cliente);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    public function consultarInforme()
{
    try {
        $sql = "SELECT 
            a.ID_ANTROPOMETRICOS,
            a.CLIENTE,
            c.ID_CLIENTE,
            c.IDENTIFICACION,
            TRIM(CONCAT(u.PRIMER_NOMBRE, ' ', IFNULL(u.SEGUNDO_NOMBRE, ''))) AS NOMBRES,
            TRIM(CONCAT(u.PRIMER_APELLIDO, ' ', IFNULL(u.SEGUNDO_APELLIDO, ''))) AS APELLIDOS,
            c.SEXO,
            c.FECHA_NACIMIENTO,
            a.PESO,
            a.ALTURA,
            a.PORCENTAJE_GRASA_CORPORAL,
            a.INDICE_DE_MASA_CORPORAL,
            a.CIRCUNFERENCIA_CUELLO,
            a.CIRCUNFERENCIA_CINTURA,
            a.CIRCUNFERENCIA_CADERA,
            a.FECHA_REGISTRO,
            a.USUARIO
        FROM antropometricos a
        INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
        INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
        ORDER BY a.FECHA_REGISTRO DESC";

        $stmt = $this->conexion->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
    }
}




}


?>