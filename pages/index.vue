<template>
  <div>
    <Dashboard v-if="isLogged" />
    <Login v-else />
  </div>
</template>

<script lang="ts">
import Login from './login.vue';
import Dashboard from './dashboard.vue';

export default {
  data() {
    return {
      jwtToken: "",
    };
  },
  beforeMount() {
    const cookieToken = useCookie("jwtToken");
    this.jwtToken = cookieToken.value as string;
  },
  computed: {
    isLogged() {
      return !!this.jwtToken;
    },
  },
  components: {
    Login,
    Dashboard,
  },
};
</script>
