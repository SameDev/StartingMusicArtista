<template>
  <div class="overflow-x-hidden">
    <Sidebar></Sidebar>
    <section class="2xl:ml-[17%] px-10 py-5">
      <Header page="Enviar Música" icon="music"></Header>
      <div class="container justify-center items-center content-center mx-auto bg-base-300 w-full shadow-xl p-7 m-10 rounded-2xl font-nunito">
        <div >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center text-2xl">
              <div class="avatar mr-2 shadow-2xl">
                <div class="w-24 rounded-full shadow-2xl">
                  <img :src="getImage(userPic, 'user')" />
                </div>
              </div>
              <div>
                <h2 class="font-bold font-roboto text-md">{{ userNome }}</h2>
                <h2 class="font-roboto text-sm font-medium text-accent">{{ userCargo }}</h2>
              </div>
            </div>
            <div class="md:flex hidden items-center justify-between m-3 p-3 bg-secondary rounded-md">
                <div class="flex items-center pr-7">
                  <img :src="getImage(picImg, 'music')" :alt="nome" class="object-cover object-center h-24 w-24 mt-3 rounded-md mr-5">
                  <div>
                    <h3 v-if="nome" class="text-2xl font-bold">{{ nome }}</h3>
                    <h3 v-else class="text-xl font-bold">Nome da Sua Música</h3>
                    <p class="text-gray-400 font-bold text-xl">{{ artista }}</p>
                    <p v-if="date" class="font-bold text-purple-400 text-xs">{{ date }}</p>
                  </div>
                </div>
            </div>
          </div>

          <div class="divider font-bold">ADICIONAR MÚSICA</div>

          <form @submit.prevent="enviarMusica">
            <div class="mb-4">
              <label for="nome" class="block text-white font-bold text-sm mb-2">Nome da Música</label>
              <input type="nome" id="nome" v-model="nome" class="input input-bordered bg-accent w-full text-white" required>
            </div>

            <div class="mb-4">
              <label for="artista" class="block text-white font-bold text-sm mb-2">Nome do Artista</label>
              <input type="artista" id="artista" v-model="artista" class="input input-bordered bg-accent w-full text-white" required>
            </div>
            <div class="mb-4">
              <label for="date" class="block text-white font-bold text-sm mb-2">Data De Lançamento</label>
              <input type="date" id="date" v-model="date" class="input input-bordered bg-accent w-full text-white" required> 
            </div>

            <div class="mb-4">
              <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Imagem:</label>
              <input type="file" id="imageUrl" @change="atualizarImagem" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*" required>
            </div>

            <div class="mb-4">
              <label for="audioFile" class="block text-white font-bold text-sm mb-2">Arquivo de Áudio:</label>
              <input type="file" id="audioFile" @change="atualizarAudio" ref="audioFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="audio/*" required>
            </div>

            <div class="mb-4">
              <label for="tags" class="block text-white font-bold text-sm mb-2">Tags da Música</label>
                <MultiSelect v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
            </div>

            <button type="submit" class="btn btn-primary w-full">Enviar Música</button>
            
            <div v-if="success || error" class="divider"></div>
            <Success v-if="success" :sucess-message="successMessage"/>
            <Error v-if="error" :error-message="errorMessage"/>

            <Loading v-if="loading"/>
          </form>
        </div>

        
      </div>
  </section>
  </div>
</template>

<script lang="ts">
import type { Music, Tags } from '~/interfaces/apiRef';
import MultiSelect from 'primevue/multiselect';
import { storage, FireRef, uploadBytes, getDownloadURL } from '~/composables/firebase';

export default {
  data() {
    return {
        jwtToken: "",
        userEmail: "",
        userPic: "",
        userNome: "",
        userID: "",
        userCargo: "",
        nome: "",
        artista: "",
        url: "",
        imageUrl: "",
        duracao: "",
        date: null as unknown as Date,
        tags: [] as Tags[],
        selectedTags: ref(), 
        allTags: [] as Tags[],
        success: false,
        successMessage: "",
        error: false,
        errorMessage: "",
        loading: false,
        tagsIds: [] as Number[],
        picImg: "",
        audioFile: null as unknown as File,
    };
},
beforeMount() {
    if (process.client) {
        const cookieToken = useCookie("jwtToken");
        this.jwtToken = cookieToken.value as string;

        this.date = new Date() as unknown as Date
        this.date = this.date.toISOString().split("T")[0] as unknown as Date;

        this.userEmail = localStorage.getItem("userEmail") || "";
        this.userPic = localStorage.getItem("userPic") || "";
        this.userNome = localStorage.getItem("userNome") || "";
        this.userID = localStorage.getItem("userID") || "";
        this.userCargo = localStorage.getItem("userCargo") || "";
    }
},
    methods: {
      async enviarMusica() {
        this.loading = true;
        if(!this.verificaCampos()) return;
        else {
          try {
            if (!this.imageUrl) {
              this.loading = false;
              this.error = true;
              this.errorMessage = "Selecione uma imagem antes de enviar a música.";
              return;
            }

            const imageRef = FireRef(storage, `images/${this.nome}-${Date.now()}`);
            const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(this.imageUrl));
            const imageUrl = await getDownloadURL(imageSnapshot.ref);

            if (!this.audioFile) {
              this.loading = false;
              this.error = true;
              this.errorMessage = "Selecione um arquivo de áudio antes de enviar a música.";
              return;
            }

            const audioRef = FireRef(storage, `audio/${this.nome}-${Date.now()}`);
            const audioSnapshot = await uploadBytes(audioRef, this.audioFile);
            const audioUrl = await getDownloadURL(audioSnapshot.ref);

            if (this.selectedTags && this.selectedTags.length > 0) {
              this.tagsIds = this.selectedTags.map((tag: { code: number; }) => tag.code);
            }

            const response = await fetch("https://starting-music.onrender.com/music/create", {
              method: "POST",
              headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": this.jwtToken || ""
              }),
              body: JSON.stringify({
                nome: this.nome,
                artista: this.artista,
                duracao: this.duracao,
                artistaId: [parseInt(this.userID)],
                tags: this.tagsIds,
                songUrl: audioUrl,
                imageUrl: imageUrl,
                data_lanc: this.date,
                
              })
            });

            if (response.ok) {
              this.loading = false;
              this.success = true;
              this.error = false;
              this.successMessage = "Música Enviada!";
              
            } else {
              this.loading = false;
              this.error = true;
              this.errorMessage = "Ocorreu um erro, verifique se enviou todos os campos!";
            }
          } catch (error) {
            this.loading = false;
            this.error = true;
            this.errorMessage = "Ocorreu um erro no servidor!";
            console.log(error.message);
          }
        }
      },
      verificaCampos() {
        if (!this.date || !this.nome || !this.artista ) {
          this.error = true;
          this.errorMessage = "Você precisa enviar todos campos!";
          this.loading = false;
          return false;
        } else {
          return true
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
      atualizarImagem(event: Event) {
        const imageFile = (event.target as HTMLInputElement).files?.[0];
        if (imageFile) {
          const imageReader = new FileReader();
          imageReader.onloadend = () => {
            this.imageUrl = imageReader.result as string;
          };
          imageReader.readAsDataURL(imageFile);
        }
      },
      atualizarAudio(event: Event) {
        const audioFile = (event.target as HTMLInputElement).files?.[0];
        if (audioFile) {
          this.audioFile = audioFile;
        }
      },
      getImage(imageUrl: string, type: string) {
        if (!imageUrl || imageUrl === "null" || imageUrl === undefined || imageUrl === "") {
          if (type === 'user') {
            return "/user-placeholder.jpeg";
          } else {
            return "/img-placeholder.png"
          }
        }

        const img = new Image();
        img.src = imageUrl;

        img.onerror = () => {
          this.handleImageError();
        };

        return imageUrl;
      },
      handleImageError() {
        this.userPic = "";
        this.picImg = "";
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
    },
    async mounted() {
      await this.fetchTags();
      this.artista = this.userNome;
    },
    components: {
      MultiSelect
    }
};
</script>
