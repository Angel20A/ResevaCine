import { createRouter, createWebHistory } from 'vue-router';
import Taquilla from '../views/Taquilla.vue';
import AdminReservas from '../components/adminReservas.vue';
import ReporteTaquilla from '../components/ReporteTaquilla.vue';

const routes = [
    {
        path: '/',
        name: 'Taquilla',
        component: Taquilla
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminReservas
    },
    {
        path: '/admin/reporte',
        name: 'Reporte',
        component: ReporteTaquilla
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;