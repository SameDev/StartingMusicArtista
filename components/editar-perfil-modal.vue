<template>
  <div class="container justify-center items-center content-center mx-auto bg-base-200 w-full shadow-xl p-7 m-10 rounded-2xl font-nunito">
    <h2 class="text-center font-bold text-xl mb-5">Editar Seu Perfil</h2>
    <form @submit.prevent="editarUser">
      <div class="mb-4">
        <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'address-card']" /> Nome de Perfil:</label>
        <input type="text" id="nome" v-model="userNome" class="input input-bordered text-white  bg-accent w-full">
      </div>
      <div class="mb-4">
        <label for="desc" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'user-pen']" /> Descrição do seu perfil:</label>
        <textarea id="desc" v-model="userDesc" class="textarea textarea-bordered w-full text-white  bg-accent" placeholder="Bio"></textarea>
      </div>
      <div class="mb-4">
        <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'image-portrait']" /> Url da Foto de Perfil:</label>
        <input type="text" id="nome" v-model="userPic" class="input input-bordered text-white  bg-accent w-full">
      </div>
      <div class="mb-4">
        <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'id-card-clip']" /> Url da Foto do Banner:</label>
        <input type="text" id="nome" v-model="userPic" class="input input-bordered text-white  bg-accent w-full">
      </div>
      <div class="mb-4">
        <label for="tags" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'user-tag']" /> Tags da Música</label>
        <MultiSelect v-model="userTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
      </div>

      <button class="btn btn-primary w-full"><font-awesome-icon :icon="['fas', 'user-pen']" />Editar Perfil</button>
    </form>
  </div>
</template>

<script lang="ts">
import type { Tags, User } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      userPic: localStorage.getItem("userPic") || "",
      userTags: JSON.parse(localStorage.getItem("userTags") || "[]"),
      userNome: localStorage.getItem("userNome") || "Você não tem nome?",
      userDesc: localStorage.getItem("userDesc") || "Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!",
      allTags: [] as Tags[]
    }
  },
  beforeMount() {
    this.fetchTags()

    this.userTags = (this.userTags || []).map((tag: { nome: any; id: any; }) => ({ name: tag.nome, code: tag.id }));
    if (!this.userDesc || this.userDesc == "null") {
      this.userDesc = "";
    }
    if (!this.userPic || this.userPic == "null") {
      this.userPic = "";
    } 
  },
  methods: {
    async editarUser() {
      
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
  }
}
</script>