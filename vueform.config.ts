import pt_BR from '@vueform/vueform/locales/pt_BR'
import tailwind from '@vueform/vueform/dist/tailwind'
import { defineConfig } from '@vueform/vueform'

export default defineConfig({
  theme: tailwind,
  locales: { pt_BR },
  locale: 'pt_BR',
  language: "pt_BR"
})