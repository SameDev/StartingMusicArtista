<template>
  <section class="min-h-screen flex items-center justify-center">
    <div class="bg-secondary flex rounded-2xl shadow-lg max-w-5xl p-5 items-center">
      <div class="md:w-1/2 px-8 md:px-16">
        <h2 class="font-bold text-2xl text-center">Cadastro de Usuário</h2>

        <form class="flex flex-col gap-4 w-full mt-10" id="form" method="post" @submit.prevent="fazerCadastro">
          <input type="text" v-model="nome" placeholder="Nome" class="input input-bordered bg-accent text-white placeholder-white mb-5 w-full outline-none" required/> 
          <input type="email" v-model="email" placeholder="Email" class="input input-bordered bg-accent text-white placeholder-white mb-5 w-full outline-none" required/>
          <input type="password" v-model="senha" placeholder="Senha" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required/>
          <input type="date" v-model="data_nasc" placeholder="Data de Nascimento" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required/>
          <select v-model="cargo" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required>
            <option value="">Selecione o cargo</option>
            <option value="USUARIO">Usuário</option>
            <option value="ARTISTA">Artista</option>
          </select>
          <textarea v-model="desc" placeholder="Descrição" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required></textarea>
          <input type="text" v-model="tags" placeholder="Tags" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required/>
          <input type="text" v-model="banner" placeholder="URL do Banner" class="input input-bordered bg-accent text-white placeholder-white w-full outline-none mb-5" required/>
          <button class="btn btn-lg btn-block btn-primary block font-bold rounded-md mt-10 bg-gradient-to-br from-primary to-[#282250]"
                :disabled="envio"
                type="submit">
            <div v-if="envio" class="loading loading-secondary"></div>
            <div v-else>Cadastrar</div>
          </button>
          <Error v-if="error" :error-message="errorMessage"/>
          <Success v-if="success" :sucess-message="successMessage"/>
          <div class="divider"></div>
        </form>
      </div>
      <div class="md:flex hidden w-1/2 flex-col items-center justify-center">
        <NuxtImg class="rounded-2xl mb-5"  src="/login.jpg"/>
        <div class="logo flex items-center justify-center">
          <NuxtImg class="w-20 h-20" src="/logo.svg"/>
          <h2 class="ml-4 font-bold font-nunit">Starting Music</h2>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
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
      tags: "",
      banner: ""
    };
  },
  methods: {
    async fazerCadastro() {
      this.envio = true;
      const { nome, email, senha, data_nasc, cargo, desc, tags, banner } = this;

      if (!nome || !email || !senha || !data_nasc || !cargo || !desc || !tags || !banner) {
        this.envio = false;
        this.error = true;
        this.errorMessage = "Por favor, preencha todos os campos.";
        return;
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha, data_nasc, cargo, desc, tags, banner }),
      };

      try {
        const response = await fetch(api_url, options);
        if (!response.ok) {
          throw new Error("Erro ao cadastrar usuário.");
        }
        console.log("Usuário cadastrado com sucesso!");
        this.envio = false;
        his.$router.push('/').then(() => window.location.reload())
      } catch (error) {
        console.error("Erro:", error);
        this.error = true;
        this.errorMessage = "Erro ao enviar solicitação.";
        this.envio = false;
      }
    },
  },
};
</script>
