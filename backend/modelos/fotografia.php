<?php
require_once '../conexion.php';

class FotografiaModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }

    // CONSULTAR TODAS LAS FOTOGRAFÍAS
    public function consultar()
    {
        try {
            $sql = "SELECT * FROM fotografia";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // INSERTAR UNA NUEVA FOTOGRAFÍA (3 fotos)
    public function insertar($parametros)
    {
        try {
            $sql = "INSERT INTO fotografia (
                        fecha_inicio,
                        fecha__final,
                        foto_frontal,
                        desc_frontal,
                        etiqueta_frontal,
                        foto_lateral,
                        desc_lateral,
                        etiqueta_lateral,
                        foto_posterior,
                        desc_posterior,
                        etiqueta_posterior,
                        imagen_url,
                        cliente,
                        usuario
                    ) VALUES (
                        :fecha_inicio,
                        :fecha_final,
                        :foto_frontal,
                        :desc_frontal,
                        :etiqueta_frontal,
                        :foto_lateral,
                        :desc_lateral,
                        :etiqueta_lateral,
                        :foto_posterior,
                        :desc_posterior,
                        :etiqueta_posterior,
                        :imagen_url,
                        :cliente,
                        :usuario
                    )";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_final', $parametros->fecha_final);
            $stmt->bindParam(':foto_frontal', $parametros->foto_frontal);
            $stmt->bindParam(':desc_frontal', $parametros->desc_frontal);
            $stmt->bindParam(':etiqueta_frontal', $parametros->etiqueta_frontal);
            $stmt->bindParam(':foto_lateral', $parametros->foto_lateral);
            $stmt->bindParam(':desc_lateral', $parametros->desc_lateral);
            $stmt->bindParam(':etiqueta_lateral', $parametros->etiqueta_lateral);
            $stmt->bindParam(':foto_posterior', $parametros->foto_posterior);
            $stmt->bindParam(':desc_posterior', $parametros->desc_posterior);
            $stmt->bindParam(':etiqueta_posterior', $parametros->etiqueta_posterior);
            $stmt->bindParam(':imagen_url', $parametros->imagen_url);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Fotografías registradas correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // ELIMINAR FOTOGRAFÍA
    public function eliminar($id)
    {
        try {
            $sql = "DELETE FROM fotografia WHERE id_fotografia = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Registro eliminado correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // EDITAR UN REGISTRO
    public function editar($id, $parametros)
    {
        try {
            $sql = "UPDATE fotografia SET
                        fecha_inicio = :fecha_inicio,
                        fecha__final = :fecha_final,
                        foto_frontal = :foto_frontal,
                        desc_frontal = :desc_frontal,
                        etiqueta_frontal = :etiqueta_frontal,
                        foto_lateral = :foto_lateral,
                        desc_lateral = :desc_lateral,
                        etiqueta_lateral = :etiqueta_lateral,
                        foto_posterior = :foto_posterior,
                        desc_posterior = :desc_posterior,
                        etiqueta_posterior = :etiqueta_posterior,
                        imagen_url = :imagen_url,
                        cliente = :cliente,
                        usuario = :usuario
                    WHERE id_fotografia = :id";

            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':fecha_inicio', $parametros->fecha_inicio);
            $stmt->bindParam(':fecha_final', $parametros->fecha_final);
            $stmt->bindParam(':foto_frontal', $parametros->foto_frontal);
            $stmt->bindParam(':desc_frontal', $parametros->desc_frontal);
            $stmt->bindParam(':etiqueta_frontal', $parametros->etiqueta_frontal);
            $stmt->bindParam(':foto_lateral', $parametros->foto_lateral);
            $stmt->bindParam(':desc_lateral', $parametros->desc_lateral);
            $stmt->bindParam(':etiqueta_lateral', $parametros->etiqueta_lateral);
            $stmt->bindParam(':foto_posterior', $parametros->foto_posterior);
            $stmt->bindParam(':desc_posterior', $parametros->desc_posterior);
            $stmt->bindParam(':etiqueta_posterior', $parametros->etiqueta_posterior);
            $stmt->bindParam(':imagen_url', $parametros->imagen_url);
            $stmt->bindParam(':cliente', $parametros->cliente);
            $stmt->bindParam(':usuario', $parametros->usuario);
            $stmt->execute();

            return ['resultado' => 'OK', 'mensaje' => 'Fotografías actualizadas correctamente'];
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }

    // FILTRAR FOTOGRAFÍAS POR CLIENTE
    public function filtrar($idCliente)
    {
        try {
            $sql = "SELECT * FROM fotografia WHERE cliente = :cliente";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':cliente', $idCliente);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }
}
?>
