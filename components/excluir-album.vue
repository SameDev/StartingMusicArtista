<template>
  <section class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md">
    <div class="modal-box">
      <div class="modal-action">
        <button @click="fecharModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </div>
      <h3 class="font-bold text-xl">Você deseja mesmo excluir?</h3>
      <p class="py-4">Essa ação é irreversível! Se você confirmar, não terá como recuperar novamente!</p>
      <p class="font-bold">Você está excluindo:</p>
  
      <div v-if="album" class="flex items-center justify-between m-3 p-3 bg-secondary rounded-md shadow-md">
        <div class="flex items-center">
          <img :src="album.image_url || '/img-placeholder.png'" :alt="album.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5" v-if="album.image_url">
          <div>
            <h3 class="text-xl font-bold">{{ album.nome }}</h3>
            <p class="text-gray-400 font-bold">{{ album.artista }}</p>
          </div>
        </div>
      </div>
      <p v-else>Álbum não disponível.</p>

      <button
        @click="confirmarExclusao"
        class="btn btn-error text-white w-full"
        :class="{ 'disabled': loadingBtn }"
        :disabled="loadingBtn"
      >
        <div class="loading loading-spinner" v-if="loadingBtn"></div>
        <p v-else>Excluir</p>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    album: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loadingBtn: false,
    };
  },
  methods: {
    fecharModal() {
      this.$emit('fecharModal');
    },
    async confirmarExclusao() {
      this.loadingBtn = true;
      try {
        await this.$emit('confirmarExclusao', this.album.id);
        this.fecharModal();
      } catch (error) {
        console.error('Erro ao excluir álbum:', error);
      } finally {
        this.loadingBtn = false;
      }
    },
  },
};
</script>