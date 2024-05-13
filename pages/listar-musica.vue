<template>
  <div class="overflow-x-hidden overflow-y-auto">
    <Sidebar />
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Lista de Músicas" icon="headphones"></Header>
      <div class="container mx-auto p-7 md:m-10 m-0">
        <div class="w-full text-end">
          <nuxt-link to="enviar-musica"
            class="btn btn-success font-bold uppercase text-white shadow-sm"><font-awesome-icon :icon="['fas', 'plus']" />
            Adicionar Nova Música</nuxt-link>
        </div>
        <div v-if="musics && musics.length > 0" class="mt-5 flex flex-wrap justify-center">
          <div v-for="music in musics" :key="music.id"
            class="mt-3 p-3 bg-secondary md:w-1/2 xl:w-1/3 md:m-3 w-full rounded-md">
            <div class="flex items-center justify-between flex-wrap md:flex-nowrap">
              <img v-show="music.loadingBtn" @load="music.loadingBtn = true" :src="getMusicImage(music.image_url)"
                :alt="music.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5">
              <div v-if="!music.loadingBtn"
                class="loading loading-spinner h-12 w-12 mt-3 mr-5 justify-center items-center"></div>
              <div v-if="music.loadingBtn" class="flex flex-col">
                <h3 class="text-xl font-bold">{{ music.nome }}</h3>
                <p class="text-gray-400 font-bold">{{ music.artista }}</p>
                <div class="tags inline-block">
                  <span class="badge badge-accent badge-outline" v-for="tag in music.tags" :key="tag.id">{{ tag.nome
                  }}</span>
                </div>
              </div>
              <div v-if="music.loadingBtn" class="flex items-center md:justify-end mt-6 md:m-0">
                <button @click="playAudio(music)" class="btn btn-info text-white mx-1">
                  <font-awesome-icon v-if="!music.isPlaying" :icon="['fas', 'play']" />
                  <font-awesome-icon v-else :icon="['fas', 'pause']" class="ml-0.5" />
                </button>
                <button @click="openEditModal(music)" class="btn btn-success mr-1 text-white">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                </button>
                <div class="aaaaaaa">
                  <button @click="openExcluirModal(music)" :id="'my_modal_' + music.id" class="btn btn-error text-white">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                  <ExcluirModal v-if="isRemoving && selectedMusic === music" :music="selectedMusic"
                    @fecharModal="handleCloseExcluirModal" @confirmarExclusao="handleConfirmarExclusao" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loading && musics && musics.length === 0">
          Nenhuma música encontrada.
        </div>
        <div v-else>
          <!-- Renderize qualquer coisa aqui que deseje mostrar enquanto as músicas estão sendo carregadas -->
          <div class="flex flex-wrap justify-center">
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
            <div class="w-1/3 skeleton m-3 p-3 py-12 bg-secondary rounded-md"></div>
          </div>
        </div>
        <EditarMusica v-if="isEditing" :music="(selectedMusic as Music)" @musicaEditada="handleMusicaEditada"
          @fecharModal="handleCloseEditModal" />
      </div>
      <Error v-if="error" :error-message="errorMessage" />
    </section>
  </div>
</template>

<script lang="ts">
import { type Music } from "../interfaces/apiRef";

export default {
  data() {
    return {
      musics: [] as Music[],
      loading: false,
      jwtToken: "",
      isEditing: false, 
      selectedMusic: null as unknown as Music,
      isRemoving: false,
      audioPlayer: null as unknown as HTMLAudioElement,
      currentPlayingMusic: null as unknown as Music | null,
      error: false,
      errorMessage: ""
    };
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    this.fetchSongs();

    if (process.client) {
      this.audioPlayer = new Audio();
    }
  },
  beforeUnmount() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null as unknown as HTMLAudioElement;
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
          console.log(data)
          const songs: Music[] = data.map((music: Music) => ({ ...music, loadingBtn: false, isPlaying: false }));
          this.musics = songs;
        } else {
          console.error("Erro ao obter músicas da API:", response.statusText);
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao obter as músicas.";
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
        } else {
          console.error("Erro ao excluir música:", response.statusText);
          if (musicIndex !== -1) {
            const updatedMusics = [...this.musics];
            updatedMusics[musicIndex] = { ...updatedMusics[musicIndex], loadingBtn: false };
            this.musics = updatedMusics;
          }
          this.error = true;
          this.errorMessage = "Ocorreu um erro ao excluir a música.";
        }
      } catch (error: any) {
        console.error("Erro na requisição de exclusão:", error.message);
        if (musicIndex !== -1) {
          const updatedMusics = [...this.musics];
          updatedMusics[musicIndex] = { ...updatedMusics[musicIndex], loadingBtn: false };
          this.musics = updatedMusics;
        }
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao excluir a música.";
      }
    },
    openEditModal(music: Music) {
      this.selectedMusic = music;
      this.isEditing = true;
    },
    handleCloseEditModal() {
      this.selectedMusic = null as unknown as Music;
      this.isEditing = false;
    },
    handleMusicaEditada(editedMusic: Music) {
      const musicIndex = this.musics.findIndex((music) => music.id === editedMusic.id);
      if (musicIndex !== -1) {
        const updatedMusics = [...this.musics];
        updatedMusics[musicIndex] = editedMusic;
        this.musics = updatedMusics;
        this.$router.push('/listar-musica').then(() => window.location.reload());
      }

      this.$router.push('/listar-musica').then(() => window.location.reload());
      this.selectedMusic = null as unknown as Music;
      this.isEditing = false;
    },
    openExcluirModal(music: Music) {
      this.selectedMusic = music;
      this.isRemoving = true;
    },
    handleCloseExcluirModal() {
      this.selectedMusic = null as unknown as Music;
      this.isRemoving = false;
    },
    handleConfirmarExclusao(musicId: number) {
      this.deleteMusic(musicId);
      this.selectedMusic = null as unknown as Music;
      this.isRemoving = false;
    },
    async playAudio(music: Music) {
      try {
        if (this.currentPlayingMusic && this.currentPlayingMusic !== music) {
          this.currentPlayingMusic.isPlaying = false;
          this.audioPlayer.pause();
          this.audioPlayer.currentTime = 0; 
        }

        if (!this.currentPlayingMusic || this.currentPlayingMusic !== music) {
          music.isPlaying = true;
          this.audioPlayer.src = music.url;

          const playPromise = this.audioPlayer.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } else if (this.currentPlayingMusic && this.currentPlayingMusic === music) {
          if (music.isPlaying) {
            music.isPlaying = false;
            this.audioPlayer.pause();
          } else {
            music.isPlaying = true;
            this.audioPlayer.play();
          }
        }

        this.currentPlayingMusic = music;
      } catch (error) {
        console.error("Ocorreu um erro ao reproduzir a música:", error.message);
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao reproduzir a música.";
      }
    },
  },
};
</script>
