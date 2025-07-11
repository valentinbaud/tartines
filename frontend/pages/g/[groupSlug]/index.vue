<template>
  <div>
    <RecipeExplorerPage />
  </div>
</template>

<script lang="ts">
import RecipeExplorerPage from "~/components/Domain/Recipe/RecipeExplorerPage.vue";

export default defineNuxtComponent({
  components: { RecipeExplorerPage },
  setup() {
    // Enable scroll restoration for this page to work with our state management
    definePageMeta({
      scrollToTop: false,
    });
  },
});
</script>
