<template>
    <section class="z-3 px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md overflow-y-auto">
      <div class="container justify-center items-center content-center mx-auto bg-base-200 w-full shadow-lg p-7 m-10 rounded-md font-nunito">
        <div>
          <div class="w-full flex justify-between items-center">
            <div class="w-1/2">
              <h2 class="font-bold font-nunit-500">Adicionando nova música ao álbum:</h2>
            </div>
            <div class="text-3xl w-12 justify-center items-center p-2 flex h-12 bg-secondary rounded-full">
              <font-awesome-icon class="cursor-pointer" :icon="['fas', 'xmark']" @click="closeModal"/>
            </div>
          </div>
          <form @submit.prevent="adicionarMusica">
            <div class="mb-4">
              <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome da Música</label>
              <input type="text" id="nome" v-model="novaMusica.nome" class="input input-bordered text-white bg-accent w-full" required>
            </div>
            <div class="mb-4">
              <label for="artista" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome do Artista</label>
              <input type="text" id="artista" v-model="novaMusica.artista" class="input input-bordered bg-accent text-white w-full" required>
            </div>
            <div class="mb-4">
              <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Imagem:</label>
              <input type="file" id="imageUrl" @change="atualizarImagem" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*" required>
            </div>
            <div class="mb-4">
              <label for="audioFile" class="block text-white font-bold text-sm mb-2">Arquivo de Áudio:</label>
              <input type="file" id="audioFile" @change="atualizarAudio" ref="audioFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="audio/mp3" required>
            </div>
            <div class="mb-4">
              <label for="duracao" class="block text-white font-bold text-sm mb-2">Duração (mm:ss)</label>
              <input type="time"  id="duracao" v-model="novaMusica.duracao" class="input input-bordered bg-accent text-white w-full" placeholder="mm:ss" required>
            </div>
            <div class="mb-4">
              <span class="block text-white font-bold text-sm mb-2 font-roboto-500">Tags da Música</span>
              <MultiSelect id="tags" v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
            </div>
            <button type="submit" id="submit" class="btn btn-primary w-full">Adicionar Música</button>
            <div v-if="success" class="divider"></div> 
            <Success v-if="success" success-message="Música Adicionada!"/>
            <Error v-if="error" :error-message="errorMessage"/>
            <Loading v-if="loading"/>
          </form>
        </div>
      </div>
    </section>
  </template>
  
  <script lang="ts">
  import { uploadBytes, getDownloadURL } from '~/composables/firebase';
  import { type Tags, type Music } from '~/interfaces/apiRef';
  
  export default {
    props: {
      albumId: {
        type: Number,
        required: true
      },
      data_lanc: {
        type: Date,
        required: true
      }
    },
    data() {
      return {
        novaMusica: {
          nome: "",
          artista: "",
          image_url: "", 
          url: "", 
          tags: [] as Tags[],
          duracao: "" 
        } as Music,
        loading: false,
        selectedTags: [] as { name: string; code: number }[],
        allTags: [] as Tags[],
        success: false,
        error: false,
        errorMessage: "",
        jwtToken: "",
        audioFile: null as File | null,
      };
    },
    async beforeMount() {
      const cookieToken = useCookie("jwtToken");
      this.jwtToken = cookieToken.value as string;
  
      await this.fetchTags();
    },
    methods: {
      async adicionarMusica() {
        this.loading = true;
        try {
          let imageUrl = "";
          if (this.novaMusica.image_url) {
            const imageRef = FireRef(storage, `images/${this.novaMusica.nome}-${Date.now()}`);
            const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(this.novaMusica.image_url));
            imageUrl = await getDownloadURL(imageSnapshot.ref);
          }
  
          let audioUrl = "";
          if (this.audioFile) {
            const audioRef = FireRef(storage, `audio/${this.novaMusica.nome}-${Date.now()}`);
            const audioSnapshot = await uploadBytes(audioRef, this.audioFile);
            audioUrl = await getDownloadURL(audioSnapshot.ref);
          }
  
          const tagsIds = this.selectedTags.map(tag => tag.code) || [];
  
          const response = await fetch(`https://starting-music.onrender.com/album/${this.albumId}/add-song`, {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/json",
              "Authorization": this.jwtToken || ""
            }),
            body: JSON.stringify({
              nome: this.novaMusica.nome,
              artista: this.novaMusica.artista,
              url: audioUrl,
              data_lanc: this.data_lanc,
              imageUrl: imageUrl,
              duracao: this.novaMusica.duracao,
              tags: tagsIds
            })
          });
  
          if (response.ok) {
            this.loading = false;
            this.success = true;
            setTimeout(() => {
              this.$emit('musicaAdicionada', this.novaMusica);
            }, 200);
          } else {
            this.loading = false;
            this.error = true;
            this.errorMessage = "Ocorreu um erro, verifique se enviou todos os campos!";
          }
        } catch (error: any) {
          this.loading = false;
          this.error = true;
          this.errorMessage = "Ocorreu um erro no servidor!";
          console.log(error.message);
        }
      },
      async fetchTags() {
        try {
          const response = await fetch("https://starting-music.onrender.com/tags");
          if (response.ok) {
            const tagsData = await response.json();
            const uniqueTagsSet = new Set(tagsData.tags.flatMap((tag: Tags) =>
              JSON.stringify({ name: tag.nome, code: tag.id })
            ));
  
            this.allTags = Array.from(uniqueTagsSet).map((tag) => JSON.parse(tag as string));
          } else {
            console.error("Falha ao buscar tags da API");
          }
        } catch (error: any) {
          console.error("Erro durante a busca de tags:", error.message);
        }
      },
      closeModal() {
        this.$emit('fecharModal');
      },
      atualizarImagem(event: Event) {
        const imageFile = (event.target as HTMLInputElement).files?.[0];
        if (imageFile) {
          const imageReader = new FileReader();
          imageReader.onloadend = () => {
            this.novaMusica.image_url = imageReader.result as string;
          };
          imageReader.readAsDataURL(imageFile);
        }
      },
      atualizarAudio(event: Event) {
        const audioFile = (event.target as HTMLInputElement).files?.[0];
        if (audioFile) {
          if (audioFile.size > 5 * 1024 * 1024) {
            this.error = true;
            this.errorMessage = "O tamanho do arquivo de áudio não pode exceder 5MB.";
            return;
          }
          this.audioFile = audioFile;
        }
      },
      dataURLtoBlob(dataURL: string) {
        const parts = dataURL.split(';base64,');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1];
  
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
  
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }
  
        return new Blob([arrayBuffer], { type: mimeString });
      }
    }
  };
  </script>
  
  <style scoped>
  body {
    overflow-y: hidden;
  }
  </style>
  