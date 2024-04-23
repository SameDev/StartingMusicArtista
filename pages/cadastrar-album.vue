<template>
  <div class="overflow-x-hidden">
    <!-- Componente de barra lateral -->
    <Sidebar></Sidebar>
    <section class="2xl:ml-[17%] md:px-10 md:py-5">
      <!-- Componente de cabeçalho -->
      <Header page="Cadastrar Álbum" icon="record-vinyl"></Header>
      <div class="container justify-center items-center content-center md:mx-auto bg-base-300 w-full shadow-xl p-7 m-1 rounded-2xl font-nunito">
        <div>
          <div class="flex items-center justify-between mb-4 w-full">
            <div class="md:flex hidden items-center justify-between m-3 p-3 bg-secondary rounded-md w-full">
              <div class="flex items-center pr-7">
                <img :src="getImage(picImg, 'music')" :alt="nome" class="object-cover object-center h-32 w-32 mt-3 rounded-md mr-5">
                <div>
                  <h3 v-if="nome" class="text-5xl text-white font-bold">{{ nome }}</h3>
                  <h3 v-else class="text-2xl text-white font-bold">Nome de seu álbum</h3>
                  <p class=" font-bold text-violet-600 text-md">Álbum • {{ artista }} • {{ viewDate.getFullYear() }}</p>
                  <p v-if="date" class="font-bold text-md">{{ qtdMusicas }} músicas • {{ durationAlbum }} minutos</p>
                  <br>
                  <p>{{ desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="divider font-bold">ADICIONAR ÁLBUM</div>

          <form>
            <div class="mb-4">
              <label for="nome" class="block text-white font-bold text-sm mb-2">Nome do álbum</label>
              <input type="text" id="nome" v-model="nome" class="input input-bordered bg-accent w-full text-white" required>
            </div>

            <div class="mb-4">
              <label for="artista" class="block text-white font-bold text-sm mb-2">Nome do Artista</label>
              <input type="text" id="artista" v-model="artista" class="input input-bordered bg-accent w-full text-white" required>
            </div>
            <div class="mb-4">
              <label for="date" class="block text-white font-bold text-sm mb-2">Data De Lançamento</label>
              <input type="date" id="date" v-model="date" class="input input-bordered bg-accent w-full text-white" required>
            </div>

            <div class="mb-4">
              <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Imagem do Álbum:</label>
              <input type="file" id="imageUrl" @change="atualizarImagem" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*" required>
            </div>

            <div class="mb-4">
              <label for="desc" class="block text-white font-bold text-sm mb-2">Descrição do Álbum</label>
              <textarea id="desc" v-model="desc" class="textarea textarea-bordered w-full text-white  bg-accent" rows="3"></textarea>
            </div>

            <div class="mb-4">
              <label for="tags" class="block text-white font-bold text-sm mb-2">Tags do Álbum</label>
              <MultiSelect v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
            </div>

            <!-- Seção de adição de músicas -->
            <div>
              <div class="mb-4">
                <label for="musicas" class="block text-white font-bold text-sm mb-2">Músicas do Álbum:</label>
                <div class="flex items-center">
                  <button @click="adicionarMusica" type="button" class="btn btn-success w-1/2">+ Adicionar</button>
                  <span class="ml-2 w-1/2">Clique no botão para adicionar uma música</span>
                  
                </div>
                <div class="divider"></div>
                
                <!-- Loop para exibir os campos de cada música -->
                <div v-for="(musica, index) in musicas" :key="index">
                  <div class="mb-4 song">
                    <label :for="'nomeMusica' + index" class="block text-white font-bold text-xl mb-2">Música {{ index + 1 }}:</label>
                    <div class="mb-4">
                      <label :for="'nome' + index" class="block text-white font-bold text-sm mb-2">Nome da Música</label>
                      <input :id="'nome' + index" type="text" v-model="musica.nome" class="input input-bordered bg-accent w-full text-white" required>
                    </div>

                    <div class="mb-4">
                      <label :for="'audioFile' + index" class="block text-white font-bold text-sm mb-2">Arquivo de Áudio:</label>
                      <input :id="'audioFile' + index" type="file" @change="atualizarAudio(index, $event)" ref="audioFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="audio/mp3, audio/wav" required>
                    </div>

                    <!-- Botão para remover a música -->
                    <button type="button" @click="removerMusica(index)" class="btn btn-error text-white w-full"><font-awesome-icon :icon="['fas', 'trash']" /> Remover</button>
                    <div class="divider"></div>
                  </div>
                </div>
              </div>
            </div>

            <button @click.prevent="enviarAlbum" class="btn btn-primary w-full">Cadastrar Álbum</button>

            <div v-if="success || error" class="divider"></div>
            <Success v-if="success" :success-message="successMessage" />
            <Error v-if="error" :error-message="errorMessage" />

            <Loading v-if="loading" />
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';
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
      imageUrl: "",
      date: null as unknown as Date,
      tags: [] as Tags[],
      selectedTags: [] as Tags[],
      allTags: [] as Tags[],
      success: false,
      successMessage: "",
      error: false,
      errorMessage: "",
      loading: false,
      picImg: "",
      musicas: [] as { nome: string, arquivo: File | null }[],
      viewDate: null as unknown as Date,
      qtdMusicas: 0,
      durationAlbum: 0,
      desc: "Breve descrição do seu incrível álbum",
      songQtd: 0
    };
  },
  beforeMount() {
    if (process.client) {
      const cookieToken = useCookie("jwtToken");
      this.jwtToken = cookieToken.value as string;

      this.date = new Date() as unknown as Date
      this.viewDate = this.date;
      this.date = this.date.toISOString().split("T")[0] as unknown as Date;

      this.userEmail = localStorage.getItem("userEmail") || "";
      this.userPic = localStorage.getItem("userPic") || "";
      this.userNome = localStorage.getItem("userNome") || "";
      this.userID = localStorage.getItem("userID") || "";
      this.userCargo = localStorage.getItem("userCargo") || "";
    }
  },
  methods: {
    async enviarAlbum() {
      this.loading = true;
      if (!this.verificaCampos()) return;
      try {
        // Upload de imagem do álbum
        const imageRef = FireRef(storage, `images/${this.nome}-${Date.now()}`);
        const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(this.imageUrl));
        const imageUrl = await getDownloadURL(imageSnapshot.ref);

        // Upload de músicas do álbum
        const musicasPromises = this.musicas.map(async (musica) => {
          if (musica.arquivo) {
            const audioRef = FireRef(storage, `audio/${musica.nome}-${Date.now()}`);
            const audioSnapshot = await uploadBytes(audioRef, musica.arquivo);
            return getDownloadURL(audioSnapshot.ref);
          }
          return '';
        });
        const urlsMusicas = await Promise.all(musicasPromises);

        // Dados do álbum para enviar ao backend
        const albumData = {
          nome: this.nome,
          artista: this.artista,
          imageUrl: imageUrl,
          data_lanc: this.date,
          tags: this.selectedTags.map(tag => tag.id),
          desc: this.desc,
          musicas: this.musicas.map((musica, index) => ({
            nome: musica.nome,
            url: urlsMusicas[index]
          }))
        };

        // Enviar dados do álbum para o backend
        const response = await fetch("URL_DO_BACKEND/endpoint_de_cadastro_de_album", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": this.jwtToken || ""
          },
          body: JSON.stringify(albumData)
        });

        if (response.ok) {
          this.loading = false;
          this.success = true;
          this.error = false;
          this.successMessage = "Álbum cadastrado com sucesso!";
        } else {
          this.loading = false;
          this.error = true;
          this.errorMessage = "Ocorreu um erro ao cadastrar o álbum. Por favor, tente novamente mais tarde.";
        }
      } catch (error) {
        this.loading = false;
        this.error = true;
        this.errorMessage = "Ocorreu um erro no servidor!";
        console.error(error.message);
      }
    },
    verificaCampos() {
      if (!this.date || !this.nome || !this.artista || !this.imageUrl || !this.selectedTags.length || !this.musicas.length) {
        this.error = true;
        this.errorMessage = "Você precisa preencher todos os campos!";
        this.loading = false;
        return false;
      } else {
        return true;
      }
    },
    async fetchTags() {
      try {
        const response = await fetch("https://starting-music.onrender.com/tags");
        if (response.ok) {
          const tagsData = await response.json();
          this.allTags = tagsData.tags;
        } else {
          console.error("Falha ao buscar tags da API");
        }
      } catch (error: any) {
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
    adicionarMusica() {
      this.musicas.push({ nome: '', arquivo: null });
    },
    removerMusica(index: number) {
      this.musicas.splice(index, 1);
    },
    atualizarAudio(index: number, event: Event) {
      const audioFile = (event.target as HTMLInputElement).files?.[0];
      if (audioFile) {
        this.musicas[index].arquivo = audioFile;
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
