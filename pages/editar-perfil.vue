<template>
  <div v-if="isLogged">
    <Sidebar/>
    <section class="2xl:ml-80 px-10 py-5">
      <Header page="Editar Perfil" icon="user-pen"></Header>
      <div class="card card-compact w-full bg-base-100 shadow-xl relative">
        <figure class="w-full"><nuxtImg class="w-full" src="/banner.jpg"/></figure>
        <div class="avatar absolute bottom-[9.5rem] left-1">
          <div class="w-24 rounded-full">
            <img :src="getUserImage(userPic)" />
          </div>
        </div>

        <div class="card-body mt-12">
          <h2 class="card-title">{{ userName }}</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">Editar Perfil</button>
          </div>
        </div>
      </div>
    </section>
    
  </div>
  <span class="container justify-center items-center content-center bg-secondary w-full p-7 m-10 rounded-md font-nunito block" v-else>
    Você não pode acessar essa página, <nuxt-link to="/" class="underline">Faça Login</nuxt-link>
  </span>
</template>

<script lang="ts">
export default {
  data() {
    return {
      loading: false,
      jwtToken: "",
      isLogged: false,
      isEditing: false, 
      isRemoving: false,
      userPic: localStorage.getItem("userPic") || "",
      userName: localStorage.getItem("userNome") || "Você não tem nome?"
    };
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

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
  }
}


</script>