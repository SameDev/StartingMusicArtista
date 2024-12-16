<template>
  <section class="flex items-center justify-center">
    <div
      class="bg-secondary flex rounded-2xl shadow-lg max-w-8xl min-w-5 w-[70%] p-5 items-center my-5 md:flex-row flex-col md:p-10"
    >
      <div class="md:w-1/2 md:px-8 px-0 flex flex-col justify-center">
        <h2 class="font-bold text-2xl text-center mb-8">Cadastro de Usuário</h2>

        <form
          class="flex flex-col gap-6 w-full"
          @submit.prevent="fazerCadastro"
        >
          <div class="flex flex-col">
            <label for="nome" class="text-white">Nome:</label>
            <input
              type="text"
              v-model="nome"
              id="nome"
              placeholder="Seu nome"
              class="input input-bordered bg-accent text-white placeholder-white w-full outline-none"
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="email" class="text-white">Email:</label>
            <input
              type="email"
              v-model="email"
              id="email"
              placeholder="Seu email"
              class="input input-bordered bg-accent text-white placeholder-white w-full outline-none"
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="senha" class="text-white">Senha:</label>
            <input
              type="password"
              v-model="senha"
              id="senha"
              placeholder="Sua senha"
              class="input input-bordered bg-accent text-white placeholder-white w-full outline-none"
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="data_nasc" class="text-white"
              >Data de Nascimento:</label
            >
            <input
              type="date"
              v-model="data_nasc"
              id="data_nasc"
              class="input input-bordered bg-accent text-white placeholder-white w-full outline-none"
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="desc" class="text-white">Descrição:</label>
            <textarea
              v-model="desc"
              id="desc"
              placeholder="Sua descrição"
              class="input input-bordered bg-accent h-20 pt-2 text-white placeholder-white w-full outline-none"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="tags" class="block text-white font-bold text-sm mb-2"
              >Tags do Seu Perfil</label
            >
            <MultiSelect
              v-model="selectedTags"
              :options="allTags"
              filter
              optionLabel="name"
              selectedItemsLabel="{0} tags selecionadas"
              :maxSelectedLabels="3"
              class="w-full md:w-20rem input input-bordered bg-accent text-white"
            />
          </div>
          <div class="mb-4">
            <label
              for="imageUrl"
              class="block text-white font-bold text-sm mb-2"
              >Foto de Perfil:</label
            >
            <input
              type="file"
              id="imageUrl"
              ref="imageUrlInput"
              class="file-input file-input-bordered w-full bg-accent text-white"
              accept="image/*"
              @change="handleImageUpload"
            />
          </div>
          <button
            class="btn btn-lg btn-block btn-primary font-bold rounded-md mt-10 bg-gradient-to-br from-primary to-[#282250]"
            :disabled="envio"
            type="submit"
          >
            <div v-if="envio" class="loading loading-secondary"></div>
            <div v-else>Cadastrar</div>
          </button>
          <Error v-if="error" :error-message="errorMessage" />
          <Success
            v-if="success"
            success-message="Cadastro realizado com sucesso!"
          />
          <div class="divider my-4"></div>
          <div class="text-base flex justify-center items-center">
            <p class="mr-4">Já é um artista da nossa plataforma?</p>
            <nuxt-link to="/login" class="btn btn-accent">Login</nuxt-link>
          </div>
        </form>
      </div>
      <div class="md:w-1/2 hidden md:flex flex-col items-center justify-center">
        <NuxtImg
          class="rounded-2xl mb-5 w-full md:max-w-md"
          src="/login.webp"
        />
        <div class="logo flex items-center justify-center">
          <NuxtImg class="w-20 h-20" src="/logo.svg" />
          <h2 class="ml-4 font-bold font-nunit">Starting Music</h2>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import type { Tags } from "~/interfaces/apiRef";
import {
  storage,
  FireRef,
  uploadBytes,
  getDownloadURL,
} from "~/composables/firebase";

const api_url = "https://starting-music.onrender.com/user/register";

export default {
  data() {
    return {
      error: false,
      errorMessage: "",
      success: false,
      successMessage: "",
      envio: false,
      nome: "",
      email: "",
      senha: "",
      data_nasc: "",
      desc: "",
      selectedTags: [] as { code: number }[],
      allTags: [] as Tags[],
      imageUrl: "",
      bannerUrl: "",
    };
  },
  beforeMount() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      try {
        const response = await fetch(
          "https://starting-music.onrender.com/tags"
        );
        if (response.ok) {
          const tagsData = await response.json();
          const uniqueTagsSet = new Set(
            tagsData.tags.flatMap((tag: Tags) =>
              JSON.stringify({ name: tag.nome, code: tag.id })
            )
          );
          this.allTags = Array.from(uniqueTagsSet).map((tag) =>
            JSON.parse(tag as string)
          );
        } else {
          console.error("Falha ao buscar tags da API");
        }
      } catch (error: any) {
        console.error("Erro durante a busca de tags:", error.message);
      }
    },
    handleImageUpload(event: Event) {
      try {
        const imageFile = (event.target as HTMLInputElement).files?.[0];
        if (imageFile) {
          const imageReader = new FileReader();
          imageReader.onloadend = () => {
            if (
              typeof imageReader.result === "string" &&
              imageReader.result.startsWith("data:image/")
            ) {
              this.imageUrl = imageReader.result;
            } else {
              console.error("Formato inválido para a imagem");
            }
          };
          imageReader.readAsDataURL(imageFile);
        } else {
          console.error("Nenhum arquivo foi selecionado");
        }
      } catch (error) {
        console.error("Erro durante o upload da imagem:", error.message);
      }
    },
    dataURLtoBlob(dataURL: string, type?: string) {
      if (!dataURL.startsWith("data:")) {
        throw new Error("O dataURL fornecido não é válido");
      }
      const arr = dataURL.split(",");
      const mimeMatch = arr[0]?.match(/:(.*?);/);
      const mime = type || (mimeMatch ? mimeMatch[1] : "");
      const bstr = atob(arr[1]); 
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },

    async fazerCadastro() {
      this.envio = true;

      try {
        let uploadedImageUrl = "";

        if (this.imageUrl) {
          const imageRef = FireRef(
            storage,
            `images/${this.nome}-${Date.now()}`
          );
          const imageSnapshot = await uploadBytes(
            imageRef,
            this.dataURLtoBlob(this.imageUrl)
          );
          uploadedImageUrl = await getDownloadURL(imageSnapshot.ref);
        }

        const cadastroOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: this.nome,
            email: this.email,
            senha: this.senha,
            data_nasc: this.data_nasc,
            cargo: "ARTISTA",
            desc: this.desc,
            tags: this.selectedTags.map((tag) => tag.code),
            banner: '',
            foto_perfil: uploadedImageUrl || '', 
          }),
        };

        const cadastroResponse = await fetch(api_url, cadastroOptions);
        const cadastroData = await cadastroResponse.json();
        console.log(cadastroData)

        if (!cadastroResponse.ok) {
          throw new Error(cadastroData);
        }

        this.success = true;

        const authorizationHeader =
          cadastroResponse.headers.get("Authorization");
        const jwtToken = authorizationHeader;

        if (jwtToken) {
          const cookieToken = useCookie("jwtToken", {
            maxAge: 8 * 60 * 60,
            secure: true,
            sameSite: true,
          });
          cookieToken.value = jwtToken;

          const {
            id,
            email,
            nome,
            cargo,
            foto_perfil,
            tags,
            desc,
            data_nasc,
            banner_perfil,
          } = cadastroData.user;

          localStorage.setItem("userID", id);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userNome", nome);
          localStorage.setItem("userPic", foto_perfil);
          localStorage.setItem("userCargo", cargo);
          localStorage.setItem("userTags", JSON.stringify(tags) || "[]");
          localStorage.setItem("userDesc", desc);
          localStorage.setItem("userNasc", data_nasc);
          localStorage.setItem("userBanner", banner_perfil);

          this.$router.push("/").then(() => window.location.reload());
          return cadastroData;
        } else {
          this.error = true;
          this.errorMessage = cadastroData;
        }
      } catch (error) {
        this.error = true;
        this.errorMessage = `Erro durante o cadastro: ${error.message}`;
        console.error("Erro durante o cadastro:", error.message);
      } finally {
        this.envio = false;
      }
    },
  },
};
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  background-color: #121212;
}
</style>
