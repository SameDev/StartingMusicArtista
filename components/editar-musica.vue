<template>
  <section class="z-3 px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md overflow-y-auto">
    <div class="container justify-center items-center content-center mx-auto bg-base-200 w-full shadow-lg p-7 m-10 rounded-md font-nunito">
      <div>
        <div class="w-full flex justify-between items-center">
          <div class="w-1/2">
            <h2 class="font-bold font-nunit-500">Editando a música:</h2>
            <div class="flex items-center justify-between m-3 p-3 bg-secondary rounded-md">
                <div class="flex items-center">
                  <img :src="getMusicImage(editedMusic.image_url)" :alt="editedMusic.nome" class="object-cover object-center h-20 w-20 mt-3 rounded-md mr-5">
                  <div>
                    <h3 class="text-xl font-bold">{{ editedMusic.nome }}</h3>
                    <p class="text-gray-400 font-bold">{{ editedMusic.artista }}</p>
                    <p class="font-bold text-purple-400 text-xs">{{ date }}</p>
                    <div class="tags inline-block">
                      <span class="badge badge-accent badge-outline" v-for="tag in selectedTags" :key="tag.code">{{ tag.name }}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div class="text-3xl w-12 justify-center items-center p-2 flex h-12 bg-secondary rounded-full">
            <font-awesome-icon class="cursor-pointer" :icon="['fas', 'xmark']" @click="closeModal()"/>
          </div>
        </div>
        <form @submit.prevent="enviarMusica" >
          <div class="mb-4">
            <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome da Música</label>
            <input type="text" id="nome" v-model="editedMusic.nome" class="input input-bordered text-white  bg-accent w-full">
          </div>

          <div class="mb-4">
            <label for="artista" class="block text-white font-bold text-sm mb-2 font-roboto-500">Nome do Artista</label>
            <input type="text" id="artista" v-model="editedMusic.artista" class="input input-bordered bg-accent text-white  w-full">
          </div>

          <div class="mb-4">
            <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Imagem:</label>
            <input type="file" id="imageUrl" @change="atualizarImagem" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*">
          </div>

          <div class="mb-4">
            <label for="audioFile" class="block text-white font-bold text-sm mb-2">Arquivo de Áudio:</label>
            <input type="file" id="audioFile" @change="atualizarAudio" ref="audioFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="audio/mp3">
          </div>

          <div class="mb-4">
            <span class="block text-white font-bold text-sm mb-2 font-roboto-500">Tags da Música</span>
            <MultiSelect id="tags" v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
          </div>

          <button type="submit" id="submit" class="btn btn-primary w-full">Salvar Alterações</button>
          
          <div v-if="success" class="divider"></div> 
          <Success v-if="success" :sucess-message="successMessage"/>
          <Error v-if="error" :error-message="errorMessage"/>
          <Loading v-if="loading"/>
        </form>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { uploadBytes } from '~/composables/firebase';
import { type Tags, type Music } from '~/interfaces/apiRef';

export default {
  props: {
    music: Object as () => Music,
  },
  data() {
    return {
      editedMusic: { ...this.music } as Music,
      loading: false,
      selectedTags: [] as { name: string; code: number }[],
      allTags: [] as Tags[],
      success: false,
      successMessage: "",
      error: false,
      errorMessage: "",
      jwtToken: "",
      date: "" as unknown as Date,
      tagsIds: [] as number[],
      audioFile: null as unknown as File,
      originalImageUrl: "", // Adicionando a variável para armazenar a URL original da imagem
    };
  },
  async beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;

    this.selectedTags = (this.editedMusic.tags || []).map(tag => ({ name: tag.nome, code: tag.id }));
    await this.fetchTags();

    // Armazenar a URL original da imagem antes da montagem do componente
    this.originalImageUrl = this.editedMusic.image_url;
  },
  mounted() {
    this.date = new Date(this.editedMusic.data_lanc);
    this.date = this.date.toLocaleDateString() as unknown as Date;
  },
  methods: {
    async enviarMusica() {
      this.loading = true;
      try {
        let imageUrl = "";
        if (this.originalImageUrl !== this.editedMusic.image_url) {
          const imageRef = FireRef(storage, `images/${this.editedMusic.nome}-${Date.now()}`);
          const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(this.editedMusic.image_url));
          imageUrl = await getDownloadURL(imageSnapshot.ref);
        } else {
          imageUrl = this.originalImageUrl;
        }

        let audioUrl = "";
        if (this.audioFile) {
          const audioRef = FireRef(storage, `audio/${this.editedMusic.nome}-${Date.now()}`);
          const audioSnapshot = await uploadBytes(audioRef, this.audioFile);
          audioUrl = await getDownloadURL(audioSnapshot.ref);
        } else {
          audioUrl = this.editedMusic.url;
        }

        this.tagsIds = this.selectedTags.map(tag => tag.code) || [];

        const response = await fetch(`https://starting-music.onrender.com/music/update/${this.editedMusic.id}`, {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": this.jwtToken || ""
          }),
          body: JSON.stringify({
            nome: this.editedMusic.nome,
            artista: this.editedMusic.artista,
            url: audioUrl,
            imageUrl: imageUrl,
            tags: this.tagsIds,
            artistaId: (this.editedMusic.artistaId || []).map(id => String(id)),
          })
        });

        if (response.ok) {
          this.loading = false;
          this.success = true;
          this.successMessage = "Edições Salvas!";
          setTimeout(() => {
            this.$emit('musicaEditada', this.editedMusic);
          }, 200)
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


        }
        else {
          console.error("Falha ao buscar tags da API");
        }
      }
      catch (error: any) {
        console.error("Erro durante a busca de tags:", error.message);
      }
    },
    closeModal() {
      this.$emit('fecharModal');
    },
    getMusicImage(imageUrl: string) {
      if (!imageUrl || imageUrl === "null" || imageUrl === undefined || imageUrl === "") {
        return "/img-placeholder.png";
      }

      const img = new Image();
      img.src = imageUrl;

      img.onerror = () => {
        this.handleImageError();
      };

      return imageUrl;
    },
    atualizarImagem(event: Event) {
      const imageFile = (event.target as HTMLInputElement).files?.[0];
      if (imageFile) {
        const imageReader = new FileReader();
        imageReader.onloadend = () => {
          this.editedMusic.image_url = imageReader.result as string;
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
      const arr = dataURL.split(',');
      const mimeMatch = arr[0]?.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : '';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    handleImageError() {
      this.editedMusic.image_url = "";
    },
  },
};
</script>
