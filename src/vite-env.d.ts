/// <reference types="vite/client" />

declare module '*.vue' {
    import type {DefineComponent} from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'vue-waterfall-plugin-next' {
    import {DefineComponent} from 'vue'
    const component: DefineComponent<any, any, any>
    export default component
}