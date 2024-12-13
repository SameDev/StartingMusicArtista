<template>
  <div class="overflow-x-hidden overflow-y-auto">
    <Sidebar />
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Lista de Álbuns" icon="compact-disc" />
      <div class="container mx-auto p-7 md:m-10 m-0">
        <nuxt-link
          to="/cadastrar-album"
          class="btn btn-success font-bold uppercase sm:text-center xl:ml-[14.3rem] text-white shadow-sm mb-5 mr-5"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
          Adicionar novo álbum
        </nuxt-link>

        <div v-if="loading" class="text-center">
          <div class="flex flex-wrap justify-center">
            <div
              v-for="n in 8"
              :key="n"
              class="w-1/3 skeleton m-3 p-3 py-20 bg-secondary rounded-md"
            ></div>
          </div>
        </div>

        <div v-else>
          <div v-if="albums && albums.length > 0" class="mt-5 flex flex-wrap justify-center">
            <div
              v-for="(album, index) in albums"
              :key="album.id"
              class="mt-3 p-3 bg-secondary md:w-1/2 xl:w-1/3 md:m-3 w-full rounded-md"
            >
              <div class="flex items-center justify-between flex-wrap md:flex-nowrap">
                <div class="w-1/2 mr-3">
                  <img
                    :src="album.image_url || '/img-placeholder.png'"
                    :alt="album.nome"
                    class="object-cover object-center w-52 h-52 mt-3 rounded-md mr-5"
                  />
                </div>
                <div class="flex flex-col w-1/2">
                  <h3 class="text-xl font-bold">{{ album.nome }}</h3>
                  <p class="text-gray-400 font-bold">{{ album.artista }}</p>
                  <p class="text-gray-400">{{ formatDate(album.data_lanc) }}</p>
                  <nuxt-link
                    :to="'/album/' + album.id"
                    class="btn btn-primary text-white mt-3"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    Ver Detalhes
                  </nuxt-link>
                  <button
                    @click="openDeleteModal(album)"
                    class="btn btn-error text-white mt-1"
                  >
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

        <ExcluirAlbum
          v-if="isRemoving && selectedAlbum"
          :album="selectedAlbum"
          @fecharModal="closeDeleteModal"
          @confirmarExclusao="handleConfirmarExclusao"
        />

        <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { type Album } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      albums: [] as Album[],
      loading: false,
      error: false,
      errorMessage: '',
      selectedAlbum: null as Album | null,
      isRemoving: false,
      userID: localStorage.getItem('userID') || '',
      jwtToken: '',
    };
  },
  beforeMount() {
    const cookieToken = useCookie('jwtToken');
    this.jwtToken = cookieToken.value as string;
  },
  methods: {
    async fetchAlbums() {
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/user/album/${this.userID}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar os álbuns');
        }
        this.albums = await response.json();
      } catch (error) {
        console.error('Erro ao carregar os álbuns:', error.message);
        this.error = true;
        this.errorMessage = 'Ocorreu um erro ao carregar os álbuns.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString: string | number | Date) {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
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
    async handleConfirmarExclusao(albumId: number) {
      console.log('Confirmando exclusão do álbum:', albumId);
      await this.deleteAlbum(albumId);
      this.closeDeleteModal();
    },
    async deleteAlbum(albumId: number) {
      try {
        const response = await fetch(`https://starting-music.onrender.com/album/delete/${albumId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `${this.jwtToken}`,
          },
        });
        if (response.ok) {
          this.albums = this.albums.filter((album) => album.id !== albumId);
        } else {
          throw new Error('Erro ao excluir o álbum');
        }
      } catch (error) {
        console.error('Erro ao excluir o álbum:', error.message);
        this.error = true;
        this.errorMessage = 'Ocorreu um erro ao excluir o álbum.';
      }
    },
  },
  mounted() {
    this.fetchAlbums();
  },
};
</script>