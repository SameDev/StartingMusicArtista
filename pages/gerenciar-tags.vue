<template>
  <div>
    <Sidebar />
    <section class="2xl:ml-[17%] p-10 pr-24 py-5 ">
      <Header page="Gerenciar Tags" icon="tags"></Header>

      <div class="container justify-center items-center content-center mx-auto bg-secondary w-full shadow-lg p-7 m-10 rounded-lg font-nunito">
        <div class="info flex justify-between items-center">
          <h2 class="font-bold text-xl"><font-awesome-icon :icon="['fas', 'tags']" />  Ver Todas as Tags do Sistema</h2>
          <button class="btn btn-success text-white"><font-awesome-icon :icon="['fas', 'tag']" />  Adicionar Nova Tag</button>
        </div>

        <table class="table-fixed table-zebra md:table-auto w-full border-collapse">
          <thead class="bg-accent text-secondary font-bold rounded-tr-2xl rounded-tl-2xl">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Nome</th>
              <th class="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tag, index) in tags" :key="index">
              <td class="bg-neutral border border-secondary text-secondary font-bold px-4 py-2">{{ tag.id }}</td>
              <td class="px-4 py-2 font-bold font-roboto">{{ tag.nome }}</td>
              <td class="px-4 py-2 text-center">
                <button @click="editTag(tag.id)" class="btn btn-success text-white font-bold mr-2">
                  <font-awesome-icon :icon="['fas', 'pen']" /> Editar
                </button>
                <button @click="deleteTag(tag.id)" class="btn btn-error text-white font-bold ">
                  <font-awesome-icon :icon="['fas', 'trash']" /> Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      tags: [] as Tags[]
    }
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
                  JSON.stringify({  id: tag.id, nome: tag.nome })
                ));

                this.tags = Array.from(uniqueTagsSet).map((tag) => JSON.parse(tag as string));


            }
            else {
                console.error("Falha ao buscar tags da API");
            }
        }
        catch (error: any) {
            console.error("Erro durante a busca de tags:", error.message);
        }
    },
    deleteTag(tagId: number) {
      // Lógica para excluir a tag com o ID fornecido
    },
    editTag(tagId: number) {
      // Lógica para editar a tag com o ID fornecido
    }
  }
}
</script>