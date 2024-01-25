<template>
  <a @click="toggleSidebar" class="text-xl cursor-pointer text-white m-5 fixed btn btn-base-100 top-0 left-0"><font-awesome-icon :icon="['fas', 'bars']" /></a>
  <div>
    <div v-if="isSidebarOpen" class="fixed inset-0 bg-black opacity-50" @click="toggleSidebar"></div>
    <div :class="{ 'translate-x-0': isSidebarOpen, '-translate-x-full': !isSidebarOpen }"
         class="h-screen w-80 fixed top-0 left-0 transform transition-transform duration-300 ease-in-out p-5 bg-base-200 rounded-r-3xl rounded-br-3xl shadow-xl">
      <nav>
        <ul class="menu menu-lg">
          <li><nuxt-link to="/" class="text-white"><font-awesome-icon :icon="['fas', 'house']" /> Página Principal</nuxt-link></li>
          <li><nuxt-link to="/listar" class="text-white"><font-awesome-icon :icon="['fas', 'music']" /> Suas Músicas</nuxt-link></li>
          <li><nuxt-link v-if="userCargo === 'ADMIN'" to="/" class="text-white"><font-awesome-icon :icon="['fas', 'user']" /> Gerenciar Usuarios</nuxt-link></li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isSidebarOpen = ref(false);
const userCargo = localStorage.getItem("userCargo") || "";

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
