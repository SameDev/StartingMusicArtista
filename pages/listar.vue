<template>
  <div v-if="isLogged">
    <Sidebar/>
    <section class="ml-80 px-10 py-5">
      <Header page="Lista de Músicas" icon="headphones"></Header>
      <div class="container mx-auto p-7 m-10">
        <div class="w-full text-end">
          <nuxt-link to="enviar-musica" class="btn btn-success font-bold uppercase text-white shadow-sm"><font-awesome-icon :icon="['fas', 'plus']" /> Adicionar Nova Música</nuxt-link>
        </div>
        <div v-if="musics && musics.length > 0" class="mt-5 flex flex-wrap justify-center"  :class="{'overflow-hidden fixed': isEditing}">
          <div v-for="music in musics" :key="music.id" class="m-3 p-3 bg-secondary w-1/3 rounded-md" >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <img :src="getMusicImage(music.image_url)" :alt="music.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5">
                <div>
                  <h3 class="text-xl font-bold">{{ music.nome }}</h3>
                  <p class="text-gray-400 font-bold">{{ music.artista }}</p>
                  <p>{{ music.tags }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <button @click="openEditModal(music)" class="btn btn-success mr-1 text-white">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                </button>
                
                <div class="aaaaaaa">
                  
                  <label for="my_modal_6" class="btn btn-error text-white">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </label>
                  <input type="checkbox" id="my_modal_6" class="modal-toggle" />
                  <div class="modal" role="dialog">
                  <div class="modal-box">
                    <div class="modal-action">
                      <label for="my_modal_6" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                    </div>
                    <h3 class="font-bold text-lg">Você deseja excluir?</h3>

                    <p class="py-4">Essa ação é irreversível! Se você confirmar não terá como recuperar novamente!</p>
                    <p>Você está excluindo a musica {{ music.id+" "+music.nome }}</p>
                    <button 
                      @click="deleteMusic(music.id)" 
                      class="btn btn-error text-white w-full" 
                      :class="{ 'disabled': music.loadingBtn }" 
                      :disabled="music.loadingBtn">Excluir
                      <div class="loading loading-spinner" v-if="music.loadingBtn"></div>
                    </button>
                  </div>
                </div>
                </div>

                
                
              </div>
            </div>
          </div>
        </div>

        

        <div v-else-if="!loading">
          Nenhuma música encontrada.
        </div>
        <div class="flex flex-wrap justify-center" v-if="loading">
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
        </div>
        <EditarMusica v-if="isEditing" :music="(selectedMusic as Music)" @musicaEditada="handleMusicaEditada" @fecharModal="handleCloseEditModal" />
      </div>
    </section>
    
  </div>
  <span class="container justify-center items-center content-center bg-secondary w-full p-7 m-10 rounded-md font-nunito block" v-else>
    Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
  </span>
</template>


<script lang="ts">
import { type Music } from "../interfaces/apiRef";
import 'daisyui';

export default {
  data() {
    return {
      musics: [] as Music[],
      loading: false,
      jwtToken: "",
      isLogged: false,
      isEditing: false, 
      selectedMusic: null as unknown as Object,
      isRemoving: false,
    };
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    if (this.jwtToken || this.jwtToken != "") {
      this.isLogged = true;
      this.fetchSongs();
    }
  },
  methods: {
    async fetchSongs() {
      const userID = localStorage.getItem("userID") || "";
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/user/songs/${userID}`);
        if (response.ok) {
          this.loading = false;
          const data = await response.json();
          const songs: Music[] = data.map((music: Music) => ({ ...music, loadingBtn: false }));
          this.musics = songs;
        } else {
          console.error("Erro ao obter músicas da API:", response.statusText);
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
      }
    },
    getMusicImage(imageUrl: string) {
      if (!imageUrl || imageUrl === "null" || imageUrl === undefined || imageUrl === "") {
        return "/img-placeholder.png";
      }

      return imageUrl;
    },

    async deleteMusic(musicId: number) {
      const musicIndex = this.musics.findIndex((music) => music.id === musicId);
      if (musicIndex !== -1) {
        const updatedMusics = [...this.musics];
        updatedMusics[musicIndex] = { ...updatedMusics[musicIndex], loadingBtn: true };
        this.musics = updatedMusics;
      }

      try {
        const response = await fetch(`https://starting-music.onrender.com/music/delete/${musicId}`, {
          method: "DELETE",
          headers: {
            Authorization: `${this.jwtToken}`,
          },
        });

        if (response.ok) {
          this.musics = this.musics.filter((music) => music.id !== musicId);
          this.$router.push('/').then(() => window.location.reload());
        } else {
          console.error("Erro ao excluir música:", response.statusText);
          if (musicIndex !== -1) {
            const updatedMusics = [...this.musics];
            updatedMusics[musicIndex] = { ...updatedMusics[musicIndex], loadingBtn: false };
            this.musics = updatedMusics;
          }
        }
      } catch (error: any) {
        console.error("Erro na requisição de exclusão:", error.message);

        if (musicIndex !== -1) {
          const updatedMusics = [...this.musics];
          updatedMusics[musicIndex] = { ...updatedMusics[musicIndex], loadingBtn: false };
          this.musics = updatedMusics;
        }
      }
    },
    openEditModal(music: Object) {
      this.selectedMusic = music;
      this.isEditing = true;
    },
    handleCloseEditModal() {
      this.selectedMusic = null as unknown as object;
      this.isEditing = false;
    },
    handleMusicaEditada(editedMusic: Music) {
      const musicIndex = this.musics.findIndex((music) => music.id === editedMusic.id);
      if (musicIndex !== -1) {
        const updatedMusics = [...this.musics];
        updatedMusics[musicIndex] = editedMusic;
        this.musics = updatedMusics;
      }

      this.selectedMusic = null as unknown as object;
      this.isEditing = false;
    },
    openExcluirModal() {
      this.isRemoving = true;
    },
  },
};
</script>