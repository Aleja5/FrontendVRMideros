import axios from "axios";
export const buscarProduccion = async (filtros) => {
    const params = new URLSearchParams(filtros).toString();
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/produccion/buscar-produccion?${params}`);
    return res.data;
};