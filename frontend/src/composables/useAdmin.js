import { ref } from 'vue';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export function useAdmin() {
    const reservas = ref([]);
    const cargando = ref(false);
    const error = ref(null);

    const cargarReservas = async () => {
        cargando.value = true;
        error.value = null;
        try {
            const { data } = await api.get('/reservas');
            reservas.value = data;
        } catch (err) {
            error.value = 'Error al cargar las reservas desde el servidor.';
            console.error(err);
        } finally {
            cargando.value = false;
        }
    };

    const cambiarEstado = async (idReserva, nuevoEstado) => {
        if (!confirm('¿Estás seguro de cambiar el estado de esta reserva?')) return;

        try {
            console.log(nuevoEstado)
            await api.patch(`/reservas/estado/${idReserva}`, { idEstado: nuevoEstado });
            await cargarReservas(); // recarga las reservas
        } catch (err) {
            alert(err.response?.data?.error || 'Hubo un error al actualizar la reserva');
        }
    };

    return {
        reservas,
        cargando,
        error,
        cargarReservas,
        cambiarEstado
    };
}