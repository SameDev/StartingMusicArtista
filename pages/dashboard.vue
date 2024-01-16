<template>
  <div class="container justify-center items-center content-center mx-auto bg-secondary w-full p-7 m-10 rounded-md">
    <div v-if="userEmail && userPic && userNome">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img class="w-20 mr-4 rounded-full" :src="userPic" :alt="'Foto de perfil de '+userNome" />
          <h2 class="font-bold">{{ userNome }}</h2>
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
          <label class="block text-white font-bold text-sm mb-2">Tags da Música</label>
          <div v-for="tag in allTags" :key="tag.id" class="flex items-center">
            <input type="checkbox" v-model="tag.ativo" class="mr-2 toggle toggle-accent">
            <label class="text-white">{{ tag.nome }}</label>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-white font-bold text-sm mb-2">Tags da Música</label>
          <div v-for="tag in allTags" :key="tag.id" class="flex items-center">
            <input type="checkbox" v-model="tag.ativo" class="mr-2 toggle toggle-accent">
            <label class="text-white">{{ tag.nome }}</label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Enviar Música</button>
        <nuxt-link class="underline" to="/listar">Veja todas Músicas!</nuxt-link>
        
        <div v-if="success" class="divider"></div>
        <div v-if="success" role="alert" class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Música enviada com sucesso!</span>
        </div>
      </form>
    </div>

    <div v-else>
      Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';


export default {
  data() {
    return {
      userEmail: localStorage.getItem("userEmail") || "",
      userPic: localStorage.getItem("userPic") || "",
      userNome: localStorage.getItem("userNome") || "",
      userID: localStorage.getItem("userID") || "",
      nome: "",
      artista: "",
      url: "",
      imageUrl: "",
      duracao: "",
      tags: [] as Tags[],
      artistaId: [] as number[],
      allTags: [] as { id: number, nome: string, ativo: boolean }[],
      success: false
    };
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/').then(() => window.location.reload());
    },
    async enviarMusica() {
      try {
        const response = await fetch("https://starting-music.onrender.com/music/create", {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("jwtToken") || ""
          }),
          body: JSON.stringify({
            nome: this.nome,
            artista: this.artista,
            userId: this.userID,
            url: this.url,
            imageUrl: this.imageUrl,
            duracao: this.duracao,
            tags: this.allTags.filter(tag => tag.ativo).map((tag: { id: number }) => tag.id), // Tipo explícito para 'tag'
            artistaId: this.artistaId,
          })
        });

        if (response.ok) {
          this.success = true;
        } else {
          throw new Error("Erro ao enviar a música. Verifique os detalhes da solicitação.");
        }
      } catch (error: any) {
        console.error("Erro durante o envio da música:", error.message);
      }
    },
    async fetchTags() {
      try {
        const response = await fetch("https://starting-music.onrender.com/tags");
        if (response.ok) {
          const tagsData = await response.json();
          this.allTags = tagsData.tags.map((tag: { id: number; nome: string }) => ({ ...tag, ativo: false })); // Tipo explícito para 'tag'
        } else {
          console.error("Falha ao buscar tags da API");
        }
      } catch (error: any) {
        console.error("Erro durante a busca de tags:", error.message);
      }
    },
  },
  async mounted() {
    await this.fetchTags();
  },
};
</script>
