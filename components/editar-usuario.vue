<template>
    <div
      class="px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md z-2"
      @click.self="closeModal"
    >
      <div class="modal-box bg-base-200 p-10 rounded-sm shadow-xl z-4 text-center">
        <h2 class="text-xl font-bold mb-4">Editar Usuário</h2>
        <div class="modal-action">
          <button @click="closeModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </div>
        <form @submit.prevent="updateUser">
          <div class="flex flex-col mb-4">
            <label class="label">
              <span class="label-text">Nome</span>
            </label>
            <input type="text" v-model="editedUser.nome" class="input input-bordered" required />
  
            <label class="label mt-4">
              <span class="label-text">Email</span>
            </label>
            <input type="email" v-model="editedUser.email" class="input input-bordered" required />
  
            <label class="label mt-4">
              <span class="label-text">Cargo</span>
            </label>
            <select v-model="editedUser.cargo" class="select select-bordered" required>
              <option value="USUARIO">Usuário</option>
              <option value="ARTISTA">Artista</option>
              <option value="ADMIN">Administrador</option>
            </select>
  
            <error v-if="error" error-message="Erro ao atualizar o usuário!" />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn btn-success text-white">
              Atualizar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    props: ['user'],
    data() {
      return {
        editedUser: {
          nome: this.user.nome,
          email: this.user.email,
          cargo: this.user.cargo,
        },
        jwtToken: '',
        error: false,
      };
    },
    beforeMount() {
      this.jwtToken = useCookie('jwtToken').value as string;
    },
    methods: {
      async updateUser() {
        try {
          const response = await fetch(`https://starting-music.onrender.com/user/update/${this.user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: this.jwtToken || '',
            },
            body: JSON.stringify(this.editedUser),
          });
  
          if (response.ok) {
            const updatedUser = await response.json();
            this.$emit('user-updated', updatedUser);
            this.closeModal();
          } else {
            this.error = true;
            console.error('Erro ao atualizar o usuário:', response.statusText);
          }
        } catch (error) {
          this.error = true;
          console.error('Erro durante a atualização do usuário:', error.message);
        }
      },
      closeModal() {
        this.$emit('close');
      },
    },
  };
  </script>
  