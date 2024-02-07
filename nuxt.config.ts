// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', ['@nuxtjs/google-fonts', {
    families: {
      Roboto: true,
      "Nunito Sans": true,
    }
}], "@nuxt/image", '@vueform/nuxt', 'nuxt-primevue'],
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    'primevue/resources/themes/aura-dark-purple/theme.css',
  ],
  image: {},
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: "Starting Music"
    }
  }
})
