import { createPinia } from 'pinia';
import { markRaw } from 'vue';
import router from '@/router';

const pinia = createPinia();

// 为 pinia 添加路由插件
pinia.use(({ store }) => {
  store.$router = markRaw(router);
});

export default pinia;