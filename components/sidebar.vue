<template>
  <div>
    <a @click="toggleSidebar" class=" text-xl cursor-pointer text-white m-5 fixed btn btn-base-100 top-0 left-0 z-2">
      <font-awesome-icon :icon="['fas', 'bars']" /> 
    </a>
    <div
      :class="{ 'translate-x-0': !isSidebarOpen, '-translate-x-full': isSidebarOpen }"
      class="h-screen 2xl:w-1/6 z-2 fixed top-0 left-0 transform transition-transform duration-300 ease-in-out p-5 bg-base-300 rounded-r-3xl rounded-br-3xl shadow-2xl justify-center items-center"
    >
      <div
        @click="toggleSidebar"
        class="absolute top-2 right-2 text-2xl btn btn-sm btn-circle btn-ghost"
        v-if="!closeModalBtn"
      >
        <font-awesome-icon :icon="['fas', 'xmark']" />
      </div>
      <nav>
        <ul class="menu menu-lg mt-2">
          <li>
            <nuxt-link to="/" class="text-white">
              <font-awesome-icon :icon="['fas', 'house']" /> Página Principal
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/listar" class="text-white">
              <font-awesome-icon :icon="['fas', 'music']" /> Suas Músicas
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/enviar-musica" class="text-white">
              <font-awesome-icon :icon="['fas', 'file-circle-plus']" /> Enviar Música
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/cadastrar-album" class="text-white">
              <font-awesome-icon :icon="['fas', 'record-vinyl']" /> Cadastrar Álbum
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/editar-perfil" class="text-white">
              <font-awesome-icon :icon="['fas', 'user-pen']" /> Editar Perfil
            </nuxt-link>
          </li>
          <!-- ADMIN -->
          <div v-if="userCargo === 'ADMIN'" class="divider"><font-awesome-icon :icon="['fas', 'user-secret']" /> ADMIN</div>
          <li v-if="userCargo === 'ADMIN'">
            <nuxt-link  to="/" class="text-white">
              <font-awesome-icon :icon="['fas', 'user-gear']" /> Gerenciar Usuarios
            </nuxt-link>
          </li>
          <li v-if="userCargo === 'ADMIN'">
            <nuxt-link  to="/gerenciar-tags" class="text-white">
              <font-awesome-icon :icon="['fas', 'tags']" /> Gerenciar Tags
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <div class="logo flex items-center justify-center fixed bottom-0 left-0 w-full mb-5">
        <NuxtImg class="w-20 h-20" src="/logo.png" />
        <h2 class="ml-4 font-bold font-nunit">Starting Music</h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const isSidebarOpen = ref(false);
    const closeModalBtn = ref(false)
    var userCargo = "";
    userCargo = useCookie("cargoUser").value || "";

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    const handleResize = () => {
      if (window.innerWidth >= 1500) {
        isSidebarOpen.value = false;
        closeModalBtn.value = true;
      } else {
        isSidebarOpen.value = true;
        closeModalBtn.value = false;
      }
    };
    onBeforeMount(() => {
      window.addEventListener('resize', handleResize);
      handleResize();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    return { isSidebarOpen, toggleSidebar, userCargo, handleResize, closeModalBtn, window };
  },
};
</script>
