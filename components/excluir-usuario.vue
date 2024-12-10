<template>
  <section
    class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md"
  >
    <div class="modal-box bg-base-200 p-10 rounded-sm shadow-xl z-4 relative">
      <div class="modal-action">
        <button
          @click="fecharModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
      </div>
      <h3 class="font-bold text-xl">Você deseja mesmo excluir?</h3>
      <p class="py-4">
        Essa ação é irreversível! Se você confirmar, não terá como recuperar
        novamente.
      </p>
      <p class="font-bold">Você está excluindo:</p>
      <div class="flex items-center justify-between py-3 my-3 bg-secondary-100 px-4 rounded-md">
        <div class="flex items-center">
          <div class="avatar">
            <div class="w-12 rounded-full">
              <img :src="user?.foto_perfil || '/user-placeholder.jpeg'" />
            </div>
          </div>
          <span class="font-bold text-lg mx-3">{{ user?.nome }}</span>
        </div>
      </div>
      <button
        @click="confirmarExclusao"
        class="btn btn-error text-white w-full"
        :class="{ disabled: loading }"
        :disabled="loading"
      >
        <span v-if="!loading">Excluir</span>
        <span v-else class="loading loading-spinner loading-lg"></span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      jwtToken: "",
      loading: false,
    };
  },
  beforeMount() {
    this.jwtToken = useCookie("jwtToken").value as string;
  },
  methods: {
    async confirmarExclusao() {
      if (!this.user?.id) {
        console.error("Usuário inválido para exclusão");
        return;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `https://starting-music.onrender.com/user/delete/${this.user.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.jwtToken || "",
            },
          }
        );

        if (response.ok) {
          console.log("Usuário excluído com sucesso:", this.user);
          this.$emit("user-removed", this.user);
          this.fecharModal();
        } else {
          console.error("Erro ao excluir o usuário:", response.statusText);
        }
      } catch (error: any) {
        console.error("Erro durante a exclusão do usuário:", error.message);
      } finally {
        this.loading = false;
      }
    },
    fecharModal() {
      this.$emit("close");
    },
  },
};
</script>
