<template>
  <div>
    <v-container v-show="!isCookMode" key="recipe-page" class="px-0" :class="{ 'pa-0': $vuetify.display.smAndDown.value }">
      <v-card :flat="$vuetify.display.smAndDown.value" class="d-print-none">
        <RecipePageHeader
          :recipe="recipe"
          :recipe-scale="scale"
          :landscape="landscape"
          @save="saveRecipe"
          @delete="deleteRecipe"
        />
        <RecipeJsonEditor
          v-if="isEditJSON"
          v-model="recipe"
          class="mt-10"
          mode="text"
          :main-menu-bar="false"
        />
        <v-card-text v-else>
          <!--
            This is where most of the main content is rendered. Some components include state for both Edit and View modes
            which is why some have explicit v-if statements and others use the composition API to determine and manage
            the shared state internally.

            The global recipe object is shared down the tree of components and _is_ mutated by child components. This is
            some-what of a hack of the system and goes against the principles of Vue, but it _does_ seem to work and streamline
            a significant amount of prop management. When we move to Vue 3 and have access to some of the newer API's the plan to update this
            data management and mutation system we're using.
          -->
          <div>
            <RecipePageInfoEditor v-if="isEditMode" v-model="recipe" />
          </div>
          <div>
            <RecipePageEditorToolbar v-if="isEditForm" v-model="recipe" />
          </div>
          <div>
            <RecipePageIngredientEditor v-if="isEditForm" v-model="recipe" />
          </div>
          <div>
            <RecipePageScale v-model:scale="scale" :recipe="recipe" />
          </div>

          <!--
            This section contains the 2 column layout for the recipe steps and other content.
          -->
          <v-row>
            <!--
              The left column is conditionally rendered based on cook mode.
            -->
            <v-col v-if="!isCookMode || isEditForm" cols="12" sm="12" md="4" lg="4">
              <RecipePageIngredientToolsView v-if="!isEditForm" :recipe="recipe" :scale="scale" />
              <RecipePageOrganizers v-if="$vuetify.display.mdAndUp" v-model="recipe" @item-selected="chipClicked" />
            </v-col>
            <v-divider v-if="$vuetify.display.mdAndUp && !isCookMode" class="my-divider" :vertical="true" />

            <!--
              the right column is always rendered, but it's layout width is determined by where the left column is
              rendered.
            -->
            <v-col cols="12" sm="12" :md="8 + (isCookMode ? 1 : 0) * 4" :lg="8 + (isCookMode ? 1 : 0) * 4">
              <RecipePageInstructions
                v-model="recipe.recipeInstructions"
                v-model:assets="recipe.assets"
                :recipe="recipe"
                :scale="scale"
              />
              <div v-if="isEditForm" class="d-flex">
                <RecipeDialogBulkAdd class="ml-auto my-2 mr-1" @bulk-data="addStep" />
                <BaseButton class="my-2" @click="addStep()">
                  {{ $t("general.add") }}
                </BaseButton>
              </div>
              <div v-if="!$vuetify.display.mdAndUp">
                <RecipePageOrganizers v-model="recipe" />
              </div>
              <RecipeNotes v-model="recipe.notes" :edit="isEditForm" />
            </v-col>
          </v-row>
          <RecipePageFooter v-model="recipe" />
        </v-card-text>
      </v-card>
      <WakelockSwitch />
      <RecipePageComments
        v-if="!recipe.settings.disableComments && !isEditForm && !isCookMode"
        v-model="recipe"
        class="px-1 my-4 d-print-none"
      />
      <RecipePrintContainer :recipe="recipe" :scale="scale" />
    </v-container>
    <!-- Cook mode displayes two columns with ingredients and instructions side by side, each being scrolled individually, allowing to view both at the same time -->
    <v-sheet
      v-show="isCookMode && !hasLinkedIngredients"
      key="cookmode"
    >
      <!-- the calc is to account for the toolbar a more dynamic solution could be needed  -->
      <v-row style="height: 100%" no-gutters class="overflow-hidden">
        <v-col cols="12" sm="5" class="overflow-y-auto pl-4 pr-3 py-2" style="height: 100%">
          <div class="d-flex align-center">
            <RecipePageScale v-model:scale="scale" :recipe="recipe" />
          </div>
          <RecipePageIngredientToolsView
            v-if="!isEditForm"
            :recipe="recipe"
            :scale="scale"
            :is-cook-mode="isCookMode"
          />
          <v-divider />
        </v-col>
        <v-col class="overflow-y-auto"
        :class="$vuetify.display.smAndDown.value ? 'py-2': 'py-6'"
        style="height: 100%" cols="12" sm="7">
          <h2 class="text-h5 px-4 font-weight-medium opacity-80">
            {{ $t('recipe.instructions') }}
          </h2>
          <RecipePageInstructions
            v-model="recipe.recipeInstructions"
            v-model:assets="recipe.assets"
            class="overflow-y-hidden px-4"
            :recipe="recipe"
            :scale="scale"
          />
        </v-col>
      </v-row>
    </v-sheet>
    <v-sheet v-show="isCookMode && hasLinkedIngredients">
      <div class="mt-2 px-2 px-md-4">
        <RecipePageScale v-model:scale="scale" :recipe="recipe" />
      </div>
      <RecipePageInstructions
        v-model="recipe.recipeInstructions"
        v-model:assets="recipe.assets"
        class="overflow-y-hidden mt-n5 px-2 px-md-4"
        :recipe="recipe"
        :scale="scale"
      />

      <div v-if="notLinkedIngredients.length > 0" class="px-2 px-md-4 pb-4">
        <v-divider />
        <v-card flat>
          <v-card-title>{{ $t("recipe.not-linked-ingredients") }}</v-card-title>
          <RecipeIngredients
            :value="notLinkedIngredients"
            :scale="scale"
            :disable-amount="recipe.settings.disableAmount"
            :is-cook-mode="isCookMode"
          />
        </v-card>
      </div>
    </v-sheet>
    <v-btn
      v-if="isCookMode"
      icon
      color="primary"
      style="position: fixed; right: 12px; top: 60px"
      @click="toggleCookMode()"
    >
      <v-icon>{{ $globals.icons.close }}</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { invoke, until } from "@vueuse/core";
import RecipeIngredients from "../RecipeIngredients.vue";
import RecipePageEditorToolbar from "./RecipePageParts/RecipePageEditorToolbar.vue";
import RecipePageFooter from "./RecipePageParts/RecipePageFooter.vue";
import RecipePageHeader from "./RecipePageParts/RecipePageHeader.vue";
import RecipePageIngredientEditor from "./RecipePageParts/RecipePageIngredientEditor.vue";
import RecipePageIngredientToolsView from "./RecipePageParts/RecipePageIngredientToolsView.vue";
import RecipePageInstructions from "./RecipePageParts/RecipePageInstructions.vue";
import RecipePageOrganizers from "./RecipePageParts/RecipePageOrganizers.vue";
import RecipePageScale from "./RecipePageParts/RecipePageScale.vue";
import RecipePageInfoEditor from "./RecipePageParts/RecipePageInfoEditor.vue";
import RecipePageComments from "./RecipePageParts/RecipePageComments.vue";
import RecipePrintContainer from "~/components/Domain/Recipe/RecipePrintContainer.vue";
import {
  clearPageState,
  PageMode,
  usePageState,
} from "~/composables/recipe-page/shared-state";
import type { NoUndefinedField } from "~/lib/api/types/non-generated";
import type { Recipe, RecipeCategory, RecipeTag, RecipeTool } from "~/lib/api/types/recipe";
import { useRouteQuery } from "~/composables/use-router";
import { useUserApi } from "~/composables/api";
import { uuid4, deepCopy } from "~/composables/use-utils";
import RecipeDialogBulkAdd from "~/components/Domain/Recipe/RecipeDialogBulkAdd.vue";
import RecipeNotes from "~/components/Domain/Recipe/RecipeNotes.vue";
import { useNavigationWarning } from "~/composables/use-navigation-warning";

const recipe = defineModel<NoUndefinedField<Recipe>>({ required: true });

const { $vuetify } = useNuxtApp();
const i18n = useI18n();
const $auth = useMealieAuth();
const route = useRoute();

const groupSlug = computed(() => (route.params.groupSlug as string) || $auth.user?.value?.groupSlug || "");

const router = useRouter();
const api = useUserApi();
const { setMode, isEditForm, isEditJSON, isCookMode, isEditMode, toggleCookMode }
  = usePageState(recipe.value.slug);
const { deactivateNavigationWarning } = useNavigationWarning();
const notLinkedIngredients = computed(() => {
  return recipe.value.recipeIngredient.filter((ingredient) => {
    return !recipe.value.recipeInstructions.some(step =>
      step.ingredientReferences?.map(ref => ref.referenceId).includes(ingredient.referenceId),
    );
  });
});

/** =============================================================
 * Recipe Snapshot on Mount
 * this is used to determine if the recipe has been changed since the last save
 * and prompts the user to save if they have unsaved changes.
 */
const originalRecipe = ref<Recipe | null>(null);

invoke(async () => {
  await until(recipe.value).not.toBeNull();
  originalRecipe.value = deepCopy(recipe.value);
});

onUnmounted(async () => {
  const isSame = JSON.stringify(recipe.value) === JSON.stringify(originalRecipe.value);
  if (isEditMode.value && !isSame && recipe.value?.slug !== undefined) {
    const save = window.confirm(i18n.t("general.unsaved-changes"));

    if (save) {
      await api.recipes.updateOne(recipe.value.slug, recipe.value);
    }
  }
  deactivateNavigationWarning();
  toggleCookMode();

  clearPageState(recipe.value.slug || "");
  console.debug("reset RecipePage state during unmount");
});
const hasLinkedIngredients = computed(() => {
  return recipe.value.recipeInstructions.some(
    step => step.ingredientReferences && step.ingredientReferences.length > 0,
  );
});
/** =============================================================
 * Set State onMounted
 */

type BooleanString = "true" | "false" | "";

const edit = useRouteQuery<BooleanString>("edit", "");

onMounted(() => {
  if (edit.value === "true") {
    setMode(PageMode.EDIT);
  }
});

/** =============================================================
 * Recipe Save Delete
 */

async function saveRecipe() {
  const { data } = await api.recipes.updateOne(recipe.value.slug, recipe.value);
  setMode(PageMode.VIEW);
  if (data?.slug) {
    router.push(`/g/${groupSlug.value}/r/` + data.slug);
  }
}

async function deleteRecipe() {
  const { data } = await api.recipes.deleteOne(recipe.value.slug);
  if (data?.slug) {
    router.push(`/g/${groupSlug.value}`);
  }
}

/** =============================================================
 * View Preferences
 */
const landscape = computed(() => {
  const preferLandscape = recipe.value.settings.landscapeView;
  const smallScreen = !$vuetify.display.smAndUp.value;

  if (preferLandscape) {
    return true;
  }
  else if (smallScreen) {
    return true;
  }

  return false;
});

/** =============================================================
 * Bulk Step Editor
 * TODO: Move to RecipePageInstructions component
 */

function addStep(steps: Array<string> | null = null) {
  if (!recipe.value.recipeInstructions) {
    return;
  }

  if (steps) {
    const cleanedSteps = steps.map((step) => {
      return { id: uuid4(), text: step, title: "", ingredientReferences: [] };
    });

    recipe.value.recipeInstructions.push(...cleanedSteps);
  }
  else {
    recipe.value.recipeInstructions.push({
      id: uuid4(),
      text: "",
      title: "",
      summary: "",
      ingredientReferences: [],
    });
  }
}

/** =============================================================
 * RecipeChip Clicked
 */

function chipClicked(item: RecipeTag | RecipeCategory | RecipeTool, itemType: string) {
  if (!item.id) {
    return;
  }
  router.push(`/g/${groupSlug.value}?${itemType}=${item.id}`);
}

const scale = ref(1);

// expose to template
// (all variables used in template are top-level in <script setup>)
</script>

<style lang="css">
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
}

.list-group {
  min-height: 38px;
}

.list-group-item i {
  cursor: pointer;
}
</style>
