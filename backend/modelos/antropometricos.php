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
            a.USUARIO,
        FROM antropometricos a
        INNER JOIN cliente c ON a.CLIENTE = c.ID_CLIENTE
        INNER JOIN usuario u ON c.USUARIO = u.ID_USUARIO
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
                        cliente = :cliente,
                        peso = :peso,
                        altura = :altura,
                        porcentaje_grasa_corporal = :porcentaje_grasa_corporal,
                        indice_de_masa_corporal = :indice_de_masa_corporal,
                        circunferencia_cuello = :circunferencia_cuello,
                        circunferencia_cintura = :circunferencia_cintura,
                        circunferencia_cadera = :circunferencia_cadera,
                        usuario = :usuario
                    WHERE id_antropometricos = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':peso', $parametros->peso);
            $stmt->bindParam(':altura', $parametros->altura);
            $stmt->bindParam(':porcentaje_grasa_corporal', $parametros->porcentaje_grasa_corporal);
            $stmt->bindParam(':indice_de_masa_corporal', $parametros->indice_de_masa_corporal);
            $stmt->bindParam(':circunferencia_cuello', $parametros->circunferencia_cuello);
            $stmt->bindParam(':circunferencia_cintura', $parametros->circunferencia_cintura);
            $stmt->bindParam(':circunferencia_cadera', $parametros->circunferencia_cadera);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Datos antropométricos actualizados'];

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
                    u.PRIMER_NOMBRE,
                    u.SEGUNDO_NOMBRE,
                    u.PRIMER_APELLIDO,
                    u.SEGUNDO_APELLIDO,
                    u.SEXO,
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



}


?>