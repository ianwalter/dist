import VuePlugin from 'rollup-plugin-vue'

// https://github.com/vuejs/rollup-plugin-vue/issues/258
process.env.BUILD = 'production'

export default [VuePlugin({ styleToImports: true })]
