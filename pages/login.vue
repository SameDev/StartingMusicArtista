<template>
  <div class="container justify-center items-center content-center mx-auto bg-secondary w-full p-7 m-10 rounded-md">
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
      <input type="password" name="senha"
        class="input input-lg input-bordered text-white w-full bg-accent outline-none mb-12">

      <input class="btn btn-lg btn-primary w-full text-2xl font-bold rounded-md mt-10 " type="submit" value="Login">
      
      <div v-if="error || sucess" class="divider"></div>

      <div v-if="error" role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Ocorreu um erro: {{errorMessage}}</span>
      </div>
      <div v-if="sucess" role="alert" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Login realizado com sucesso!</span>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
const api_url = "https://starting-music.onrender.com/user/login/";
export default {
  data() {
    return {
      error: false,
      errorMessage: "",
      sucess: false
    };
  },
  methods: {
    fazerLogin() {
      const email = this.$el.querySelector('input[name="email"]').value;
      const senha = this.$el.querySelector('input[name="senha"]').value;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      };

      fetch(api_url, options)
        .then(response => {
          if (!response.ok) {
            this.error = true;

            this.errorMessage = "Erro interno no servidor!"
          }

          const authorizationHeader = response.headers.get('Authorization');

          const jwtToken = authorizationHeader;

          if (jwtToken) {
            localStorage.setItem('jwtToken', jwtToken);
            this.sucess = true

            return response.json();
            
          } else {
            this.error = true;
            this.errorMessage = "Dados inseridos errados!"
          }

          return response.json();
        })
        .then(data => {
          if (data.user) {
            const { id, email, nome, cargo, foto_perfil } = data.user;
            localStorage.setItem('userID', id)
            localStorage.setItem('userEmail', email)
            localStorage.setItem('userNome', nome)
            localStorage.setItem('userCargo', cargo)
            localStorage.setItem('userPic', foto_perfil)

            this.$router.push('/').then(() => window.location.reload());


            return Promise.resolve();
          }
  
        })
        .catch(error => {
          this.error = true
          this.errorMessage = "Erro na requisição! Verifique se você enviou todos os campos!"
        });


    },
  },
};
</script>