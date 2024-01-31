<template>
  <Sidebar v-if="isLogged"></Sidebar>
  <section class="2xl:ml-80 px-10 py-5">
    <Header page="Enviar Música" icon="music"></Header>
    <div class="container justify-center items-center content-center mx-auto bg-base-300 w-full shadow-xl p-7 m-10 rounded-md font-nunito">
      <div v-if="isLogged">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center text-2xl">
            <img class="w-20 h-20 mr-4 rounded-full" :src="getImage(userPic, 'user')" :alt="'Foto de perfil de '+userNome" />
            <div>
              <h2 class="font-bold font-roboto text-md">{{ userNome }}</h2>
              <h2 class="font-roboto text-sm font-medium text-accent">{{ userCargo }}</h2>
            </div>
          </div>
          <div class="md:flex hidden items-center justify-between m-3 p-3 bg-secondary rounded-md">
              <div class="flex items-center pr-7">
                <img :src="getImage(picImg, 'music')" :alt="nome" class="object-cover object-center h-24 w-24 mt-3 rounded-md mr-5">
                <div>
                  <h3 v-if="nome" class="text-2xl font-bold">{{ nome }}</h3>
                  <h3 v-else class="text-xl font-bold">Nome da Sua Música</h3>
                  <p class="text-gray-400 font-bold text-xl">{{ artista }}</p>
                  <p v-if="date" class="font-bold text-purple-400 text-xs">{{ date }}</p>
                </div>
              </div>
          </div>
        </div>

        <div class="divider font-bold">ADICIONAR MÚSICA</div>

        <form @submit.prevent="enviarMusica">
          <div class="mb-4">
            <label for="nome" class="block text-white font-bold text-sm mb-2">Nome da Música</label>
            <input type="nome" id="nome" v-model="nome" class="input input-bordered bg-accent w-full text-white">
          </div>

          <div class="mb-4">
            <label for="artista" class="block text-white font-bold text-sm mb-2">Nome do Artista</label>
            <input type="artista" id="artista" v-model="artista" class="input input-bordered bg-accent w-full text-white">
          </div>
          <div class="mb-4">
            <label for="date" class="block text-white font-bold text-sm mb-2">Data De Lançamento</label>
            <input type="date" id="date" v-model="date" class="input input-bordered bg-accent w-full text-white">
          </div>
          <div class="mb-4">
            <label for="imageUrl" class="block text-white font-bold text-sm mb-2">URL da Imagem:</label>
            <input type="url" id="imageUrl" v-model="imageUrl" @change="atualizarImagem()" class="input input-bordered bg-accent w-full text-white">
          </div>
          
          <div class="mb-4">
            <label for="url" class="block text-white font-bold text-sm mb-2">URL do Audio:</label>
            <input type="url" id="url" v-model="url" class="text-white input input-bordered w-full bg-accent">
          </div>

          <div class="mb-4">
            <label for="tags" class="block text-white font-bold text-sm mb-2">Tags da Música</label>
              <MultiSelect v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
          </div>

          <button type="submit" class="btn btn-primary w-full">Enviar Música</button>
          
          <div v-if="success" class="divider"></div>
          <Success v-if="success" :sucess-message="successMessage"/>
          <Error v-if="error" :error-message="errorMessage"/>

          <Loading v-if="loading"/>
        </form>
      </div>

      <div v-else>
        Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
      </div>
    </div>
</section>
</template>

<script lang="ts">
import type { Music, Tags } from '~/interfaces/apiRef';
import MultiSelect from 'primevue/multiselect';


export default {
    data() {
        return {
            isLogged: false,
            jwtToken: "" as string,
            userEmail: localStorage.getItem("userEmail") || "",
            userPic: localStorage.getItem("userPic") || "",
            userNome: localStorage.getItem("userNome") || "",
            userID: localStorage.getItem("userID") || "",
            userCargo: localStorage.getItem("userCargo") || "",
            nome: "",
            artista: "",
            url: "",
            imageUrl: "",
            duracao: "",
            date: "" as unknown as Date, 
            tags: [] as Tags[],
            selectedTags: ref(), 
            allTags: [] as Tags[],
            success: false,
            successMessage: "",
            error: false,
            errorMessage: "",
            loading: false,
            tagsIds: [] as Number[],
            picImg: ""
        };
    },
    beforeMount() {
      const cookieToken = useCookie("jwtToken");
      this.jwtToken = cookieToken.value as string;

      if(this.jwtToken || this.jwtToken != '') {
        this.isLogged = true;
      }
    },
    methods: {
      async enviarMusica() {
        this.loading = true;
        try {
          if (this.selectedTags && this.selectedTags.length > 0) {
            this.tagsIds = this.selectedTags.map((tag: { code: number; }) => tag.code);
          }

          const response = await fetch("https://starting-music.onrender.com/music/create", {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/json",
              "Authorization": this.jwtToken || ""
            }),
            body: JSON.stringify({
              nome: this.nome,
              artista: this.artista,
              url: this.url,
              imageUrl: this.imageUrl,
              duracao: this.duracao,
              tags: this.tagsIds,
              data_lanc: this.date,
              artistaId: [parseInt(this.userID)],
            })
          });

          if (response.ok) {
            this.loading = false;
            this.success = true;
            this.successMessage = "Música Enviada!";
          } else {
            this.loading = false;
            this.error = true;
            this.errorMessage = "Ocorreu um erro, verifique se enviou todos os campos!";
          }
        } catch (error) {
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
      atualizarImagem() {
        this.picImg = this.imageUrl;
      },
      getImage(imageUrl: string, type: string) {
        if (!imageUrl || imageUrl === "null" || imageUrl === undefined || imageUrl === "") {
          if (type === 'user') {
            return "/user-placeholder.jpeg";
          } else {
            return "/img-placeholder.png"
          }
        }

        const img = new Image();
        img.src = imageUrl;

        img.onerror = () => {
          this.handleImageError();
        };

        return imageUrl;
      },
      handleImageError() {
        this.userPic = "";
        this.picImg = "";
      },
    },
    async mounted() {
      await this.fetchTags();
      this.artista = this.userNome;
    },
    
    components: {
      MultiSelect
    }
};
</script>
