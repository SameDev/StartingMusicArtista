<template>
  <Sidebar v-if="isLogged"></Sidebar>
  <div class="container justify-center items-center content-center mx-auto bg-secondary w-full p-7 m-10 rounded-md font-nunito">
    <div v-if="isLogged">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img class="w-20 h-20 mr-4 rounded-full" :src="userPic" :alt="'Foto de perfil de '+userNome" />
          <h2 class="font-bold font-roboto">{{ userNome }}</h2>
        </div>
        <div class="logout text-2xl cursor-pointer" @click="logout">
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
        </div>
      </div>

      <div class="divider font-bold">ADICIONAR MÚSICA</div>

      <form @submit.prevent="enviarMusica">
        <div class="mb-4">
          <label for="nome" class="block text-white font-bold text-sm mb-2">Nome da Música</label>
          <input type="text" id="nome" v-model="nome" class="input input-bordered w-full">
        </div>

        <div class="mb-4">
          <label for="artista" class="block text-white font-bold text-sm mb-2">Nome do Artista</label>
          <input type="text" id="artista" v-model="artista" class="input input-bordered w-full">
        </div>
        <div class="mb-4">
          <label for="imageUrl" class="block text-white font-bold text-sm mb-2">URL da Imagem:</label>
          <input type="text" id="imageUrl" v-model="imageUrl" class="input input-bordered w-full">
        </div>
        
        <div class="mb-4">
          <label for="url" class="block text-white font-bold text-sm mb-2">URL do Audio:</label>
          <input type="text" id="url" v-model="url" class="input input-bordered w-full">
        </div>

        <div class="mb-4">
          <label for="tags" class="block text-white font-bold text-sm mb-2">Tags da Música</label>
          <Vueform v-model="selectedTags">
            <MultiselectElement
              name="tags"
              track-by="label"
              :search="true"
              placeholder="Selecione as tags"
              :native="false"
              :items="allTags"
              :multiple-label="(values: string | any[]) => `${values.length} Tags selecionadas`"
            ></MultiselectElement>
          </Vueform>
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
</template>

<script lang="ts">
import type { Music, Tags } from '~/interfaces/apiRef';

export default {
    data() {
        return {
            isLogged: false,
            jwtToken: "" as string,
            userEmail: localStorage.getItem("userEmail") || "",
            userPic: localStorage.getItem("userPic") || undefined,
            userNome: localStorage.getItem("userNome") || "",
            userID: localStorage.getItem("userID") || "",
            nome: "",
            artista: "",
            url: "",
            imageUrl: "",
            duracao: "",
            tags: [] as Tags[],
            selectedTags: { "tags": [] } as { tags: number[] }, 
            allTags: [] as Tags[],
            success: false,
            successMessage: "",
            error: false,
            errorMessage: "",
            loading: false
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
        logout() {
            const cookie = useCookie('jwtToken');
            cookie.value = "";
            this.$router.push('/').then(() => window.location.reload());
        },
        async enviarMusica() {
          this.loading = true;
            try {
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
                        tags: this.selectedTags.tags,
                        artistaId: [parseInt(this.userID)],
                    })
                });
                if (response.ok) {
                    this.loading = false;
                    this.success = true;
                    this.successMessage = "Música Enviada!";
                    
                }
                else {
                  this.loading = false;
                  this.error = true;
                  this.errorMessage = "Ocorreu um erro, verifique se enviou todos os campos!"
                }
            }
            catch (error: any) {
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
                      JSON.stringify({ value: tag.id, label: tag.nome })
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
        async verificaImg() {
          this.userPic = localStorage.getItem("userPic") || "";

          if (this.userPic === undefined || this.userPic === "" || this.userPic === null || this.userPic === "null") {
              this.userPic = '/user-placeholder.jpeg';
          }
        }
    },
    async mounted() {
      await this.fetchTags();
      await this.verificaImg();
      
    },
};
</script>
