<template>
  <div>
    <Dashboard v-if="jwtToken" />
    <Login v-else />
  </div>
</template>

<script lang="ts">
import Login from './login.vue';
import Dashboard from './dashboard.vue';

export default {
  data() {
    return {
      jwtToken: localStorage.getItem("jwtToken")
    }
  },
  components: {
    Login,
    Dashboard
  }
}
</script>