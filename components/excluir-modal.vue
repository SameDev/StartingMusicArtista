<template>
  <section class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md">
    <div class="modal-box " >
      <div class="modal-action">
        <button @click="fecharModal()" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </div>
      <h3 class="font-bold text-xl">Você deseja mesmo excluir?</h3>
      <p class="py-4">Essa ação é irreversível! Se você confirmar não terá como recuperar novamente!</p>
      <p class="font-bold">Você está excluindo:</p>
      <div class="flex items-center justify-between m-3 p-3 bg-secondary rounded-md shadow-md">
          <div class="flex items-center">
            <img :src="getMusicImage(music.image_url)" :alt="music.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5">
            <div>
              <h3 class="text-xl font-bold">{{ music.nome }}</h3>
              <p class="text-gray-400 font-bold">{{ music.artista }}</p>
            </div>
          </div>
      </div>
        <button
          @click="confirmarExclusao"
          class="btn btn-error text-white w-full"
          :class="{ 'disabled': music.loadingBtn }"
          :disabled="music.loadingBtn"
        > 
        <div class="loading loading-spinner" v-if="music.loadingBtn"></div>
        <p v-else>Excluir</p>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  props: ['music'],
  methods: {
    confirmarExclusao() {
      this.music.loadingBtn = true;
      setTimeout(() => {this.$emit('confirmarExclusao', this.music.id)}, 200);
    },
    fecharModal() {
      this.$emit("fecharModal");
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
      this.music.image_url = "";
    },
  },
};
</script>