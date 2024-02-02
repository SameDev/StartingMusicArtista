<template>
  <div v-if="isLogged" class="overflow-x-hidden">
    <Sidebar/>
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Editar Perfil" icon="user-pen"></Header>
      <div class="card card-compact w-full bg-base-200 shadow-xl relative">
        <figure class="w-full shadow-inner"><nuxtImg class="w-full" src="/banner.jpg"/></figure>
        <div class="avatar absolute md:bottom-48 bottom-56 left-1 shadow-2xl">
          <div class="w-24 rounded-full shadow-2xl">
            <img :src="getUserImage(userPic)" />
          </div>
        </div>

        <div class="card-body mt-12">
          <h2 class="card-title text-5xl font-nunit font-bold text-white">{{ userName }}</h2>
          <p class="card-desc">{{ userDesc }}</p>
          <div class="tags inline-block">
            <span class="badge badge-accent badge-outline" v-for="tag in userTags" :key="tag.id">{{ tag.nome }}</span>
          </div>
          <div class="card-actions justify-end">
            <button @click="openEditModal()" class="btn btn-primary"><font-awesome-icon :icon="['fas', 'user-pen']" /> Editar Perfil</button>
          </div>
        </div>
      </div>

      <EditarPerfilModal/>

    </section>
    
  </div>
  <span class="container justify-center items-center content-center bg-secondary w-full p-7 m-10 rounded-md font-nunito block" v-else>
    Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
  </span>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      loading: false,
      jwtToken: "",
      isLogged: false,
      isEditing: false, 
      isRemoving: false,
      userPic: localStorage.getItem("userPic") || "",
      userTags: JSON.parse(localStorage.getItem("userTags") || "[]") as Tags[],
      userName: localStorage.getItem("userNome") || "Você não tem nome?",
      userDesc: localStorage.getItem("userDesc") || "Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!"
    };
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    if(!this.userDesc || this.userDesc == "null") {
      this.userDesc = "Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!";
    }

    if (this.jwtToken || this.jwtToken != "") {
      this.isLogged = true;
    }
  },
  methods: {
    getUserImage(imageSrc: string): string {
      if (!imageSrc || imageSrc === "null") {
        return "/user-placeholder.jpeg";
      }

      const img = new Image();
      img.src = imageSrc;

      img.onerror = () => {
        this.userPic = "";
      };

      return imageSrc;
    },
    openEditModal() {

    }
  }
}


</script>