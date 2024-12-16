<template>
  <section class="z-3 px-10 py-5 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-base-300 bg-opacity-75 shadow-md overflow-y-auto">
    <div class="container justify-center items-center content-center mx-auto bg-base-200 w-full shadow-lg p-7 m-10 rounded-md font-nunito absolute">
      <h2 class="text-center font-bold text-xl mb-5">Editar Seu Perfil</h2>
      <div class="modal-action">
        <button @click="fecharModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </div>
      <form @submit.prevent="editarUser">
        <div class="mb-4">
          <label for="nome" class="block text-white font-bold text-sm mb-2 font-roboto-500">
            <font-awesome-icon :icon="['fas', 'address-card']" /> Nome de Perfil:
          </label>
          <input 
            type="text" 
            id="nome" 
            v-model="userNome" 
            class="input input-bordered text-white bg-accent w-full" 
            :class="{'input-error': errors.nome}" 
            placeholder="Digite seu nome"
          >
          <span v-if="errors.nome" class="text-error">{{ errors.nome }}</span>
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-white font-bold text-sm mb-2 font-roboto-500">
            <font-awesome-icon :icon="['fas', 'at']" /> Email do Perfil:
          </label>
          <input 
            type="email" 
            id="email" 
            v-model="userEmail" 
            class="input input-bordered text-white bg-accent w-full" 
            :class="{'input-error': errors.email}" 
            placeholder="Digite seu email"
          >
          <span v-if="errors.email" class="text-error">{{ errors.email }}</span>
        </div>
        
        <div class="mb-4">
          <label for="data" class="block text-white font-bold text-sm mb-2 font-roboto-500">
            <font-awesome-icon :icon="['fas', 'calendar']" /> Data de Nascimento:
          </label>
          <input 
            type="date" 
            id="data" 
            v-model="userNasc" 
            class="input input-bordered text-white bg-accent w-full" 
            :class="{'input-error': errors.data}" 
          >
          <span v-if="errors.data" class="text-error">{{ errors.data }}</span>
        </div>
        
        <div class="mb-4">
          <label for="desc" class="block text-white font-bold text-sm mb-2 font-roboto-500">
            <font-awesome-icon :icon="['fas', 'user-pen']" /> Descrição do seu perfil:
          </label>
          <textarea 
            id="desc" 
            v-model="userDesc" 
            class="textarea textarea-bordered w-full text-white bg-accent" 
            :class="{'textarea-error': errors.desc}" 
            placeholder="Adicione uma descrição"
          ></textarea>
          <span v-if="errors.desc" class="text-error">{{ errors.desc }}</span>
        </div>
        <div class="mb-4">
          <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Foto de Perfil:</label>
          <input type="file" id="imageUrl" @change="atualizarImagem" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/jpeg image/png image/webp">
        </div>

        <div class="mb-4">
          <label for="bannerUrl" class="block text-white font-bold text-sm mb-2">Imagem do Banner de Perfil:</label>
          <input type="file" id="bannerUrl" @change="atualizarBanner" ref="bannerFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*">
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-white font-bold text-sm mb-2 font-roboto-500"><font-awesome-icon :icon="['fas', 'user-tag']" /> Tags da Música</label>
          <MultiSelect v-model="userTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
        </div>


        <button 
          class="btn btn-primary w-full" 
          :class="{'disabled': loadingBtn}" 
          :disabled="loadingBtn"
        >
          <div v-if="!loadingBtn">
            <font-awesome-icon :icon="['fas', 'user-pen']" /> Editar Perfil
          </div>
          <div v-else class="loading loading-spinner"></div>
        </button>

        <div v-if="success || error" class="divider"></div>

        <Success v-if="success" :sucessMessage="successMessage"/>
        <Error v-if="error" :error-message="errorMessage"/>
      </form>
    </div>
  </section>
</template>

<script lang="ts">
import Compressor from 'compressorjs';
import type { Tags, User } from '~/interfaces/apiRef';
import { storage, FireRef, uploadBytes, getDownloadURL } from '~/composables/firebase'

export default {
  props: {
    jwtToken: String,
  },
  data() {
    return {
      userNome: localStorage.getItem('userNome') || '',
      userEmail: localStorage.getItem('userEmail') || '',
      userNasc: localStorage.getItem('userNasc') || '' as unknown as Date,
      userDesc: localStorage.getItem('userDesc') || '',
      userBanner: localStorage.getItem("userBanner") || "",
      userPic: localStorage.getItem("userPic") || "",
      allTags: [] as Tags[],
      userTags: JSON.parse(localStorage.getItem("userTags") || "[]"),
      userID: localStorage.getItem('userID') || '',
      success: false,
      successMessage: '',
      error: false,
      errorMessage: '',
      loadingBtn: false,
      errors: {
        nome: '',
        email: '',
        data: '',
        desc: '',
      },
      userSelectedTags: []
    };
  },
  beforeMount() {
    this.fetchTags()

    this.userNasc = new Date(this.userNasc);
    this.userNasc = this.userNasc.toISOString().split("T")[0] as unknown as Date

    this.userTags = (this.userTags || []).map((tag: { nome: any; id: any; }) => ({ name: tag.nome, code: tag.id }));
    if (!this.userDesc || this.userDesc == "null") {
      this.userDesc = "";
    }
    if (!this.userPic || this.userPic == "null") {
      this.userPic = "";
    } 
    if (!this.userBanner || this.userBanner == "null") {
      this.userBanner = "";
    } 
  },
  methods: {
    validateFields() {
      this.errors = { nome: '', email: '', data: '', desc: '' };

      if (!this.userNome.trim()) this.errors.nome = 'O nome é obrigatório';
      if (!this.userEmail.trim()) this.errors.email = 'O email é obrigatório';

      return !Object.values(this.errors).some(Boolean);
    },
    async editarUser() {
      if (!this.validateFields()) return;
      this.loadingBtn = true;
      this.userSelectedTags = (this.userTags || []).map((tag: {
        [x: string]: any; name: any, code: any 
      })  => ({ id: tag.code, nome: tag.name }));

      if (this.userTags && this.userTags.length > 0) {
        this.userTags = this.userTags.map((tag: { code: number; }) => tag.code);
      }

      let imageUrl = "";
      if (this.userPic !== this.userPic) {
        const imageRef = FireRef(storage, `images/${this.userNome}-${Date.now()}`);
        const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(this.userPic));
        imageUrl = await getDownloadURL(imageSnapshot.ref);
      } else {
        imageUrl = this.userPic;
      }

      let bannerUrl = "";
      if (this.userBanner !== this.userBanner) {
        const bannerRef = FireRef(storage, `banner/${this.userNome}-${Date.now()}`);
        const bannerSnapshot = await uploadBytes(bannerRef, this.dataURLtoBlob(this.userBanner));
        bannerUrl = await getDownloadURL(bannerSnapshot.ref);
      } else {
        bannerUrl = this.userBanner;
      }
      this.userNasc = new Date(this.userNasc);

      try {
        const response = await fetch(`https://starting-music.onrender.com/user/update/${this.userID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.jwtToken || '',
          },
          body: JSON.stringify({
            nome: this.userNome,
            descricao: this.userDesc,
            url: imageUrl,
            tags: this.userTags,
            email: this.userEmail,
            banner: bannerUrl,
            data_nasc: this.userNasc.toISOString()
          }),
        });

        if (response.ok) {
          this.$emit("perfil-editado");
          this.success = true;
          this.successMessage = 'Perfil atualizado com sucesso';
          this.error = false;
          this.successMessage = "Perfil editado com Sucesso!"

          localStorage.setItem("userNome", this.userNome);
          localStorage.setItem("userDesc", this.userDesc);
          localStorage.setItem("userPic", imageUrl);
          localStorage.setItem("userBanner", bannerUrl)
          localStorage.setItem("userEmail", this.userEmail || "");
          localStorage.setItem("userTags", JSON.stringify(this.userSelectedTags) || "[]");
          localStorage.setItem("userNasc", this.userNasc.toString())
        } else {
          const body = await response.json();
          this.loadingBtn = false;
          this.error = true;
          this.errorMessage = "Falha ao editar o perfil! " + body.message;
        }
      } catch (error) {
        this.loadingBtn = false;
        this.error = true;
        this.errorMessage = "Erro diretamente na API!";
        console.error("Erro durante a edição do perfil:", error.message);
      } finally {
        this.loadingBtn = false;
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
        this.success = false;
        this.loadingBtn = false;
        
        console.error("Erro durante a busca de tags:", error.message);
      }
    },
    atualizarImagem(event: Event) {
      const imageFile = (event.target as HTMLInputElement).files?.[0];
      if (imageFile) {
        new Compressor(imageFile, {
          quality: 0.6,
          success: (compressedImage) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.userPic = reader.result as string;
            };
            reader.readAsDataURL(compressedImage);
          },
          error(err) {
            console.log(err.message);
          },
        });
      }
    },
    atualizarBanner(event: Event) {
      const bannerFile = (event.target as HTMLInputElement).files?.[0];
      if (bannerFile) {
        new Compressor(bannerFile, {
          quality: 0.6,
          success: (compressedImage) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.userBanner = reader.result as string;
            };
            reader.readAsDataURL(compressedImage);
          },
          error(err) {
            console.log(err.message);
          },
        });
      }
    },
    
    dataURLtoBlob(dataURL: string, type?: string) {
      const arr = dataURL.split(',');
      const mimeMatch = arr[0]?.match(/:(.*?);/);
      const mime = type || (mimeMatch ? mimeMatch[1] : '');
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    fecharModal() {
      this.$emit('closeModal');
    },
  },
};
</script>
