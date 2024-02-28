<template>
  <section class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md ">
    <div class="modal-box bg-base-200 p-10 rounded-sm shadow-xl z-4" >
      <div class="modal-action">
        <button @click="fecharModal()" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </div>
      <h3 class="font-bold text-xl">Você deseja mesmo excluir?</h3>
      <p class="py-4">Essa ação é irreversível! Se você confirmar não terá como recuperar novamente!</p>
      <p class="font-bold">Você está excluindo:</p>
      <div class="flex items-center justify-between py-3 my-3 bg-secondary-100">
          <div class="flex items-center">
            <div>
              <span class="bg-neutral text-secondary font-bold text-xl px-4 py-2">{{ tag.id }}</span>
              <span class="font-bold text-xl mx-2">{{ tag.nome }}</span>
            </div>
          </div>
      </div>
        <button
          @click="confirmarExclusao"
          class="btn btn-error text-white w-full"
          :class="{ 'disabled': loading }"
          :disabled="loading"
        >
        <p v-if="!loading">Excluir</p>
        <span v-else class="loading loading-spinner loading-lg"></span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  props: ['tag'],
  data() {
    return {
      tagName: '',
      jwtToken: "",
      error: false,
      loading: false
    };
  },
  beforeMount() {
    this.jwtToken = useCookie("jwtToken").value as string;
  },
  methods: {
    async confirmarExclusao() {
      this.loading = true;
      try {
        const response = await fetch(`https://starting-music.onrender.com/tags/delete/${this.tag.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": this.jwtToken || ""
          },
        });
        
        if (response.ok) {
          this.$emit('tag-removed', this.tag);
          this.fecharModal();
        } else {
          console.error("Erro ao excluir a tag:", response.statusText);
        }
      } catch (error) {
        console.error("Erro durante a exclusão da tag:", error.message);
      }
    },
    fecharModal() {
      this.$emit("close");
    }
  }
};
</script>