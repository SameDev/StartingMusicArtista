<template>
  <div class="overflow-x-hidden overflow-y-auto">
    <Sidebar />
    <section class="2xl:ml-[16%] px-10 py-5">
      <Header page="Detalhes do Álbum" icon="compact-disc"></Header>
      <div class="container mx-auto m-0">
        <div v-if="loading" class="text-center">
          <div class="spinner">Carregando...</div>
        </div>
        <div class="block w-full" v-else>
          <div class="mt-3 p-5 bg-[#12121f] w-full rounded-md">
            <nuxt-link to="/listar-albuns" class="text-xl font-bold block mb-4">
              <font-awesome-icon :icon="['fas', 'arrow-left-long']" />
            </nuxt-link>
            <div class="flex flex-wrap justify-between items-start">
              <img :src="album.image_url" 
                   class="rounded-md object-cover object-center w-full sm:w-64 h-64 mb-5 sm:mb-0" 
                   :alt="album.nome + ' | Starting Music'">
              <div class="ml-0 sm:ml-5 w-full sm:w-[calc(100%-18rem)]">
                <p class="text-gray-400 font-bold">{{ album.lancamento }}</p>
                <h3 class="text-3xl sm:text-6xl font-bold break-words">{{ album.nome }}</h3>
                <div class="flex flex-wrap items-center text-sm sm:text-base">
                  <p class="text-gray-400 font-bold">{{ album.artista }}</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ new Date(album.data_lanc).getFullYear() }}</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ album.musicas.length }} músicas</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ formatDuration(totalDuration) }}</p>
                </div>
                <p class="text-sm text-pretty break-words">{{ album.desc }}</p>
              </div>
            </div>
            <div class="divider divider-end">
              <div class="btngroup flex mr-1">
                <!-- <button @click="editAlbum" class="btn btn-disabled text-white text-xl mr-1 disabled">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                </button> -->
                <button @click="openAddMusicModal" class="btn btn-success text-white text-xl mr-1">
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button @click="openDeleteModal(album)" class="btn btn-error text-white text-xl">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </div>
            </div>
            <div class="mt-3">
              <div v-if="album.musicas && album.musicas.length > 0" class="flex flex-wrap justify-between">
                <div v-for="musica in album.musicas" :key="musica.id" class="mt-2 p-2 px-5 bg-[#1a1a2b] md:w-[49%] m-1 w-full rounded-md">
                  <div class="flex items-center justify-between flex-wrap md:flex-nowrap">
                    <div class="flex items-center">
                      <div class="mr-3">
                        <img :src="album.image_url" :alt="album.nome" class="object-cover object-center w-20 h-20 rounded-md mr-3">
                      </div>
                      <div class="flex md:flex-col">
                        <h3 class="text-xl font-bold">{{ musica.nome }}</h3>
                        <p class="text-gray-400 font-bold">{{ musica.artista }}</p>
                        <div class="tags inline-block">
                          <span class="badge badge-accent badge-outline" v-for="tag in musica.tags" :key="tag.id">{{ tag.nome }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center md:justify-end mt-6 md:m-0">
                      <button @click="playAudio(musica)" class="btn btn-primary text-white mx-1">
                        <font-awesome-icon :icon="['fas', musica.isPlaying ? 'pause' : 'play']" />
                      </button>
                      <button @click="openEditModal(musica)" class="btn btn-success mr-1 text-white">
                        <font-awesome-icon :icon="['fas', 'pen']" />
                      </button>
                      <button @click="openExcluirModal(musica)" class="btn btn-error text-white">
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </button>
                    </div>
                  </div>
                  <EditarMusica v-if="isEditing" :music="selectedMusic" @musicaEditada="handleMusicaEditada" @fecharModal="handleCloseEditModal" />
                  <ExcluirModal v-if="isRemoving && selectedMusic" :music="selectedMusic" @fecharModal="handleCloseExcluirModal" @confirmarExclusao="handleConfirmarExclusao" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
      </div>
    </section>
    
    <AdicionarMusica v-if="isAdding" :albumId="album.id" :data_lanc="album.data_lanc" @musicaAdicionada="handleMusicaAdicionada" @fecharModal="handleCloseAddMusicModal" :artistaId="artistaId" />
    <ExcluirAlbum v-if="isRemoving && selectedAlbum" :album="selectedAlbum" @fecharModal="closeDeleteModal" @confirmarExclusao="deleteAlbum" />
  </div>
</template>


<script lang="ts">
import type { Album, Music } from "../../interfaces/apiRef";

export default {
  data() {
    return {
      jwtToken: "",
      album: {} as Album,
      loading: false,
      error: false,
      errorMessage: "",
      showDeleteModal: false,
      totalDuration: 0,
      isEditing: false,
      selectedMusic: null as unknown as Music,
      isRemoving: false,
      isAdding: false,
      audioPlayer: null as unknown as HTMLAudioElement,
      currentPlayingMusic: null as unknown as Music | null,
      artistaId: localStorage.getItem("userID"),
      selectedAlbum: null as Album | null,
    };
  },
  async beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;
    await this.fetchAlbum();
    if (process.client) {
      this.audioPlayer = new Audio();
      this.audioPlayer.addEventListener("error", (e) => {
        console.error("Erro ao carregar o áudio:", e);
      });
      this.audioPlayer.addEventListener("loadeddata", () => {
        if (this.audioPlayer) {
          this.audioPlayer.play();
        }
      });
    }
  },
  beforeUnmount() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null as unknown as HTMLAudioElement;
    }
  },
  methods: {
    async fetchAlbum() {
      const albumId = this.$route.params.id;
      this.loading = true;
      try {
        const response = await fetch(
          `https://starting-music.onrender.com/album/${albumId}`
        );
        if (response.ok) {
          const data = await response.json();
          this.album = data.albums;
          this.calculateTotalDuration();
        } else {
          console.error(
            "Erro ao obter detalhes do álbum:",
            response.statusText
          );
          this.error = true;
          this.errorMessage = "Ocorreu um erro ao obter os detalhes do álbum.";
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao obter os detalhes do álbum.";
      } finally {
        this.loading = false;
      }
    },
    openDeleteModal(album: Album) {
      console.log('Abrindo modal para o álbum:', album);
      this.selectedAlbum = album;
      this.isRemoving = true; 
    },
    closeDeleteModal() {
      console.log('Fechando modal.');
      this.selectedAlbum = null; 
      this.isRemoving = false;
    },
    async deleteAlbum() {
      const albumId = this.$route.params.id;
      try {
        const response = await fetch(`https://starting-music.onrender.com/album/delete/${albumId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `${this.jwtToken}`,
          },
        });
        if (response.ok) {
          this.$router.push({ name: "album-list" });
        } else {
          throw new Error('Erro ao excluir o álbum');
        }
      } catch (error) {
        console.error('Erro ao excluir o álbum:', error.message);
        this.error = true;
        this.errorMessage = 'Ocorreu um erro ao excluir o álbum.';
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
    },
    calculateTotalDuration() {
      this.totalDuration = this.album.musicas.reduce((total, musica) => {
        const [minutes, seconds] = musica.duracao.split(":").map(Number);
        return total + minutes * 60 + seconds;
      }, 0);
    },
    formatDuration(durationInSeconds: number) {
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      return `${minutes}m ${seconds}s`;
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
    openEditModal(musica: Music) {
      this.isEditing = true;
      this.selectedMusic = musica;
    },
    handleCloseEditModal() {
      this.isEditing = false;
      this.selectedMusic = null as unknown as Music;
    },
    handleMusicaEditada(musicaEditada: Music) {
      const index = this.album.musicas.findIndex(
        (musica) => musica.id === musicaEditada.id
      );
      if (index !== -1) {
        this.album.musicas.splice(index, 1, musicaEditada);
        this.calculateTotalDuration();
        this.handleCloseEditModal();
      }
    },
    openExcluirModal(musica: Music) {
      this.isRemoving = true;
      this.selectedMusic = musica;
    },
    handleCloseExcluirModal() {
      this.isRemoving = false;
      this.selectedMusic = null as unknown as Music;
    },
    handleConfirmarExclusao() {
      if (this.selectedMusic) {
        const index = this.album.musicas.findIndex(
          (musica) => musica.id === this.selectedMusic!.id
        );
        if (index !== -1) {
          this.album.musicas.splice(index, 1);
          this.calculateTotalDuration();
          this.selectedMusic = null as unknown as Music;
        }
      }
      this.handleCloseExcluirModal();
    },
    editAlbum() {
      this.$router.push({
        name: "editar-album",
        params: { id: this.album.id.toString() },
      });
    },
    openAddMusicModal() {
      this.isAdding = true;
    },
    handleCloseAddMusicModal() {
      this.isAdding = false;
    },
    handleMusicaAdicionada(novaMusica: Music) {
      this.album.musicas.push(novaMusica);
      this.calculateTotalDuration();
      this.handleCloseAddMusicModal();
    },
  },
};
</script>
