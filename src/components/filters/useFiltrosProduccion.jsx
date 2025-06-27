// src/hooks/useFiltrosProduccion.js
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export const useFiltrosProduccion = (otiSeleccionada = null) => {
  const [oti, setOti] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [operariosFiltrados, setOperariosFiltrados] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [areasProduccion, setAreasProduccion] = useState([]);
  const [maquinas, setMaquinas] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [
          { data: otiData },
          { data: operariosData },
          { data: procesosData },
          { data: areasData },
          { data: maquinasData }
        ] = await Promise.all([
          axiosInstance.get("produccion/oti"),
          axiosInstance.get("produccion/operarios"),
          axiosInstance.get("produccion/procesos"),
          axiosInstance.get("produccion/areas"),
          axiosInstance.get("produccion/maquinas")
        ]);
        console.log("OTI Data:", otiData);
        console.log("Operarios Data:", operariosData);

        setOti(otiData);
        setOperarios(operariosData);
        setProcesos(procesosData);
        setAreasProduccion(areasData);
        setMaquinas(maquinasData);
      } catch (error) {
        console.error("Error al cargar datos de filtros:", error);
      }
    };

    cargarDatos();
  }, []);

  // Efecto para cargar operarios filtrados cuando se selecciona una OTI
  useEffect(() => {
    const cargarOperariosPorOti = async () => {
      if (otiSeleccionada) {
        try {
          console.log("Cargando operarios para OTI:", otiSeleccionada);
          const { data } = await axiosInstance.get(`produccion/operarios-por-oti/${otiSeleccionada}`);
          console.log("Operarios filtrados recibidos:", data);
          setOperariosFiltrados(data);
        } catch (error) {
          console.error("Error al cargar operarios por OTI:", error);
          setOperariosFiltrados([]);
        }
      } else {
        console.log("No hay OTI seleccionada, usando todos los operarios");
        setOperariosFiltrados(operarios);
      }
    };

    cargarOperariosPorOti();
  }, [otiSeleccionada, operarios]);

  return { 
    oti, 
    operarios: otiSeleccionada ? operariosFiltrados : operarios, 
    procesos, 
    areasProduccion, 
    maquinas 
  };
};
