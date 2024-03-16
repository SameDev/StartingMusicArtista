<template>
  <div class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md z-2" @click.self="closeModal">
    <div class="modal-box bg-base-200 p-10 rounded-sm shadow-xl z-4">
      <h2 class="text-xl font-bold mb-4"><font-awesome-icon :icon="['fas', 'tags']" /> Adicionar Nova Tag</h2>
      <div class="modal-action">
        <button @click="closeModal()" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </div>
      <form @submit.prevent="addNewTag">
        <div class="flex flex-col mb-4">
          <input type="text" id="tagName" v-model="tagName" class="input" required>
          <error v-if="error" error-message="Já existe uma tag com esse nome!"/>
        </div>
        <div class="flex justify-end">
          <button type="submit" class="btn btn-success text-white"><font-awesome-icon :icon="['fas', 'plus']" /> Adicionar Nova Tag</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tagName: '',
      jwtToken: "",
      error: false
    };
  },
  beforeMount() {
    this.jwtToken = useCookie("jwtToken").value;
  },
  methods: {
    async addNewTag() {
      try {
        const response = await fetch("https://starting-music.onrender.com/tags/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": this.jwtToken || ""
          },
          body: JSON.stringify({ nome: this.tagName })
        });
        
        if (response.ok) {
          const newTag = await response.json();
          this.$emit('tag-added', newTag);
          this.tagName = '';
          this.closeModal();
        } else {
          this.error = true
          console.error("Erro ao adicionar nova tag");
        }
      } catch (error) {
        console.error("Erro durante a criação da nova tag:", error.message);
      }
    },
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>