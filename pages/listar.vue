<template>
  <div class="container mx-auto p-7 m-10 rounded-md">
    <h2 class="text-center font-bold text-3xl">Lista de Músicas</h2>

    <div v-if="musics && musics.length > 0" class="mt-5">
      <div v-for="music in musics" :key="music.id" class="mb-5 p-3 bg-secondary rounded-md">
        <h3 class="text-xl font-bold">{{ music.nome }}</h3>
        <p class="text-gray-500">{{ music.nomeArtista }}</p>
        <img :src="music.image_url" :alt="music.nome" class="w-50 h-40 object-cover mt-3 rounded-md">
        <audio :src="music.url" controls class="mt-3 w-full"></audio>
      </div>
    </div>

    <div v-else>
      Nenhuma música encontrada.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

interface Music {
  id: number;
  nome: string;
  nomeArtista: string;
  image_url: string;
  url: string;
}

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
