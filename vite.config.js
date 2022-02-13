/**
 * @type {import('vite').UserConfig}
 */
const config = {
    base: '',
    root: 'src',
    build: {
        outDir: '../dist',
        polyfillModulePreload: false,
        emptyOutDir: true
    }
}

export default config
