import { createRouter, createWebHistory } from 'vue-router';
import Taquilla from '../views/Taquilla.vue';
import AdminReservas from '../components/AdminReservas.vue';
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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;