<template>
  <section class="z-3 px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md overflow-y-auto">
    <div class="container justify-center items-center content-center mx-auto bg-base-200 w-full shadow-lg p-7 m-10 rounded-md font-nunito">
      <div>
        <div class="w-full flex justify-between items-center">
          <div class="w-1/2">
            <h2 class="font-bold font-nunit-500">Editando a música:</h2>
            <div class="flex items-center justify-between m-3 p-3 bg-secondary rounded-md">
                <div class="flex items-center">
                  <img :src="getMusicImage(editedMusic.image_url)" :alt="editedMusic.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5">
                  <div>
                    <h3 class="text-xl font-bold">{{ editedMusic.nome }}</h3>
                    <p class="text-gray-400 font-bold">{{ editedMusic.artista }}</p>
                    <p class="font-bold text-purple-400 text-xs">{{ date }}</p>
                    <div class="tags inline-block">
                      <span class="badge badge-accent badge-outline" v-for="tag in selectedTags" :key="tag.code">{{ tag.name }}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div class="text-3xl w-12 justify-center items-center p-2 flex h-12 bg-secondary rounded-full">
            <font-awesome-icon class="cursor-pointer" :icon="['fas', 'xmark']" @click="closeModal()"/>
          </div>
        </div>
        <form @submit.prevent="enviarMusica" >
          <div class="mb-4">
            <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome da Música</label>
            <input type="text" id="nome" v-model="editedMusic.nome" class="input input-bordered text-white  bg-accent w-full">
          </div>

          <div class="mb-4">
            <label for="artista" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome do Artista</label>
            <input type="text" id="artista" v-model="editedMusic.artista" class="input input-bordered bg-accent text-white  w-full">
          </div>
          <div class="mb-4">
            <label for="imageUrl" class="block text-white font-bold text-sm mb-2 font-roboto-500">URL da Imagem:</label>
            <input type="text" id="imageUrl" v-model="editedMusic.image_url" class="input input-bordered bg-accent w-full text-white">
          </div>
          
          <div class="mb-4">
            <label for="url" class="block text-white font-bold text-sm mb-2 font-roboto-500">URL do Áudio:</label>
            <input type="text" id="url" v-model="editedMusic.url" class=" input input-bordered w-full text-white  bg-accent">
          </div>

          <div class="mb-4">
            <label for="tags" class="block text-white font-bold text-sm mb-2 font-roboto-500">Tags da Música</label>
              <MultiSelect v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
          </div>

          <button type="submit" class="btn btn-primary w-full">Salvar Alterações</button>
          
          <div v-if="success" class="divider"></div> 
          <Success v-if="success" :sucess-message="successMessage"/>
          <Error v-if="error" :error-message="errorMessage"/>
          <Loading v-if="loading"/>
        </form>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { type Tags, type Music } from '~/interfaces/apiRef';

export default {
  props: {
    music: Object as () => Music,
  },
  data() {
    return {
      editedMusic: { ...this.music } as Music,
      loading: false,
      selectedTags: [] as { name: string; code: number }[],
      allTags: [] as Tags[],
      success: false,
      successMessage: "",
      error: false,
      errorMessage: "",
      jwtToken: "",
      date: "" as unknown as Date,
      tagsIds: [] as number[],
    };
  },
  async beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    this.selectedTags = (this.editedMusic.tags || []).map(tag => ({ name: tag.nome, code: tag.id }));
    await this.fetchTags();
  },
  mounted() {
    this.date = new Date(this.editedMusic.data_lanc);
    this.date = this.date.toLocaleDateString() as unknown as Date;
  },
  methods: {
    async enviarMusica() {
      this.loading = true;
        try {
          this.tagsIds = this.selectedTags.map(tag => tag.code) || [];

          const response = await fetch(`https://starting-music.onrender.com/music/update/${this.editedMusic.id}`, {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/json",
              "Authorization": this.jwtToken || ""
            }),
            body: JSON.stringify({
              nome: this.editedMusic.nome,
              artista: this.editedMusic.artista,
              url: this.editedMusic.url,
              imageUrl: this.editedMusic.image_url,
              tags: this.tagsIds,
              artistaId: (this.editedMusic.artistaId || []).map(id => String(id)),
            })
          });

        if (response.ok) {
          this.loading = false;
          this.success = true;
          this.successMessage = "Edições Salvas!";
          setTimeout(() => {
            this.$emit('musicaEditada', this.editedMusic);
          }, 200)
        } else {
          this.loading = false;
          this.error = true;
          this.errorMessage = "Ocorreu um erro, verifique se enviou todos os campos!";
        }
      } catch (error: any) {
        this.loading = false;
        this.error = true;
        this.errorMessage = "Ocorreu um erro no servidor!";
        console.log(error.message);
      }
    },
    async fetchTags() {
        try {
            const response = await fetch("https://starting-music.onrender.com/tags");
            if (response.ok) {
                const tagsData = await response.json();
                const uniqueTagsSet = new Set(tagsData.tags.flatMap((tag: Tags) =>
                  JSON.stringify({ name: tag.nome, code: tag.id })
                ));

                this.allTags = Array.from(uniqueTagsSet).map((tag) => JSON.parse(tag as string));


            }
            else {
                console.error("Falha ao buscar tags da API");
            }
        }
        catch (error: any) {
            console.error("Erro durante a busca de tags:", error.message);
        }
    },
    closeModal() {
      this.$emit('fecharModal');
    },
    getMusicImage(imageUrl: string) {
      if (!imageUrl || imageUrl === "null" || imageUrl === undefined || imageUrl === "") {
        return "/img-placeholder.png";
      }

      const img = new Image();
      img.src = imageUrl;

      img.onerror = () => {
        this.handleImageError();
      };

      return imageUrl;
    },
    handleImageError() {
      this.editedMusic.image_url = "";
    },
  },
};
</script>
