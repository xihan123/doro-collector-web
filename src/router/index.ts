import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: {title: '表情包收集'}
    },
    {
        path: '/sticker/:id',
        name: 'StickerDetail',
        component: () => import('@/views/DetailView.vue'),
        props: route => ({id: String(route.params.id)}),
        meta: {title: '表情包详情'}
    },
    {
        path: '/upload',
        name: 'Upload',
        component: () => import('@/views/UploadView.vue'),
        meta: {title: '上传表情包'}
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/AboutView.vue'),
        meta: {title: '关于我们'}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundView.vue'),
        meta: {title: '页面不存在'}
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, _from, next) => {
    document.title = `${to.meta.title || '表情包收集'} - DORO`;
    next();
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.documentElement.style.overflow = '';
});

export default router;