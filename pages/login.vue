<template>
  <section class="min-h-screen flex items-center justify-center">
    <div class="bg-secondary flex rounded-2xl shadow-lg max-w-[1500px] p-5 items-center">
      <div class="md:w-1/1.5 px-8 md:px-16">
        <h2 class="font-bold text-2xl text-center">Login do Artista</h2>

        <form class="flex flex-col gap-4 w-full" id="form" method="post" @submit.prevent="fazerLogin">
          <input type="text" name="email" placeholder="Insira seu email" class="mt-8 input input-bordered bg-accent text-white placeholder-white mb-5 w-full  outline-none" required/> 
          <div class="relative">
            <input type="password" name="senha" placeholder="Insira sua senha" class="input input-bordered bg-accent placeholder-white text-white w-full outline-none mb-12" required/>
            <!-- <font-awesome-icon :icon="['fas', 'eye']" class="bi bi-eye absolute top-1/4 right-3 -translate-y-1/2"/>    -->
          </div>
          <button class="btn btn-lg btn-block btn-primary block font-bold rounded-md mt-10"
                :class="{ 'disabled': envio }"
                :disabled="envio"
                
                type="submit" value="Login">
              <div v-if="envio" class="loading loading-secondary"></div>
              <div v-else>Login</div>
            </button>
            <Error v-if="error" :error-message="errorMessage"/>
            <Success v-if="success" :sucess-message="successMessage"/>
            <div class="divider"></div>
        </form>
        <div class="mt-3 text-base flex justify-between items-center">
              <p class="mr-10">Não tem uma conta ou não é um artista?</p>
              <button class="btn btn-accent">Cadastro</button>
            </div>
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
const api_url = "https://starting-music.onrender.com/user/login/";



export default {
  data() {
    return {
      error: false,
      errorMessage: "",
      success: false,
      successMessage: "",
      envio: false
    };
  },
  methods: {
    mounted() {
      this.$router.push('/').then(() => window.location.reload());
    },
    fazerLogin() {
      const email = this.$el.querySelector('input[name="email"]').value;
      const senha = this.$el.querySelector('input[name="senha"]').value;

      this.envio = true;

      if (email == "" || senha == "") {
        this.envio = false;
        this.error = true;
        this.errorMessage = "Você precisa enviar todos os campos!";
        return;
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      };

      fetch(api_url, options)
        .then(async response => {
          if (!response.ok) {
            this.error = true;

            this.errorMessage = "Erro interno no servidor!"
          }

          const authorizationHeader = response.headers.get('Authorization');

          const jwtToken = authorizationHeader;

          const data = await response.json();

          if (jwtToken) {
            const cookieToken = useCookie("jwtToken", {
              maxAge: 8 * 60 * 60,
              secure: true,
              sameSite: true,
            });
            cookieToken.value = jwtToken;

            
            return data;
            
          } else {
            this.error = true;
            this.errorMessage = data.message;
            this.envio = false;
          }

          return data;
        })
        .then(data => {
          if (data.user) {
            const { id, email, nome, cargo, foto_perfil, tags, desc } = data.user;
            if (cargo === "USUARIO") {
              this.envio = false;
              this.error = true;
              this.errorMessage = "Você não tem permissões para entrar aqui!";
              return;
            }

            localStorage.setItem('userID', id);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userNome', nome);
            localStorage.setItem('userPic', foto_perfil);
            localStorage.setItem('userCargo', cargo);
            localStorage.setItem('userTags', JSON.stringify(tags) || "[]");
            localStorage.setItem('userDesc', desc);

          
            this.error = false;
            this.envio = false;
            this.success = true;
            this.successMessage = "Login Realizado!";

            this.$router.push('/').then(() => window.location.reload())

            return Promise.resolve();
          }
  
        })
        .catch(error => {
          this.error = true;
          this.errorMessage = error;
          this.envio = false;
        });


    },
  },
};
</script>