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
          <nuxt-link to="/listar-albuns" class="text-xl font-bold block mb-4"><font-awesome-icon :icon="['fas', 'arrow-left-long']" /></nuxt-link>
           <div class="flex justify-between items-end">
            <div class="flex w-[75%]">
              <img :src="album.image_url" class="rounded-md object-cover object-center w-64 h-64" :alt="album.nome + ' | Starting Music'">
              <div class="info ml-5">
                <p class="text-gray-400 font-bold">{{  album.lancamento }}</p>
                <h3 class="text-6xl font-bold">{{ album.nome }}</h3>
                <div class="flex">
                  <p class="text-gray-400 font-bold">{{ album.artista }}</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ new Date(album.data_lanc).getFullYear() }}</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ album.musicas.length }} músicas</p>
                  <div class="mx-1"> • </div>
                  <p class="text-gray-400">{{ formatDuration(totalDuration) }}</p>
                </div>
                <p>{{ album.desc }}</p>
              </div>
            </div>
            
           </div>

            

            <div class="divider divider-end">

              <div class="btngroup flex mr-1">
                <button @click="deleteAlbum" class="btn btn-primary text-white text-xl mr-1"><font-awesome-icon :icon="['fas', 'pen']" /></button>
                <button @click="deleteAlbum" class="btn btn-success text-white text-xl mr-1"><font-awesome-icon :icon="['fas', 'plus']" /></button>
                <button @click="deleteAlbum" class="btn btn-error text-white text-xl"><font-awesome-icon :icon="['fas', 'trash']" /></button>
              
              </div>
            </div>
            
            
            <div class="mt-3">
              <div v-if="album.musicas && album.musicas.length > 0" class="flex flex-wrap justify-between">
                <div v-for="musica in album.musicas" :key="musica.id" class="mt-2 p-2 px-5 bg-[#1a1a2b] md:w-[49%] m-1 w-full rounded-md">
                  <div class="flex items-center justify-between flex-wrap md:flex-nowrap">
                    <div class="flex items-center">
                      <div class="mr-3">
                        <img :src="album.image_url"
                        :alt="album.nome" class="object-cover object-center w-20 h-20 rounded-md mr-3">
                      </div>
                      <div class="flex flex-col">
                        <h3 class="text-xl font-bold">{{ musica.nome }}</h3>
                        <p class="text-gray-400 font-bold">{{ musica.artista }}</p>
                        <div class="tags inline-block">
                          <span class="badge badge-accent badge-outline" v-for="tag in musica.tags" :key="tag.id">{{ tag.nome }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center md:justify-end mt-6 md:m-0">
                      <button class="btn btn-primary text-white mx-1">
                        <font-awesome-icon :icon="['fas', 'play']" />
                      </button>
                      <button class="btn btn-success mr-1 text-white">
                        <font-awesome-icon :icon="['fas', 'pen']" />
                      </button>
                      <div class="aaaaaaa">
                        <button class="btn btn-error text-white">
                          <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>  
              
              
            </div>
          </div>
        </div>
        <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
      </div>
    </section>
  </div>
</template>



<script lang="ts">
import type { Album } from '../../interfaces/apiRef';

export default {
  data() {
    return {
      album: {} as Album,
      loading: false,
      error: false,
      errorMessage: "",
      showDeleteModal: false,
      totalDuration: 0,
    };
  },
  async beforeMount() {
    await this.fetchAlbum();
  },
  methods: {
    async fetchAlbum() {
      const albumId = this.$route.params.id;
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/album/${albumId}`);
        if (response.ok) {
          const data = await response.json();
          this.album = data.albums;
          this.calculateTotalDuration();
        } else {
          console.error("Erro ao obter detalhes do álbum:", response.statusText);
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
    async deleteAlbum() {
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      const albumId = this.$route.params.id;
      try {
        const response = await fetch(`https://starting-music.onrender.com/album/${albumId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          this.$router.push({ name: 'album-list' });
        } else {
          console.error("Erro ao excluir álbum:", response.statusText);
          this.error = true;
          this.errorMessage = "Ocorreu um erro ao excluir o álbum.";
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao excluir o álbum.";
      } finally {
        this.showDeleteModal = false;
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
    },
    calculateTotalDuration() {
      this.totalDuration = this.album.musicas.reduce((total, musica) => {
        const [minutes, seconds] = musica.duracao.split(':').map(Number);
        return total + minutes * 60 + seconds;
      }, 0);
    },
    formatDuration(seconds: number) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },
  }
}
</script>
