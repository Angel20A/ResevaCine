<template>
  <div class="mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Administración de Reservas</h2>
      <button class="btn btn-outline-primary btn-sm" @click="cargarReservas">
        <i class="bi bi-arrow-clockwise"></i> Refrescar
      </button>
    </div>

    <div v-if="cargando" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="table-responsive shadow-sm rounded" v-if="!cargando && reservas.length > 0">
      <table class="table table-hover table-bordered align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th># Ticket</th>
            <th>Cliente</th>
            <th>Película</th>
            <th>Horario</th>
            <th>Total</th>
            <th>Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="reserva in reservas" :key="reserva.IDreserva">
            <td class="fw-bold">{{ reserva.IDreserva }}</td>
            <td>{{ reserva.Cliente }}</td>
            <td>{{ reserva.Pelicula }}</td>
            <td>{{ formatearFecha(reserva.FechaHora) }}</td>
            <td class="text-success fw-bold">Q {{ reserva.Total.toFixed(2) }}</td>
            <td>
              <!-- Badges dinámicos según el estado -->
              <span class="badge" :class="{
                'bg-warning text-dark': reserva.IDestado === 1, // Reservada
                'bg-success': reserva.IDestado === 2,           // Confirmada
                'bg-danger': reserva.IDestado === 3,             // Cancelada
                'bg-dark': reserva.IDestado === 4,              // Expirada
                'bg-secondary': reserva.IDestado === 5             // Utilizada
              }">
                {{ reserva.EstadoNombre }}
              </span>
            </td>
            <td class="text-center">
              <!-- Solo muestra acciones si está "Reservada" (1) o "Confirmada" (2) -->
              <div class="d-flex justify-content-center gap-2" v-if="reserva.IDestado === 1 || reserva.IDestado === 2">

                <!-- Botón Confirmar (Solo visible si está Reservada = 1) -->
                <button v-if="reserva.IDestado === 1" class="btn btn-sm btn-success" title="Confirmar/Pagar"
                  @click="cambiarEstado(reserva.IDreserva, 2)">
                  <i class="bi bi-check-lg"></i>
                </button>

                <!-- Botón Utilizar (Solo visible si está Confirmada = 2) -->
                <button v-if="reserva.IDestado === 2" class="btn btn-sm btn-primary" title="Marcar como Utilizada"
                  @click="cambiarEstado(reserva.IDreserva, 5)">
                  <i class="bi bi-ticket-perforated"></i>
                </button>

                <!-- Botón Cancelar -->
                <button class="btn btn-sm btn-danger" title="Cancelar Reserva"
                  @click="cambiarEstado(reserva.IDreserva, 3)">
                  <i class="bi bi-trash"></i>
                </button>

              </div>
              <span v-else class="text-muted small">Cerrada</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!cargando && reservas.length === 0" class="alert alert-info">
      No hay reservas registradas en el sistema.
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useAdmin } from '../composables/useAdmin';

const { reservas, cargando, error, cargarReservas, cambiarEstado } = useAdmin();

const formatearFecha = (fechaString) => {
  return new Date(fechaString).toLocaleString('es-GT', {
    dateStyle: 'short', timeStyle: 'short',
    timeZone: 'UTC'
  });
};

onMounted(() => {
  cargarReservas();
});
</script>
