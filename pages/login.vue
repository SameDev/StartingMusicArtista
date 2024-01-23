<template>
  <div class="container justify-center items-center content-center mx-auto bg-secondary w-full p-12 mt-14 rounded-lg font-nunito">
    <h2 class="text-center font-bold text-3xl">Login do Artista</h2>
    <form class="w-full" id="form" method="post" @submit.prevent="fazerLogin">
      <div class="label">
        <span class="label-text font-bold text-xl">Qual é seu email?</span>
      </div>
      <input type="email" name="email"
        class="input input-lg input-bordered text-white mb-5 w-full bg-accent outline-none">

      <div class="label">
        <span class="label-text font-bold text-xl">Qual é sua senha?</span>
      </div>
      <input type="password" name="senha" class="input input-lg input-bordered text-white w-full bg-accent outline-none mb-12">

      <input class="btn btn-lg btn-primary w-full text-2xl font-bold rounded-md mt-10 " type="submit" value="Login">
      
      <div v-if="error || success" class="divider"></div>
      

      <Error v-if="error" :error-message="errorMessage"/>
      <Success v-if="success" :sucess-message="successMessage"/>
      <Loading v-if="envio" />
      
      
    </form>
    
  </div>
</template>

<script lang="ts">
const api_url = "https://starting-music.onrender.com/user/login/";
import error from '~/components/error.vue';
import success from '~/components/success.vue';
import loading from '~/components/loading.vue';


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

            this.success = true;
            this.successMessage = "Login Realizado!"
            this.error = false;
            this.envio = false;

            
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
            localStorage.setItem('userID', id);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userNome', nome);
            localStorage.setItem('userCargo', cargo);
            localStorage.setItem('userPic', foto_perfil);

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
  components: {
    error
  }
};
</script>