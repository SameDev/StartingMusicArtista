<template>
  <div class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md z-2" @click.self="closeModal">
    <div class="modal-content bg-base-200 p-10 rounded-sm shadow-xl z-4">
      <h2 class="text-xl font-bold mb-4"><font-awesome-icon :icon="['fas', 'tags']" /> Adicionar Nova Tag</h2>
      <form @submit.prevent="addNewTag">
        <div class="flex flex-col mb-4">
          <label for="tagName" class="font-bold"><font-awesome-icon :icon="['fas', 'tag']" /> Nome da Tag:</label>
          <input type="text" id="tagName" v-model="tagName" class="input" required>
        </div>
        <div class="flex justify-end">
          <button type="submit" class="btn btn-success font-bold text-white"><font-awesome-icon :icon="['fas', 'plus']" /> Adicionar</button>
          <button @click="closeModal" class="btn btn-error ml-2 font-bold text-white"><font-awesome-icon :icon="['fas', 'xmark']" /> Cancelar</button>
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
      jwtToken: ""
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
          console.error("Erro ao adicionar nova tag:", response.statusText);
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