<template>
  <div>
    <div class="h-screen w-1/6 fixed top-0 left-0 transform transition-transform duration-300 ease-in-out p-5 bg-base-200 rounded-r-3xl rounded-br-3xl shadow-2xl justify-center items-center">
      <nav>
        <ul class="menu menu-lg">
          <li><nuxt-link to="/" class="text-white"><font-awesome-icon :icon="['fas', 'house']" /> Página Principal</nuxt-link></li>
          <li><nuxt-link to="/listar" class="text-white"><font-awesome-icon :icon="['fas', 'music']" /> Suas Músicas</nuxt-link></li>
          <li><nuxt-link to="/enviar-musica" class="text-white"><font-awesome-icon :icon="['fas', 'file-circle-plus']" /> Enviar Música</nuxt-link></li>
          <li><nuxt-link to="/editar-perfil" class="text-white"><font-awesome-icon :icon="['fas', 'user-pen']" /> Editar Perfil</nuxt-link></li>
          <li><nuxt-link v-if="userCargo === 'ADMIN'" to="/" class="text-white"><font-awesome-icon :icon="['fas', 'user-gear']" /> Gerenciar Usuarios</nuxt-link></li>
        </ul>
      </nav>
      <div class="logo flex items-center justify-center fixed bottom-0 left-0 w-full mb-5">
        <NuxtImg class="w-20 h-20" src="/logo.png"/>
        <h2 class="ml-4 font-bold font-nunit">Starting Music</h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isSidebarOpen = ref(false);
const userCargo = localStorage.getItem("userCargo") || "";

</script>
