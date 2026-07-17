import { ref } from 'vue';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

export function useTaquilla() {
    // Estados reactivos
    const funciones = ref([]);
    const asientos = ref([]);
    const clientes = ref([]);
    const tiposPago = ref([]);
    const cargando = ref(false);
    const error = ref(null);

    // Método para traer la cartelera
    const cargarFunciones = async () => {
        cargando.value = true;
        error.value = null;
        try {
            const { data } = await api.get('/funciones');
            funciones.value = data;
        } catch (err) {
            console.error(err);
            error.value = 'Error al cargar la cartelera. Verifica que el backend esté encendido.';
        } finally {
            cargando.value = false;
        }
    };

    // Método para traer el mapa de asientos de una función
    const cargarAsientos = async (idFuncion) => {
        cargando.value = true;
        error.value = null;
        try {
            const { data } = await api.get(`/funciones/${idFuncion}/asientos`);
            asientos.value = data;
        } catch (err) {
            console.error(err);
            error.value = 'Error al cargar los asientos.';
        } finally {
            cargando.value = false;
        }
    };

    const cargarCatalogos = async () => {
        try {
            const { data } = await api.get('/catalogos');
            clientes.value = data.clientes;
            tiposPago.value = data.tiposPago;
        } catch (err) {
            console.error('Error al cargar catálogos:', err);
        }
    };

    const enviarReserva = async (datosReserva) => {
        cargando.value = true;
        error.value = null;
        try {
            const { data } = await api.post('/reservas', datosReserva);
            return data;
        } catch (err) {
            error.value = err.response?.data?.error || 'Error al procesar la reserva';
            throw err;
        } finally {
            cargando.value = false;
        }
    };

    return {
        funciones,
        asientos,
        clientes,
        tiposPago,
        cargando,
        error,
        cargarFunciones,
        cargarAsientos,
        cargarCatalogos,
        enviarReserva
    };
}