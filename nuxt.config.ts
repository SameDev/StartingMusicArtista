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
      title: "Starting Music",
      meta: [
        { name: 'description', content: 'Starting Music é uma plataforma na call permite artistas emergentes divulgarem seu trabalho, onde suas músicas poderão ser alcançadas por seus ouvintes.' },
        { name: 'robots', content: 'none'},
        { name: 'twitter:image', content: 'https://starting-music-artista.vercel.app/_vercel/image?url=/logo.svg&w=1536&q=100'}
      ],
    }
  },
  ssr: false
})
