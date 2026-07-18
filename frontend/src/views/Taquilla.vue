<template>
  <div class="mt-4">
    <h2 class="mb-4">Cartelera </h2>

    <!-- Loader y Errores -->
    <div v-if="cargando" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Conectando con la base de datos...</p>
    </div>

    <div v-if="error" class="alert alert-danger shadow-sm">
      {{ error }}
    </div>

    <!-- Solo se muestra si no hay una función seleccionada -->
    <div v-if="!cargando && !error && !funcionSeleccionada">
      <div class="row">
        <!-- Itera las funciones que muestra el composable -->
        <div class="col-md-4 mb-4" v-for="funcion in funciones" :key="funcion.IDfuncion">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold text-dark">{{ funcion.Pelicula }}</h5>
              <h6 class="card-subtitle mb-3 text-primary">{{ funcion.Genero }} | {{ funcion.Clasificacion }}</h6>
              <ul class="list-unstyled mb-4">
                <li><strong>Sala:</strong> {{ funcion.Sala }}</li>
                <li><strong>Capacidad:</strong> {{ funcion.Capacidad }} butacas</li>
                <li><strong>Horario:</strong> {{ formatearFecha(funcion.FechaHora) }}</li>
                <li><strong>Precio:</strong> Q. {{ funcion.Precio }}</li>
              </ul>
              <!-- Si la función NO ha iniciado, mostramos el botón -->
              <button v-if="!yaInicio(funcion.FechaHora)" class="btn btn-dark w-100"
                @click="seleccionarFuncion(funcion)">
                Ver Asientos Disponibles
              </button>

              <!-- Si ya inició, bloqueamos la acción visualmente -->
              <div v-else class="alert alert-danger p-2 text-center mb-0 fw-bold">
                <i class="bi bi-x-circle me-1"></i> Función Iniciada
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="funciones.length === 0 && !cargando" class="alert alert-warning">
        No hay funciones programadas en la cartelera.
      </div>
    </div>

    <!-- estructura del Mapa de Asientos (se muestra al seleccionar una función) -->
    <div v-if="funcionSeleccionada">
      <button class="btn btn-outline-secondary mb-3" @click="funcionSeleccionada = null">
        &larr; Volver a Cartelera
      </button>

      <div class="card shadow-sm border-0 p-4">
        <h4>Reserva para: <span class="text-primary">{{ funcionSeleccionada.Pelicula }}</span></h4>
        <p class="text-muted mb-0">Sala: {{ funcionSeleccionada.Sala }} | Horario: {{
          formatearFecha(funcionSeleccionada.FechaHora) }} | Precio: Q. {{ funcionSeleccionada.Precio }}</p>
        <hr>

        <div class="mt-4 p-3 bg-light rounded text-center overflow-auto">
          <div class="mb-4 bg-dark text-white rounded p-1 w-75 mx-auto">
            <small>PANTALLA</small>
          </div>

          <!-- Itera sobre los grupos dinámicos (Fila A, Fila B...) -->
          <div v-for="(listaAsientos, letra) in asientosAgrupados" :key="letra"
            class="d-flex justify-content-center align-items-center mb-2">
            <!-- Letra indicadora de la fila -->
            <div class="fw-bold me-3" style="width: 20px;">{{ letra }}</div>

            <!-- Itera las butacas de esa fila -->
            <div class="d-flex gap-2">
              <button v-for="asiento in listaAsientos" :key="asiento.IDasiento"
                class="btn border-0 bg-transparent d-flex flex-column align-items-center p-1 mx-1" style="width: 55px;"
                :class="{
                  'text-secondary opacity-50': asiento.Ocupado === 1,
                  'text-success fw-bold': esSeleccionado(asiento.IDasiento),
                  'text-primary': asiento.Ocupado === 0 && !esSeleccionado(asiento.IDasiento)
                }" :disabled="asiento.Ocupado === 1" @click="toggleAsiento(asiento)">
                <!-- Libre -->
                <i v-if="asiento.Ocupado === 0 && !esSeleccionado(asiento.IDasiento)" class="bi bi-display fs-3"
                  style="line-height: 1;"></i>

                <!-- Seleccionado -->
                <i v-if="esSeleccionado(asiento.IDasiento)" class="bi bi-check-circle-fill fs-3"
                  style="line-height: 1;"></i>

                <!-- Ocupado -->
                <i v-if="asiento.Ocupado === 1" class="bi bi-x-circle-fill fs-3" style="line-height: 1;"></i>

                <small class="mt-1" style="font-size: 0.75rem;">{{ asiento.Codigo }}</small>
              </button>
            </div>
          </div>
        </div>

        <!-- RESUMEN -->
        <div class="mt-4 alert alert-secondary d-flex justify-content-between align-items-center shadow-sm">
          <span><strong>Butacas seleccionadas:</strong> {{ asientosSeleccionados.length }} | <strong>Total a
              pagar:</strong> Q. {{ totalPagar }}</span>
          <button class="btn btn-primary px-4 fw-bold shadow" :disabled="asientosSeleccionados.length === 0"
            @click="abrirModal">
            Siguiente: Facturación &rarr;
          </button>
        </div>
      </div>
    </div>

    <div class="modal fade" id="modalFacturacion" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white border-0">
            <h5 class="modal-title fw-bold">Confirmar Reserva</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">

            <div class="alert alert-info border-0 shadow-sm">
              <h6 class="fw-bold mb-1">Resumen de compra:</h6>
              <ul class="mb-0 ps-3">
                <li>Película: <strong>{{ funcionSeleccionada?.Pelicula }}</strong></li>
                <li>Asientos: <strong>{{asientosSeleccionados.map(a => a.Codigo).join(', ')}}</strong></li>
                <li>Total a pagar: <strong>Q. {{ totalPagar }}</strong></li>
              </ul>
            </div>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div class="mb-3">
              <label class="form-label fw-bold">Cliente</label>
              <select class="form-select" v-model="formFacturacion.idCliente">
                <option value="">Seleccione un cliente...</option>
                <option v-for="c in clientes" :key="c.IDcliente" :value="c.IDcliente">
                  {{ c.Nombre }} (NIT: {{ c.NIT }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold">Método de Pago</label>
              <select class="form-select" v-model="formFacturacion.idTipoPago">
                <option value="">Seleccione cómo pagará...</option>
                <option v-for="tp in tiposPago" :key="tp.IDtipopago" :value="tp.IDtipopago">
                  {{ tp.Nombre }}
                </option>
              </select>
            </div>

            <button class="btn btn-success w-100 fw-bold shadow" @click="procesarCompra" :disabled="cargando">
              <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
              {{ cargando ? 'Procesando...' : 'Confirmar Reserva' }}
            </button>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { useTaquilla } from '../composables/useTaquilla';
import * as bootstrap from 'bootstrap';

// obtiene los datos de la API y los métodos para interactuar con ella
const { funciones, asientos, cargando, error, cargarFunciones, cargarAsientos, clientes, tiposPago, cargarCatalogos, enviarReserva } = useTaquilla();

// estado de la interfaz.
const funcionSeleccionada = ref(null);
const asientosSeleccionados = ref([]);
const totalPagar = ref(0);
const formFacturacion = ref({
  idCliente: '',
  idTipoPago: ''
});

// cuando el componente se monta, trae la data
onMounted(() => {
  cargarFunciones();
  cargarCatalogos();
});

const yaInicio = (fechaString) => {
  if (!fechaString) return false;
  const fechaLimpia = fechaString.replace('Z', '');
  return new Date(fechaLimpia) <= new Date();
};
// Lógica de transición
const seleccionarFuncion = async (funcion) => {
  // ocultar las tarjetas y mostrar la otra sección
  asientosSeleccionados.value = [];
  funcionSeleccionada.value = funcion;
  await cargarAsientos(funcion.IDfuncion);
};

// formatea la fecha
const formatearFecha = (fechaString) => {
  const fecha = new Date(fechaString);
  return fecha.toLocaleString('es-GT', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
};






// agrupar los asientos por filas
const asientosAgrupados = computed(() => {
  const grupos = {};
  console.log(asientos.value);
  asientos.value.forEach(asiento => {
    const letraFila = asiento.Codigo.charAt(0); // Ejemplos: extrae la 'A' de 'A1'
    if (!grupos[letraFila]) {
      grupos[letraFila] = [];
    }
    grupos[letraFila].push(asiento);
  });
  return grupos;
});

// logica del clic: Seleccionar o Deseleccionar
const toggleAsiento = (asiento) => {
  console.log(asiento)
  console.log(funcionSeleccionada.value.Precio);
  // Si la BD dice que está ocupado, no permite hacer clic
  if (asiento.Ocupado === 1) return;

  if (asientosSeleccionados.value.length >= 10 && !esSeleccionado(asiento.IDasiento)) {
    alert('No se pueden seleccionar más de 10 asientos.');
    return;
  }

  const index = asientosSeleccionados.value.findIndex(a => a.IDasiento === asiento.IDasiento);
  console.log(index);
  if (index === -1) {
    // se agrega al arreglo si no está
    asientosSeleccionados.value.push(asiento);
    totalPagar.value += funcionSeleccionada.value.Precio;
  } else {
    // si ya estaba seleccionado, lo quitamos
    asientosSeleccionados.value.splice(index, 1);
    totalPagar.value -= funcionSeleccionada.value.Precio;
  }
};

//saber si un asiento específico ya fue clickeado
const esSeleccionado = (idAsiento) => {
  return asientosSeleccionados.value.some(a => a.IDasiento === idAsiento);
};






const abrirModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('modalFacturacion'));
  modal.show();
};

const procesarCompra = async () => {
  if (!formFacturacion.value.idCliente || !formFacturacion.value.idTipoPago) {
    alert("Seleccione un cliente y método de pago");
    return;
  }

  try {
    const payload = {
      idFuncion: funcionSeleccionada.value.IDfuncion,
      idCliente: formFacturacion.value.idCliente,
      idTipoPago: formFacturacion.value.idTipoPago,
      asientos: asientosSeleccionados.value.map(a => a.IDasiento)
    };

    const respuesta = await enviarReserva(payload);

    // Si no reventó, mostramos éxito
    alert(`Reserva realizada con éxito: ${respuesta.mensaje}. Número de reserva: ${respuesta.idReserva}`);

    // Cerramos el modal a la fuerza
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalFacturacion'));
    modal.hide();

    // Reiniciamos todo para la siguiente venta
    asientosSeleccionados.value = [];
    formFacturacion.value.idCliente = '';
    formFacturacion.value.idTipoPago = '';
    funcionSeleccionada.value = null; // Volvemos a la cartelera

  } catch (err) {
    // El error ya se setea en el composable, se mostrará en el modal
    console.log("Error al eralizar la compra:", err);
  }
};
</script>
