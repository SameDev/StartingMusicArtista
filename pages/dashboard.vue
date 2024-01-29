<template>
 <div class="dashboard" v-if="isLogged">
  <Sidebar/>
  <section class="ml-80 px-10 py-5">
    <Header page="Página Principal" icon="house"></Header>
    <div class="h-[86vh] flex flex-wrap">
      <div class="w-[67%] h-1/2 bg-accent rounded-lg shadow-md mr-7"></div>
      <div class="w-[31%] h-1/2 bg-accent rounded-lg shadow-md p-5">
        <div v-if="loading" class="text-base-100 p-5 flex items-center justify-center"><div class="loading loading-base-100 loading-spinner" v-if="loading"></div> Buscando Músicas...</div>
        <div v-else>
          <h2 class="text-center w-full mt-5 text-base-100 font-bold text-2xl">Suas Faixas</h2>
          <div v-if="musics && musics.length > 0">
            <div v-for="(music, index) in musics.slice(0, 8)" :key="music.id" class="px-10 mt-2">
              <ul class="list-disc text-base-100 ">
                <li class="text-xl">{{ music.nome }}</li>
              </ul>
              
            </div>
            <nuxt-link to="/listar" class="text-base-100 font-bold text-2xl ml-2 block">
              <font-awesome-icon :icon="['fas', 'headphones']" /> Ver todas
            </nuxt-link>
          </div>
          <div v-else>
            <nuxt-link to="/enviar-musica" class="text-base-100 font-bold text-2xl ml-2 mt-2">
              <font-awesome-icon :icon="['fas', 'file-circle-plus']" /> Publique sua primeira música!
            </nuxt-link>
          </div>
        </div>
        
      </div>
      
      <div class="box-icons flex justify-between w-full h-1/4 py-5"> 
        <nuxt-link to="/listar" class="bg-[#7E8BBA] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white mr-8 tooltip tooltip-top" data-tip="Ver suas músicas">
          <font-awesome-icon :icon="['fas', 'headphones']" />
        </nuxt-link>
        <nuxt-link to="/enviar-musica" class="bg-[#7F7EBA] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white mr-8 tooltip tooltip-top" data-tip="Adicionar Nova Música">
          <NuxtImg class="w-[45%] h-1/2" src="/add-song.png" />
        </nuxt-link>
        <nuxt-link to="/" class="bg-[#7EACBA] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white mr-8 tooltip tooltip-top" data-tip="Alcance">
          <font-awesome-icon :icon="['fas', 'sliders']" />
        </nuxt-link>
        <nuxt-link to="/" class="bg-[#CF9368] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white mr-8 tooltip tooltip-top" data-tip="Seus comentarios">
          <font-awesome-icon :icon="['fas', 'comments']" />
        </nuxt-link>
        <nuxt-link to="/" class="bg-[#B27CB4] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white mr-8 tooltip tooltip-top" data-tip="Editar úsuario">
          <font-awesome-icon :icon="['fas', 'user-pen']" />
        </nuxt-link>
        <nuxt-link to="/" class="bg-[#9CBC88] w-1/4 h-full rounded-2xl shadow-sm flex justify-center align-center items-center text-7xl text-white tooltip tooltip-top" data-tip="Estátisticas e dados">
          <font-awesome-icon :icon="['fas', 'chart-simple']" />
        </nuxt-link>
      </div> <!-- ICONS -->

      <div class="w-[49%] h-1/4 bg-accent rounded-lg shadow-md mr-7"></div>
      <div class="w-[49%] h-1/4 bg-accent rounded-lg shadow-md"></div>
    </div>
  </section>
 </div>
 <div v-else class="container justify-center items-center content-center mx-auto bg-secondary w-full p-7 m-10 rounded-md font-nunito">
    Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
  </div>
</template>

<script lang="ts">
import { type Music } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      userNome: localStorage.getItem("userNome") || "",
      userPic: localStorage.getItem("userPic") || "",
      userCargo: localStorage.getItem("userCargo") || "",
      musics: [] as Music[],
      loading: false,
      isLogged: false,
      jwtToken: "" as string,
    }
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    if (this.jwtToken || this.jwtToken != '') {
      this.isLogged = true;
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
    async fetchSongs() {
      const userID = localStorage.getItem("userID") || "";
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/user/songs/${userID}`);
        if (response.ok) {
          this.loading = false;
          const data = await response.json();
          console.log(data);
          this.musics = data;
          const songs: Music[] = data;
          this.musics = songs;
        } else {
          console.error('Erro ao obter músicas da API:', response.statusText);
        }
      } catch (error: any) {
        console.error('Erro na requisição:', error.message);
      }
    },
  },
}
</script>