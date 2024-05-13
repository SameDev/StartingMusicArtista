<template>
  <div class="overflow-x-hidden overflow-y-auto">
    <Sidebar />
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Lista de Álbuns" icon="compact-disc"></Header>
      <div class="container mx-auto p-7 md:m-10 m-0">
        <div v-if="loading" class="text-center">Carregando...</div>
        <div v-else>
          <div v-if="albums && albums.length > 0" class="mt-5 flex flex-wrap justify-center">
            <div v-for="(album, index) in albums" :key="album.id"
              class="mt-3 p-3 bg-secondary md:w-1/2 xl:w-1/3 md:m-3 w-full rounded-md">
              <div class="flex items-center justify-between flex-wrap md:flex-nowrap">
                <div class="w-1/2 mr-3">
                  <img :src="album.image_url"
                  :alt="album.nome" class="object-cover object-center w-52 h-52  mt-3 rounded-md mr-5">
                </div>
                <div class="flex flex-col w-1/2">
                  <h3 class="text-xl font-bold">{{ album.nome }}</h3>
                  <p class="text-gray-400 font-bold">{{ album.artista }}</p>
                  <p class="text-gray-400">{{ formatDate(album.data_lanc) }}</p>
                  <button @click="showMore(index)" class="btn btn-primary text-white mt-3">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                    Mostrar Mais
                  </button>
                  <button @click="deleteAlbum(album.id)" class="btn btn-error text-white mt-3">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    Excluir Álbum
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!loading && albums && albums.length === 0">
            Nenhum álbum encontrado.
          </div>
        </div>
        <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { type Album } from "../interfaces/apiRef";

export default {
  data() {
    return {
      albums: [] as Album[],
      loading: false,
      error: false,
      errorMessage: ""
    };
  },
  beforeMount() {
    this.fetchAlbums();
  },
  methods: {
    async fetchAlbums() {
      const userID = localStorage.getItem("userID") || "";
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/user/album/${userID}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const albuns: Album[] = data.map((album: Album) => ({ ...album}));
          this.albums = albuns;
        } else {
          console.error("Erro ao obter álbuns da API:", response.statusText);
          this.error = true;
          this.errorMessage = "Ocorreu um erro ao obter os álbuns.";
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error.message);
        this.error = true;
        this.errorMessage = "Ocorreu um erro ao obter os álbuns.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },
    // Método para mostrar mais informações do álbum
    showMore(index: number) {
      const album = this.albums[index];
      // Implemente a lógica para mostrar mais informações do álbum, se necessário
    },
    // Método para excluir o álbum
    async deleteAlbum(albumId: number) {
      // Implemente a lógica para excluir o álbum
    }
  }
};
</script>
