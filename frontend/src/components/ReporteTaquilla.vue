<template>
    <div class="mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Reporte Gerencial de Taquilla</h2>
            <button class="btn btn-outline-primary btn-sm" @click="cargarReporte">
                <i class="bi bi-arrow-clockwise"></i> Actualizar Reporte
            </button>
        </div>

        <div v-if="cargando" class="text-center my-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div class="table-responsive shadow-sm rounded" v-if="!cargando && reporte.length > 0">
            <table class="table table-hover table-bordered align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Película</th>
                        <th>Sala</th>
                        <th>Horario</th>
                        <th class="text-center">Capacidad</th>
                        <th class="text-center text-danger">Ocupados</th>
                        <th class="text-center text-success">Disponibles</th>
                        <th class="text-center">Estado de Reservas</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="fila in reporte" :key="fila.IDfuncion">
                        <td class="fw-bold text-primary">{{ fila.Pelicula }}</td>
                        <td>{{ fila.Sala }}</td>
                        <td>{{ formatearFecha(fila.FechaHora) }}</td>
                        <td class="text-center">{{ fila.TotalAsientos }}</td>
                        <td class="text-center fw-bold">{{ fila.Ocupados }}</td>
                        <td class="text-center fw-bold">{{ fila.Disponibles }}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-secondary" @click="verDetalleReservas(fila)">
                                <i class="bi bi-list-check"></i> Ver Tickets ({{ fila.ReservasDetalle.length }})
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- modal para ver el estado de cada reserva -->
        <div class="modal fade" id="modalDetalleReservas" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header bg-dark text-white border-0">
                        <h5 class="modal-title fw-bold">
                            Detalle de Tickets: {{ funcionActiva?.Pelicula }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">

                        <table class="table table-sm" v-if="funcionActiva?.ReservasDetalle.length > 0">
                            <thead>
                                <tr>
                                    <th># Ticket</th>
                                    <th>Cliente</th>
                                    <th>Total Pagado</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="res in funcionActiva.ReservasDetalle" :key="res.IDreserva">
                                    <td class="fw-bold">{{ res.IDreserva }}</td>
                                    <td>{{ res.Cliente }}</td>
                                    <td>Q {{ res.Total.toFixed(2) }}</td>
                                    <td>
                                        <span class="badge bg-secondary">{{ res.Estado }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div v-else class="alert alert-warning mb-0">
                            No hay reservas registradas para esta función.
                        </div>

                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAdmin } from '../composables/useAdmin';
import * as bootstrap from 'bootstrap';

const { reporte, cargando, cargarReporte } = useAdmin();
const funcionActiva = ref(null);

const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const fechaLimpia = fechaString.replace('Z', '');
    return new Date(fechaLimpia).toLocaleString('es-GT', {
        dateStyle: 'short', timeStyle: 'short'
    });
};

const verDetalleReservas = (filaReporte) => {
    funcionActiva.value = filaReporte;
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleReservas'));
    modal.show();
};

onMounted(() => {
    cargarReporte();
});
</script>