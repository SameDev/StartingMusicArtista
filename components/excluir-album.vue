<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-5 rounded-lg">
        <h3 class="text-lg font-bold">Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir este álbum?</p>
        <div class="flex justify-end mt-5">
            <button @click="cancel" class="btn btn-secondary mr-3">Cancelar</button>
            <button @click="confirm" class="btn btn-error">Excluir</button>
        </div>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>
