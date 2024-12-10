<template>
  <div>
    <Sidebar />
    <section class="2xl:ml-[17%] md:p-10 p-5 md:pr-24 py-5 ">
      <Header page="Gerenciar Tags" icon="tags"></Header>

      <div class="container justify-center items-center content-center mx-auto bg-secondary w-full shadow-lg p-7 m-10 rounded-lg font-nunito">
        <div class="info flex justify-between items-center flex-wrap">
          <h2 class="font-bold text-xl"><font-awesome-icon :icon="['fas', 'tags']" />  Ver Todas as Tags do Sistema</h2>
          <button @click="openAddTagModal" class="btn btn-success text-white md:w-auto w-full"><font-awesome-icon :icon="['fas', 'tag']" />  Adicionar Nova Tag</button>
        </div>

        <table class="table-fixed table-zebra md:table-auto w-full border-collapse text-center text-xl">
          <thead class="bg-primary text-white font-bold rounded-tr-2xl rounded-tl-2xl">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Nome</th>
              <th class="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tag, index) in tags" :key="index">
              <td class="bg-accent border border-secondary text-secondary font-bold px-4 py-2">{{ tag.id }}</td>
              <td class="px-4 py-2 font-bold font-roboto">{{ tag.nome }}</td>
              <td class="px-4 py-2 text-center">
                <button @click="editTag(tag.id)" class="btn btn-success text-white font-bold md:mr-2">
                  <font-awesome-icon :icon="['fas', 'pen']" /> <span class="hidden md:block">Editar</span>
                </button>
                <button @click="deleteTag(tag)" class="btn btn-error text-white font-bold">
                  <font-awesome-icon :icon="['fas', 'trash']" /> <span class="hidden md:block">Excluir</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination flex w-full justify-center items-center text-center font-bold font-nunit mt-2">
          <button class="btn btn-primary mr-5 text-4xl" @click="prevPage" :disabled="currentPage === 1">&#8249;</button>
          <span>{{ currentPage }} de {{ totalPages }}</span>
          <button class="btn btn-primary ml-5 text-4xl" @click="nextPage" :disabled="currentPage === totalPages"> &#8250;</button>
        </div>
        
      </div>
      <AdicionarTag v-if="showAddTagModal" @close="closeAddTagModal" @tag-added="handleTagAdded"/>
      <ExcluirTag 
      v-if="showRemoveTagModal" 
      @tag-removed="handleTagRemoved"
      :tag="tagToRemove"
      @close="fecharModal"/>
      
      <EditarTag v-if="showEditTagModal" 
      @close="closeEditTagModal" 
      @tag-updated="handleTagUpdated" 
      :tagId="tagToEdit?.id" 
      :tagName="tagToEdit?.nome" />
    </section>
  </div>
  <Loading v-if="loading"/>
</template>

<script lang="ts">
import type { Tags } from '~/interfaces/apiRef';

export default {
  data() {
    return {
      tags: [] as Tags[],
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalTags: 0,
      showAddTagModal: false,
      showRemoveTagModal: false,
      tagToRemove: null as Tags | null,
      showEditTagModal: false,
      tagToEdit: null as Tags | null,
      loading: false
    }
  },
  beforeMount() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
        try {
          this.loading = true;
            const response = await fetch(`https://starting-music.onrender.com/tags?page=${this.currentPage}&pageSize=${this.pageSize}`);
            if (response.ok) {
                const { tags, total } = await response.json();
                this.tags = tags;
                this.totalTags = total;
                this.loading = false;
                this.calculateTotalPages();
            }
            else {
                console.error("Falha ao buscar tags da API");
            }
        }
        catch (error: any) {
            console.error("Erro durante a busca de tags:", error.message);
        }
    },
    calculateTotalPages() {
      this.totalPages = Math.ceil(this.totalTags / this.pageSize);
    },
    deleteTag(tag: Tags) {
      this.tagToRemove = tag;
      this.showRemoveTagModal = true;
    },
    handleTagRemoved(removedTag: Tags) {
      this.tags = this.tags.filter(tag => tag.id !== removedTag.id);
      this.showRemoveTagModal = false;
    },
    fecharModal() {
      this.showRemoveTagModal = false;
    },
    editTag(tagId: number) {
      const tag = this.tags.find(tag => tag.id === tagId);
      if (tag) {
        this.tagToEdit = tag;
        this.showEditTagModal = true;
      }
    },
    openAddTagModal() {
      this.showAddTagModal = true;
    },
    closeAddTagModal() {
      this.showAddTagModal = false;
    },
    handleTagAdded(newTag: Tags) {
      this.tags.push(newTag);
      this.closeAddTagModal();
      this.fetchTags(); 
    },
    closeEditTagModal() {
      this.showEditTagModal = false;
      this.tagToEdit = null;
    },
    handleTagUpdated(updatedTag: Tags) {
      const index = this.tags.findIndex(tag => tag.id === updatedTag.id);
      if (index !== -1) {
        this.tags[index] = updatedTag;
      }
      this.closeEditTagModal();
    },
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchTags();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchTags();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchTags();
      }
    }
  }
}
</script>
