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
          <label for="tags" class="block text-white font-bold text-sm mb-2">Tags da Música</label>
          <select v-model="tags" id="tags" class="select select-bordered w-full max-w-xs" multiple>
            <option v-for="tag in allTags" :key="tag.id" :value="tag.id">{{ tag.nome }}</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary">Enviar Música</button>
      </form>
    </div>

    <div v-else>
      Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
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
      tags: [] as number[],
      artistaId: [] as number[],
      allTags: [] as Tags[],
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
            tags: this.tags,
            artistaId: this.artistaId,
          })
        });

        if (response.ok) {
          console.log("Música enviada com sucesso!");
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
          this.allTags = tagsData.tags;
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

