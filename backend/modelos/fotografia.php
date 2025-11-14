<?php
require_once '../conexion.php';

class FotografiaModelo
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = DB::conectar();
    }



    /* ============================================================
     *  CONSULTAR TODAS
     * ============================================================ */
    public function consultar()
    {
        try {
            $sql = "SELECT * FROM fotografia ORDER BY FECHA__REGISTRO DESC";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado' => 'ERROR', 'mensaje' => $e->getMessage()];
        }
    }



    /* ============================================================
     *  INSERTAR NUEVO REGISTRO (3 FOTOS)
     * ============================================================ */
    public function insertar($parametros)
    {
        try {

            if (!isset($_FILES['foto_frontal']) ||
                !isset($_FILES['foto_lateral']) ||
                !isset($_FILES['foto_posterior'])) {

                return ['resultado' => 'ERROR', 'mensaje' => 'No llegaron todas las fotografías'];
            }

            /* === Carpeta destino === */
            $ruta = "../uploads/fotografias/";
            if (!file_exists($ruta)) mkdir($ruta, 0777, true);

            /* === Datos === */
            $documento = $_POST['identificacion'];
            $fechaTxt  = date("d-m-Y");
            $fechaSQL  = date("Y-m-d");

            /* === Extensiones === */
            $extF = pathinfo($_FILES['foto_frontal']['name'], PATHINFO_EXTENSION);
            $extL = pathinfo($_FILES['foto_lateral']['name'], PATHINFO_EXTENSION);
            $extP = pathinfo($_FILES['foto_posterior']['name'], PATHINFO_EXTENSION);

            /* === Nombres de archivo === */
            $nombreFrontal   = "{$documento}_frontal_{$fechaTxt}.{$extF}";
            $nombreLateral   = "{$documento}_lateral_{$fechaTxt}.{$extL}";
            $nombrePosterior = "{$documento}_posterior_{$fechaTxt}.{$extP}";

            /* === Guardar archivos === */
            move_uploaded_file($_FILES['foto_frontal']['tmp_name'],   $ruta.$nombreFrontal);
            move_uploaded_file($_FILES['foto_lateral']['tmp_name'],   $ruta.$nombreLateral);
            move_uploaded_file($_FILES['foto_posterior']['tmp_name'], $ruta.$nombrePosterior);

            $urlF = "uploads/fotografias/".$nombreFrontal;
            $urlL = "uploads/fotografias/".$nombreLateral;
            $urlP = "uploads/fotografias/".$nombrePosterior;

            /* === SQL === */
            $sql = "INSERT INTO fotografia (
                        FECHA__REGISTRO,
                        URL_FOTO_FRONTAL, DESC_FRONTAL, ETIQUETA_FRONTAL,
                        URL_FOTO_LATERAL, DESC_LATERAL, ETIQUETA_LATERAL,
                        URL_FOTO_POSTERIOR, DESC_POSTERIOR, ETIQUETA_POSTERIOR,
                        CLIENTE
                    ) VALUES (
                        :fecha,
                        :uf, :df, :ef,
                        :ul, :dl, :el,
                        :up, :dp, :ep,
                        :cliente
                    )";

            $stmt = $this->conexion->prepare($sql);

            $stmt->execute([
                ':fecha'  => $fechaSQL,

                ':uf' => $urlF,
                ':df' => $parametros->desc_frontal,
                ':ef' => $parametros->etiqueta_frontal,

                ':ul' => $urlL,
                ':dl' => $parametros->desc_lateral,
                ':el' => $parametros->etiqueta_lateral,

                ':up' => $urlP,
                ':dp' => $parametros->desc_posterior,
                ':ep' => $parametros->etiqueta_posterior,

                ':cliente' => $parametros->cliente
            ]);

            return ['resultado' => 'OK'];

        } catch (PDOException $e) {
            return ['resultado'=>'ERROR','mensaje'=>$e->getMessage()];
        }
    }



    /* ============================================================
     *  EDITAR REGISTRO DEL DÍA
     * ============================================================ */
    public function editar($id, $param)
    {
        try {
            /* === Buscar registro actual === */
            $sql = "SELECT * FROM fotografia WHERE ID_FOTOGRAFIA = :id";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([':id'=>$id]);
            $foto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$foto)
                return ['resultado'=>'ERROR','mensaje'=>'Registro no encontrado'];

            /* Solo permitir si es HOY */
            if ($foto['FECHA__REGISTRO'] !== date("Y-m-d"))
                return ['resultado'=>'ERROR','mensaje'=>'Solo se pueden editar fotos del día'];

            $ruta = "../uploads/fotografias/";

            /* === Mantener nombres anteriores === */
            $frontal   = $foto['URL_FOTO_FRONTAL'];
            $lateral   = $foto['URL_FOTO_LATERAL'];
            $posterior = $foto['URL_FOTO_POSTERIOR'];

            /* === Reemplazar si vienen nuevas === */
            if (isset($_FILES['foto_frontal']) && $_FILES['foto_frontal']['size'] > 0) {
                $nuevo = time() . "_frontal_" . $_FILES['foto_frontal']['name'];
                move_uploaded_file($_FILES['foto_frontal']['tmp_name'], $ruta.$nuevo);
                $frontal = "uploads/fotografias/".$nuevo;
            }

            if (isset($_FILES['foto_lateral']) && $_FILES['foto_lateral']['size'] > 0) {
                $nuevo = time() . "_lateral_" . $_FILES['foto_lateral']['name'];
                move_uploaded_file($_FILES['foto_lateral']['tmp_name'], $ruta.$nuevo);
                $lateral = "uploads/fotografias/".$nuevo;
            }

            if (isset($_FILES['foto_posterior']) && $_FILES['foto_posterior']['size'] > 0) {
                $nuevo = time() . "_posterior_" . $_FILES['foto_posterior']['name'];
                move_uploaded_file($_FILES['foto_posterior']['tmp_name'], $ruta.$nuevo);
                $posterior = "uploads/fotografias/".$nuevo;
            }

            /* === Actualizar en SQL === */
            $sql = "UPDATE fotografia SET
                        URL_FOTO_FRONTAL = :f,
                        DESC_FRONTAL = :df,
                        ETIQUETA_FRONTAL = :ef,

                        URL_FOTO_LATERAL = :l,
                        DESC_LATERAL = :dl,
                        ETIQUETA_LATERAL = :el,

                        URL_FOTO_POSTERIOR = :p,
                        DESC_POSTERIOR = :dp,
                        ETIQUETA_POSTERIOR = :ep,

                        CLIENTE = :cliente
                    WHERE ID_FOTOGRAFIA = :id";

            $stmt = $this->conexion->prepare($sql);

            $stmt->execute([
                ':id' => $id,

                ':f' => $frontal,
                ':df' => $param->desc_frontal,
                ':ef' => $param->etiqueta_frontal,

                ':l' => $lateral,
                ':dl' => $param->desc_lateral,
                ':el' => $param->etiqueta_lateral,

                ':p' => $posterior,
                ':dp' => $param->desc_posterior,
                ':ep' => $param->etiqueta_posterior,

                ':cliente' => $param->cliente
            ]);

            return ['resultado'=>'OK'];

        } catch (PDOException $e) {
            return ['resultado'=>'ERROR','mensaje'=>$e->getMessage()];
        }
    }



    /* ============================================================
     *  FILTRAR POR CLIENTE
     * ============================================================ */
    public function filtrar($idCliente)
    {
        try {
            $sql = "SELECT * FROM fotografia WHERE CLIENTE = :c ORDER BY FECHA__REGISTRO DESC";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute([':c'=>$idCliente]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            return ['resultado'=>'ERROR','mensaje'=>$e->getMessage()];
        }
    }



    /* ============================================================
     *  OBTENER ÚLTIMAS 10 FECHAS
     * ============================================================ */
    public function obtenerFechasPorCliente($idCliente)
    {
        $sql = "SELECT FECHA__REGISTRO 
                FROM fotografia
                WHERE CLIENTE = ?
                GROUP BY FECHA__REGISTRO
                ORDER BY FECHA__REGISTRO DESC
                LIMIT 10";

        $stmt = $this->conexion->prepare($sql);
        $stmt->execute([$idCliente]);

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }



    /* ============================================================
     *  OBTENER FOTOS POR FECHA
     * ============================================================ */
    public function obtenerFotosPorFecha($idCliente, $fecha)
    {
        $sql = "SELECT *
                FROM fotografia
                WHERE CLIENTE = ?
                AND FECHA__REGISTRO = ?
                LIMIT 1";

        $stmt = $this->conexion->prepare($sql);
        $stmt->execute([$idCliente, $fecha]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }



    /* ============================================================
     *  GUARDAR OBSERVACIÓN
     * ============================================================ */
    public function guardarObservacion($data)
    {
        $sql = "UPDATE fotografia
                SET OBSERVACIONES = :obs
                WHERE ID_FOTOGRAFIA = :id";

        $stmt = $this->conexion->prepare($sql);

        $stmt->execute([
            ':obs' => $data['observacion'],
            ':id'  => $data['idFotografia']
        ]);

        return ['resultado'=>'OK'];
    }

}
?>
