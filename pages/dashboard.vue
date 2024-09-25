<template>
  <div class="dashboard overflow-x-hidden">
    <Sidebar />
    <section class="2xl:ml-[17%] md:px-5 px-3 py-5">
      <Header page="Página Principal" icon="house"></Header>
      <div class="h-[86vh] flex flex-wrap">
        <div
          id="banner"
          class="relative w-full md:w-[67%] h-1/2 bg-accent rounded-lg shadow-md mr-7 box-container overflow-hidden"
        >
          <NuxtImg
            class="w-full h-full object-cover"
            src="/banner.png"
            alt="Banner do sistema"
          />
          <div
            class="absolute inset-0 px-10 py-5 flex items-center justify-center bg-base-300 bg-opacity-70 shadow-md text-white"
          >
            <div class="text-center">
              <h2 class="text-4xl md:text-6xl font-extrabold mb-4 text-shadow-lg font-nunit">Starting Music</h2>
              <p class="text-base md:text-lg font-roboto">Sua plataforma de oportunidades.</p>
            </div>
          </div>
        </div>

        <div class="w-full md:w-[31%] h-1/2 bg-accent rounded-lg shadow-md p-5 box-container">
          <div v-if="loading" class="text-base-100 p-5 flex items-center justify-center">
            <div class="loading loading-base-100 loading-spinner" v-if="loading"></div>
            Buscando Músicas...
          </div>
          <div v-else>
            <h2 class="text-center w-full mt-5 text-base-100 font-bold text-2xl">Suas Faixas</h2>
            <div v-if="musics && musics.length > 0">
              <div v-for="(music, index) in musics.slice(0, 8)" :key="music.id" class="px-10">
                <ul class="list-disc text-base-100">
                  <li class="text-xl">{{ music.nome }}</li>
                </ul>
              </div>
              <nuxt-link to="/listar-musica" class="text-base-100 font-bold text-2xl ml-2 block">
                <font-awesome-icon :icon="['fas', 'headphones']" /> Ver todas
              </nuxt-link>
            </div>
            <div v-else class="text-center mt-12">
              <nuxt-link to="/enviar-musica" class="text-base-100 font-bold text-2xl">
                <font-awesome-icon :icon="['fas', 'file-circle-plus']" /> Publique sua primeira música!
              </nuxt-link>
            </div>
          </div>
        </div>

        <div class="box-icons overflow-y-hidden overflow-x-auto flex justify-between md:w-full w-full h-40 xl:h-1/4 py-5 flex-wrap">
          <div class="flex md:space-x-4 w-full">
            <nuxt-link
              to="/listar-musica"
              class="bg-[#7E8BBA] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white md:mr-0 mr-8 tooltip tooltip-top"
              data-tip="Ver suas músicas"
            >
              <font-awesome-icon :icon="['fas', 'headphones']" />
            </nuxt-link>

            <nuxt-link
              to="/enviar-musica"
              class="bg-[#7F7EBA] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white mr-8 tooltip tooltip-top"
              data-tip="Adicionar Nova Música"
            >
              <NuxtImg class="w-32 h-26" src="/add-song.png" />
            </nuxt-link>

            <nuxt-link
              to="/listar-albuns"
              class="bg-[#7EACBA] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white mr-8 tooltip tooltip-top"
              data-tip="Ver seus Álbuns"
            >
              <font-awesome-icon :icon="['fas', 'compact-disc']" />
            </nuxt-link>

            <nuxt-link
              to="/"
              class="bg-[#CF9368] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white mr-8 tooltip tooltip-top"
              data-tip="Seus comentarios"
            >
              <font-awesome-icon :icon="['fas', 'comments']" />
            </nuxt-link>

            <nuxt-link
              to="/editar-perfil"
              class="bg-[#B27CB4] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white mr-8 tooltip tooltip-top"
              data-tip="Editar perfil"
            >
              <font-awesome-icon :icon="['fas', 'user-pen']" />
            </nuxt-link>

            <nuxt-link
              to="/"
              class="bg-[#9CBC88] w-full md:w-1/4 h-full rounded-2xl shadow-sm flex justify-center items-center text-7xl text-white tooltip tooltip-top"
              data-tip="Alcance"
            >
              <font-awesome-icon :icon="['fas', 'sliders']" />
            </nuxt-link>
          </div>
        </div> <!-- ICONS -->

        <div class="w-full md:w-[49%] h-1/4 bg-accent rounded-lg shadow-md mr-7 box-container"></div>
        <div class="w-full md:w-[49%] lg:h-1/4 bg-accent rounded-lg shadow-md box-container p-5 flex align-center items-center flex-wrap">
          <h2 class="text-xl text-center text-base-100 w-full font-bold md:-mb-5">Destaque</h2>
          <div class="flex items-center align-center xl:flex-nowrap flex-wrap">
            <div class="avatar md:w-auto w-full text-center items-center justify-center">
              <div class="w-24 rounded-full shadow-md">
                <nuxtImg src="/user-placeholder.jpeg" />
              </div>
            </div>
            <div class="ml-5">
              <h2 class="text-xl text-base-100 font-bold">Seu Fã</h2>
              <p class="text-lg text-base-100">
                Olá, {{ userNome }} gosto muito do seu trabalho! Continue fazendo músicas incríveis!
              </p>
              <div
                class="text-white cursor-pointer font-bold bg-error p-2 rounded-xl md:w-[10%] flex text-center justify-center items-center"
                @click="addLike()"
              >
                <font-awesome-icon v-if="!activeButton" :icon="['far', 'heart']" />
                <font-awesome-icon v-else :icon="['fas', 'heart']" />
                <span class="ml-1">{{ counter }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { type Music } from '~/interfaces/apiRef';

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
        const response = await fetch(`https://starting-music.onrender.com/user/songs/${userID}`);
        if (response.ok) {
          this.loading = false;
          const data = await response.json();
          this.musics = data;
        } else {
          console.error('Erro ao obter músicas da API:', response.statusText);
        }
      } catch (error: any) {
        console.error('Erro na requisição:', error.message);
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
}
</style>
