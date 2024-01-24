<template>
  <section class="min-h-screen flex items-center justify-center">
    <div class="bg-secondary flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">
      <div class="md:w-1/2 px-8 md:px-16">
        <h2 class="font-bold text-2xl">Login do Artista</h2>

        <form class="flex flex-col gap-4" id="form" method="post" @submit.prevent="fazerLogin">
          <input type="email" name="email" class="mt-8 input input-bordered text-white mb-5 w-full bg-accent outline-none" required/> 
          <div class="relative">
            <input type="password" name="senha" class="input input-bordered text-white w-full bg-accent outline-none mb-12" required/>
            <!-- <font-awesome-icon :icon="['fas', 'eye']" class="bi bi-eye absolute top-1/4 right-3 -translate-y-1/2"/>    -->
          </div>
          <button class="btn btn-lg btn-block btn-primary block font-bold rounded-md mt-10"
                :class="{ 'disabled': envio }"
                :disabled="envio"
                
                type="submit" value="Login">
              <div v-if="envio" class="loading loading-secondary"></div>
              <div v-else>Login</div>
            </button>
            <div class="divider"></div>
            <div class="mt-3 text-xs flex justify-between items-center">
              <p class="mr-2">Não tem uma conta ou não é um artista?</p>
              <button class="btn btn-accent">Cadastro</button>
            </div>
          

          <Error v-if="error" :error-message="errorMessage"/>
          <Success v-if="success" :sucess-message="successMessage"/>
        </form>
      </div>
      <div class="md:block hidden w-1/2">
        <img class="rounded-2xl" src="https://images.unsplash.com/photo-1616606103915-dea7be788566?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80">
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
            const body = response.body || "";
            console.log(body)
            this.error = true;
            this.errorMessage = data.message;
            this.envio = false;
          }

          return data;
        })
        .then(data => {
          if (data.user) {
            const { id, email, nome, cargo, foto_perfil } = data.user;
            if (cargo === "USUARIO") {
              this.envio = false;
              this.error = true;
              this.errorMessage = "Você não tem permissões para entrar aqui!";
              return;
            }

            localStorage.setItem('userID', id);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userNome', nome);
            localStorage.setItem('userCargo', cargo);
            localStorage.setItem('userPic', foto_perfil);

            this.error = false;
            this.envio = false;
            this.success = true;
            this.successMessage = "Login Realizado!";

            this.$router.push('/').then(() => window.location.reload());

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