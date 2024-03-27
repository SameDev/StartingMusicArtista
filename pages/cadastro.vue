<template>
  <section class="flex items-center justify-center">
    <div class="bg-secondary flex rounded-2xl shadow-lg max-w-8xl min-w-5 w-[70%] p-5 items-center my-5 md:flex-row flex-col md:p-10">
      <div class="md:w-1/2 md:px-8 px-0 flex flex-col justify-center">
        <h2 class="font-bold text-2xl text-center mb-8">Cadastro de Usuário</h2>

        <form class="flex flex-col gap-6 w-full" @submit.prevent="fazerCadastro">
          <div class="flex flex-col">
            <label for="nome" class="text-white">Nome:</label>
            <input type="text" v-model="nome" id="nome" placeholder="Seu nome" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none" required/> 
          </div>
          <div class="flex flex-col">
            <label for="email" class="text-white">Email:</label>
            <input type="email" v-model="email" id="email" placeholder="Seu email" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none" required/>
          </div>
          <div class="flex flex-col">
            <label for="senha" class="text-white">Senha:</label>
            <input type="password" v-model="senha" id="senha" placeholder="Sua senha" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none" required/>
          </div>
          <div class="flex flex-col">
            <label for="data_nasc" class="text-white">Data de Nascimento:</label>
            <input type="date" v-model="data_nasc" id="data_nasc" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none" required/>
          </div>
          <div class="flex flex-col">
            <label for="cargo" class="text-white">Cargo:</label>
            <select v-model="cargo" id="cargo" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none" required>
              <option value="">Selecione o cargo</option>
              <option value="USUARIO">Usuário</option>
              <option value="ARTISTA">Artista</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="desc" class="text-white">Descrição:</label>
            <textarea v-model="desc" id="desc" placeholder="Sua descrição" class="input input-bordered bg-accent h-20 pt-2 text-white placeholder-white w-full outline-none" required></textarea>
          </div>
          <div class="mb-4">
              <label for="tags" class="block text-white font-bold text-sm mb-2">Tags da Música</label>
                <MultiSelect v-model="selectedTags" :options="allTags" filter optionLabel="name" selectedItemsLabel="{0} tags selecionadas" :maxSelectedLabels="3" class="w-full md:w-20rem input input-bordered bg-accent text-white" />
            </div>
            <div class="mb-4">
              <label for="imageUrl" class="block text-white font-bold text-sm mb-2">Foto de Perfil:</label>
              <input type="file" id="imageUrl" ref="imageUrlInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*" @change="handleImageUpload">

            </div>

            <div class="mb-4">
              <label for="bannerUrl" class="block text-white font-bold text-sm mb-2">Imagem do Banner de Perfil:</label>
              <input type="file" id="bannerUrl" ref="bannerFileInput" class="file-input file-input-bordered w-full bg-accent text-white" accept="image/*" @change="handleBannerUpload">
            </div>

          <button class="btn btn-lg btn-block btn-primary font-bold rounded-md mt-10 bg-gradient-to-br from-primary to-[#282250]"
                  :disabled="envio"
                  type="submit">
            <div v-if="envio" class="loading loading-secondary"></div>
            <div v-else>Cadastrar</div>
          </button>
          <Error v-if="error" :error-message="errorMessage"/>
          <Success v-if="success" :success-message="successMessage"/>
          <div class="divider my-4"></div>
          <div class="text-base flex justify-center items-center">
            <p class="mr-4">Já é um artista da nossa plataforma?</p>
            <nuxt-link to="/login" class="btn btn-accent">Login</nuxt-link>
          </div>
        </form>
      </div>
      <div class="md:w-1/2 hidden md:flex flex-col items-center justify-center">
        <NuxtImg class="rounded-2xl mb-5 w-full md:max-w-md" src="/login.jpg"/>
        <div class="logo flex items-center justify-center">
          <NuxtImg class="w-20 h-20" src="/logo.svg"/>
          <h2 class="ml-4 font-bold font-nunit">Starting Music</h2>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';
import { storage, FireRef, uploadBytes, getDownloadURL } from '~/composables/firebase'

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
      cargo: "",
      desc: "",
      tags: [] as Tags[],
      selectedTags: ref(), 
      allTags: [] as Tags[],
      banner: "",
      tagsIds: [] as Number[],
      imageUrl: "",
      bannerUrl: ""
    };
  },
  beforeMount() {
    this.fetchTags()
  },
  methods: {
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
    async fazerCadastro() {
      const { nome, email, senha, data_nasc, cargo, desc, tags, bannerUrl, imageUrl } = this;

      // Verificar se todos os campos obrigatórios foram preenchidos
      if (!nome || !email || !senha || !data_nasc || !cargo || !desc || !tags || !bannerUrl || !imageUrl) {
        this.error = true;
        this.errorMessage = "Por favor, preencha todos os campos.";
        return;
      }

      // Realizar o envio do formulário
      this.envio = true;

      try {
        // Upload das imagens
        const imageRef = FireRef(storage, `images/${nome}-${Date.now()}`);
        const imageSnapshot = await uploadBytes(imageRef, this.dataURLtoBlob(imageUrl));
        const uploadedImageUrl = await getDownloadURL(imageSnapshot.ref);

        const bannerRef = FireRef(storage, `banners/${nome}-${Date.now()}`);
        const bannerSnapshot = await uploadBytes(bannerRef, this.dataURLtoBlob(bannerUrl));
        const uploadedBannerUrl = await getDownloadURL(bannerSnapshot.ref);

        // Envio do formulário de cadastro
        const cadastroOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            nome: this.nome, 
            email: this.email, 
            senha: this.senha, 
            data_nasc: this.data_nasc, 
            cargo: this.cargo, 
            desc: this.desc, 
            tags: this.tags, 
            bannerUrl: uploadedBannerUrl, 
            imageUrl: uploadedImageUrl 
          }),
        };

        const cadastroResponse = await fetch(api_url, cadastroOptions);
        const cadastroData = await cadastroResponse.json();

        if (!cadastroResponse.ok) {
          throw new Error(cadastroData.message || "Erro desconhecido ao cadastrar.");
        }


        

        // Exibir mensagem de sucesso
        this.success = true;
        this.successMessage = "Cadastro realizado com sucesso!";

        await this.fazerLogin(email, senha);
      } catch (error) {
        console.error("Erro durante o cadastro:", error);
        this.error = true;
        this.errorMessage = error.message || "Erro ao enviar solicitação.";
      } finally {
        this.envio = false;
      }
    },
    async fazerLogin(email: string, senha: string) {
      this.envio = true;

      if (!email || !senha) {
        this.envio = false;
        this.error = true;
        this.errorMessage = "Você precisa preencher todos os campos!";
        return;
      }

      try {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, senha }),
        };

        const response = await fetch(api_url, options);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro interno no servidor!");
        }

        const jwtToken = response.headers.get('Authorization');

        if (jwtToken) {
          // Armazenar o token JWT em um cookie ou localStorage
          // Exemplo usando cookie:
          const cookieToken = useCookie("jwtToken", {
            maxAge: 8 * 60 * 60, // Tempo de expiração do token em segundos (por exemplo, 8 horas)
            secure: true, // Defina como true se estiver usando HTTPS
            sameSite: true, // Opção para prevenir ataques de CSRF
          });
          cookieToken.value = jwtToken;

          // Armazenar outros dados do usuário, se necessário
          // Exemplo: localStorage.setItem('userID', data.user.id);

          // Redirecionar o usuário após o login
          this.$router.push('/').then(() => window.location.reload());

          // Exibir mensagem de sucesso, se necessário
          this.success = true;
          this.successMessage = "Login realizado com sucesso!";
        } else {
          throw new Error("Token JWT não encontrado na resposta da API!");
        }
      } catch (error) {
        console.error("Erro durante o login:", error);
        this.error = true;
        this.errorMessage = error.message || "Erro ao enviar solicitação.";
      } finally {
        this.envio = false;
      }
    },
    handleImageUpload(event: Event) {
      console.log("handleImageUpload chamado");
      const imageFile = (event.target as HTMLInputElement).files?.[0];
      if (imageFile) {
        const imageReader = new FileReader();
        imageReader.onloadend = () => {
          this.imageUrl = imageReader.result as string;
          console.log("imageUrl atualizado:", this.imageUrl);
        };
        imageReader.readAsDataURL(imageFile);
      }
    },
    handleBannerUpload(event: Event) {
      console.log("handleBannerUpload chamado");
      const bannerFile = (event.target as HTMLInputElement).files?.[0];
      if (bannerFile) {
        const imageReader = new FileReader();
        imageReader.onloadend = () => {
          this.bannerUrl = imageReader.result as string;
          console.log("bannerUrl atualizado:", this.bannerUrl);
        };
        imageReader.readAsDataURL(bannerFile);
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
  },
};
</script>
