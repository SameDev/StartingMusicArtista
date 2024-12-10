<template>
    <div>
      <Sidebar />
      <section class="2xl:ml-[17%] md:p-10 p-5 md:pr-24 py-5">
        <Header page="Gerenciar Usuários" icon="users"></Header>
  
        <div class="container justify-center items-center content-center mx-auto bg-secondary w-full shadow-lg p-7 rounded-lg font-nunito">
          <div class="info flex justify-between items-center flex-wrap">
            <h2 class="font-bold text-xl">
              <font-awesome-icon :icon="['fas', 'users']" /> Ver Todos os Usuários do Sistema
            </h2>
          </div>
  
          <table class="table-fixed table-zebra md:table-auto w-full border-collapse text-center text-xl">
            <thead class="bg-primary text-white font-bold rounded-tr-2xl rounded-tl-2xl">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">Imagem</th>
                <th class="px-4 py-2">Nome</th>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Cargo</th>
                <th class="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users" :key="index">
                <td class="bg-accent border border-secondary text-secondary font-bold px-4 py-2">{{ user.id }}</td>
                <td class="px-4 py-2 font-bold font-roboto">
                  <div class="avatar">
                    <div class="w-24 rounded-full">
                      <img :src="user.foto_perfil || '/user-placeholder.jpeg'" />
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2 font-bold font-roboto">{{ user.nome }}</td>
                <td class="px-4 py-2">{{ user.email }}</td>
                <td class="px-4 py-2">{{ user.cargo }}</td>
                <td class="px-4 py-2 text-center">
                  <button @click="editUser(user)" class="btn btn-success text-white font-bold md:mr-2">
                    <font-awesome-icon :icon="['fas', 'pen']" /> <span class="hidden md:block">Editar</span>
                  </button>
                  <button @click="deleteUser(user)" class="btn btn-error text-white font-bold">
                    <font-awesome-icon :icon="['fas', 'trash']" /> <span class="hidden md:block">Excluir</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <EditarUsuario 
          v-if="showEditUserModal" 
          @close="closeEditUserModal" 
          @user-updated="handleUserUpdated" 
          :user="userToEdit" 
        />
        <ExcluirUsuario 
          v-if="showRemoveUserModal" 
          @user-removed="handleUserRemoved" 
          :user="userToRemove" 
          @close="closeRemoveUserModal" 
        />
      </section>
      <Loading v-if="loading" />
    </div>
  </template>
  
  <script lang="ts">
  import type { User } from '~/interfaces/apiRef';
  
  export default {
    data() {
      return {
        users: [] as User[],
        showRemoveUserModal: false,
        userToRemove: null as User | null,
        showEditUserModal: false,
        userToEdit: null as User | null,
        loading: false,
      };
    },
    beforeMount() {
      this.fetchUsers();
    },
    methods: {
      async fetchUsers() {
        try {
          this.loading = true;
          const response = await fetch(`https://starting-music.onrender.com/user`);
          if (response.ok) {
            const { user } = await response.json();
            this.users = user;
          } else {
            console.error('Falha ao buscar usuários da API');
          }
        } catch (error: any) {
          console.error('Erro durante a busca de usuários:', error.message);
        } finally {
          this.loading = false;
        }
      },
      deleteUser(user: User) {
        this.userToRemove = user;
        this.showRemoveUserModal = true;
      },
      handleUserRemoved(removedUser: User) {
        this.users = this.users.filter((u) => u.id !== removedUser.id);
        this.closeRemoveUserModal();
      },
      closeRemoveUserModal() {
        console.log("Fechando modal de exclusão");
        this.showRemoveUserModal = false;
        this.userToRemove = null;
      },
      editUser(user: User) {
        console.log("Abrindo modal de edição para o usuário:", user);
        this.userToEdit = user;
        this.showEditUserModal = true;
      },
      closeEditUserModal() {
        console.log("Fechando modal de edição");
        this.showEditUserModal = false;
        this.userToEdit = null;
      },
      handleUserUpdated(updatedUser: User) {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.$router.push('/gerenciar-usuarios').then(() => window.location.reload());
        this.closeEditUserModal();
      },
    },
  };
  </script>
  