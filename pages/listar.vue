<template>
  <div class="container mx-auto p-7 m-10 rounded-md">
    <h2 class="text-center font-bold text-3xl">Lista de Músicas</h2>

    <div v-if="musics && musics.length > 0" class="mt-5 flex flex-wrap justify-center">
      <div v-for="music in musics" :key="music.id" class="m-3 p-3 bg-secondary w-1/3 rounded-md">
        <div class="flex flex-col items-center">
          <img :src="music.image_url" :alt="music.nome" class="h-62 w-72 object-cover mt-3 rounded-md">
          <h3 class="text-xl font-bold">{{ music.nome }}</h3>
          <p class="text-gray-400 font-bold">{{ music.artista }}</p>
          <p>{{ music.id }}</p>
          <p>{{ music.tags }}</p>
          <audio :src="music.url" controls class="mt-3 w-full"></audio>
        </div>
      </div>
    </div>

    <div v-else>
      Nenhuma música encontrada.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {type Music} from "../interfaces/apiRef"

const musics = ref<Music[]>([]);

onMounted(async () => {
  try {
    const response = await fetch('https://starting-music.onrender.com/music');
    if (response.ok) {
      const data = await response.json();
      const songs = data.songs || [];
      musics.value = songs;
    } else {
      console.error('Erro ao obter músicas da API:', response.statusText);
    }
  } catch (error: any) {
    console.error('Erro na requisição:', error.message);
  }
});
</script>