<template>
  <div class="dashboard overflow-y-auto">
    <Sidebar />
    <section class="lg:ml-[17%] px-3 py-5">
      <Header page="Página Principal" icon="house" />
      <div class="flex flex-col flex-wrap md:gap-52 lg:gap-6">
        <div class="top w-full flex md:w-full md:h-[62vh] flex-wrap gap-14">
          <!-- Banner -->
          <div id="banner"
            class="relative col-span-1 xl:col-span-2 bg-accent rounded-lg shadow-md overflow-hidden w-full lg:w-[70%]">
            <NuxtImg class="w-full h-full object-cover" src="/banner.png" alt="Banner do sistema" />
            <div class="absolute inset-0 flex items-center justify-center bg-base-300 bg-opacity-70 text-white p-5">
              <div class="text-center">
                <h2 class="text-3xl xl:text-6xl font-extrabold mb-4 font-nunit drop-shadow-lg">
                  Starting Music
                </h2>
                <p class="text-base xl:text-lg font-roboto">
                  Sua plataforma de oportunidades.
                </p>
              </div>
            </div>
          </div>

          <!-- Box de Musica -->
          <div class="bg-[#12121f] shadow-md rounded-lg p-5 flex flex-col w-full lg:w-[25%]">
            <div v-if="loading" class="flex justify-center items-center text-white">
              <div class="loading loading-white loading-spinner"></div>
              <p class="ml-2">Buscando Músicas...</p>
            </div>
            <div v-else>
              <h2 class="text-center text-2xl font-bold text-white mb-5">
                Suas Faixas
              </h2>
              <div v-if="musics && musics.length > 0" class="flex flex-wrap justify-center">
                <div v-for="(music, index) in musics.slice(0, 6)" :key="music.id" class="mt-2 p-2 px-5 bg-secondary w-full rounded-md">
                  <div class="flex items-center align-middle">
                    <img class="object-cover object-center h-12 w-12 mt-3 rounded-md mr-5" :src="music.image_url" :alt="'Capa da música - '+music.nome">
                    <h3>{{ music.nome }}</h3>
                  </div>
                </div>
                <nuxt-link to="/listar-musica" class="block text-center mt-5 text-lg font-bold text-white">
                  <font-awesome-icon :icon="['fas', 'headphones']" /> Ver todas
                </nuxt-link>
              </div>
              <div v-else class="text-center">
                <nuxt-link to="/enviar-musica" class="text-lg font-bold text-base-100">
                  <font-awesome-icon :icon="['fas', 'file-circle-plus']" />
                  Publique sua primeira música!
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Box de Ícones -->
        <div class="col-span-3 flex gap-5 mt-5 w-full h-[20vh] py-5 flex-row align-middle md:space-x-5 overflow-x-auto">
          <nuxt-link to="/listar-musica"
            class="bg-[#7E8BBA] flex-1 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl p-3 text-white tooltip"
            data-tip="Ver suas músicas">
            <font-awesome-icon :icon="['fas', 'headphones']" />
          </nuxt-link>

          <nuxt-link to="/enviar-musica"
            class="bg-[#7F7EBA] flex-1 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl p-3 text-white tooltip"
            data-tip="Adicionar Nova Música">
            <font-awesome-icon :icon="['fas', 'circle-plus']" />
          </nuxt-link>

          <nuxt-link to="/listar-albuns"
            class="bg-[#7EACBA] flex-1 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl p-3 text-white tooltip tooltip-top"
            data-tip="Ver seus Álbuns">
            <font-awesome-icon :icon="['fas', 'compact-disc']" />
          </nuxt-link>

          <nuxt-link to="/editar-perfil"
            class="bg-[#B27CB4] flex-1 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl p-3 text-white tooltip tooltip-top"
            data-tip="Editar perfil">
            <font-awesome-icon :icon="['fas', 'user-pen']" />
          </nuxt-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { type Music } from "~/interfaces/apiRef";

export default {
  data() {
    return {
      userNome: "",
      userPic: "",
      userCargo: "",
      musics: [] as Music[],
      loading: false,
      isLogged: false,
      jwtToken: "" as string,
      counter: 27,
      activeButton: false,
    };
  },
  beforeMount() {
    if (process.client) {
      this.userPic = localStorage.getItem("userPic") || "";
      this.userNome = localStorage.getItem("userNome") || "";
      this.userCargo = localStorage.getItem("userCargo") || "";

      const cookieToken = useCookie("jwtToken");
      this.jwtToken = cookieToken.value as string;

      this.fetchSongs();
    }
  },
  methods: {
    getMusicImage(imageSrc: string): string {
      if (!imageSrc || imageSrc === "null") {
        return "/img-placeholder.png";
      }
      return imageSrc;
    },
    addLike() {
      if (this.activeButton) {
        this.activeButton = false;
        this.counter = this.counter - 1;
        return;
      }
      this.activeButton = true;
      this.counter++;
    },
    async fetchSongs() {
      const userID = localStorage.getItem("userID") || "";
      this.loading = true;
      try {
        const response = await fetch(
          `https://starting-music.onrender.com/user/songs/${userID}`
        );
        if (response.ok) {
          this.loading = false;
          const data = await response.json();
          this.musics = data;
        } else {
          console.error("Erro ao obter músicas da API:", response.statusText);
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
      }
    },
  },
};
</script>

<style scoped>
@media screen and (max-width: 1800px) {
  .box-container {
    width: 100% !important;
    margin-right: 0;
    margin-top: 7px;
  }

  .dashboard {
    overflow-x: hidden;
    width: 100%;
  }

  .scroll-container {
    scrollbar-width: thin;
    scrollbar-color: #7E8BBA #f0f0f0;
  }

  .scroll-container::-webkit-scrollbar {
    height: 8px;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: #7E8BBA;
    border-radius: 10px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
}
</style>
