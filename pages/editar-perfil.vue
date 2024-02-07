<template>
  <div class="overflow-x-hidden">
    <Sidebar />
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Editar Perfil" icon="user-pen"></Header>
      <div class="z-0 card card-compact w-full bg-base-200 shadow-xl relative">
        <figure class="w-full shadow-inner h-[400px]">
          <img class="w-full h-full object-cover object-center " @error="banner = false" @load="loadingImg = false" v-if="banner" :src="userBanner" :alt="'Banner de perfil de '+userName">
          <nuxtImg v-if="!banner" @error="loadingImg = true"  @load="loadingImg = false" class="w-full" src="/banner.jpg" />
          <div v-if="loadingImg == true" class="artboard artboard-horizontal phone-6">1024×320</div>
        </figure>
        
        <div class="avatar absolute md:bottom-60 bottom-96 left-1 shadow-2xl">
          <div class="w-24 rounded-full shadow-2xl">
            <img :src="getUserImage(userPic)" />
          </div>
        </div>

        <div class="card-body mt-12">
          <h2 class="card-title text-5xl font-nunit font-bold text-white">{{ userName }}</h2>
          <h2 class="card-desc text-lg font-nunit font-bold text-accent">{{ userEmail }}</h2>
          <p class="card-desc">{{ userDesc }}</p>
          <div class="tags inline-block">
            <span class="badge badge-accent badge-outline" v-for="tag in userTags" :key="tag.id">{{ tag.nome }}</span>
          </div>
          <div class="card-actions justify-end">
            <button @click="openEditModal()" class="btn btn-primary"><font-awesome-icon :icon="['fas', 'user-pen']" /> Editar Perfil</button>
          </div>
        </div>
      </div>

      <EditarPerfilModal 
      v-if="isEditing"
      :jwt-token="jwtToken"
      @perfil-editado="handlePerfil"
      @fechar-modal="handleCloseEditModal"/>

    </section>

  </div>
</template>

<script lang="ts" >
import type { Tags } from '~/interfaces/apiRef';


export default {
  data() {
    return {
      loading: false,
      jwtToken: "",
      isEditing: false, 
      isRemoving: false,
      userPic: "",
      userTags: [] as Tags[],
      userName: "Você não tem nome?",
      userDesc: "Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!",
      userId: localStorage.getItem("userId") || "",
      userCargo: "",
      userEmail: "",
      loadingImg: true,
      userBanner: "",
      banner: true,
    };
  },
  beforeMount() {
    if (process.client) {
      this.userEmail = localStorage.getItem("userEmail") || "";
      this.userPic = localStorage.getItem("userPic") || "";
      this.userName = localStorage.getItem("userNome") || "";
      this.userCargo = localStorage.getItem("userCargo") || "";
      this.userBanner = localStorage.getItem("userBanner") || "";
      this.userTags = JSON.parse(localStorage.getItem("userTags") || "[]") as Tags[]
    }
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    if(!this.userDesc || this.userDesc == "null") {
      this.userDesc = "Adicione uma descrição de impacto para seus ouvintes entenderem bem quem você é!";
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
      this.isEditing = true;
    },
    handleCloseEditModal() {
      this.isEditing = false;
    },
    handlePerfil() {
      this.$router.push('/editar-perfil').then(() => window.location.reload());
    }
  }
}

</script>