<template>
  <BaseDialog
    v-model="dialog"
    :icon="$globals.icons.printerSettings"
    :title="$t('general.print-preferences')"
    width="70%"
    max-width="816px"
  >
    <div class="pa-6">
      <v-container class="print-config mb-3 pa-0">
        <v-row>
          <v-col
            cols="auto"
            align-self="center"
            class="text-center"
          >
            <div
              class="text-subtitle-2"
              style="text-align: center;"
            >
              {{ $t('recipe.recipe-image') }}
            </div>
            <v-btn-toggle
              v-model="preferences.imagePosition"
              mandatory="force"
              style="width: fit-content;"
            >
              <v-btn :value="ImagePosition.left">
                <v-icon>{{ $globals.icons.dockLeft }}</v-icon>
              </v-btn>
              <v-btn :value="ImagePosition.right">
                <v-icon>{{ $globals.icons.dockRight }}</v-icon>
              </v-btn>
              <v-btn :value="ImagePosition.hidden">
                <v-icon>{{ $globals.icons.windowClose }}</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col
            cols="auto"
            align-self="start"
          >
            <v-row no-gutters>
              <v-switch
                v-model="preferences.showDescription"
                hide-details
                :label="$t('recipe.description')"
              />
            </v-row>
            <v-row no-gutters>
              <v-switch
                v-model="preferences.showNotes"
                hide-details
                :label="$t('recipe.notes')"
              />
            </v-row>
          </v-col>
          <v-col
            cols="auto"
            align-self="start"
          >
            <v-row no-gutters>
              <v-switch
                v-model="preferences.showNutrition"
                hide-details
                :label="$t('recipe.nutrition')"
              />
            </v-row>
            <v-row no-gutters />
          </v-col>
        </v-row>
      </v-container>
      <v-card
        height="fit-content"
        max-height="40vh"
        width="100%"
        class="print-preview"
        style="overflow-y: auto;"
      >
        <RecipePrintView :recipe="recipe" />
      </v-card>
    </div>
  </BaseDialog>
</template>

<script lang="ts">
import type { Recipe } from "~/lib/api/types/recipe";
import { ImagePosition, useUserPrintPreferences } from "~/composables/use-users/preferences";
import RecipePrintView from "~/components/Domain/Recipe/RecipePrintView.vue";
import type { NoUndefinedField } from "~/lib/api/types/non-generated";

export default defineNuxtComponent({
  components: {
    RecipePrintView,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    recipe: {
      type: Object as () => NoUndefinedField<Recipe>,
      default: undefined,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const preferences = useUserPrintPreferences();

    // V-Model Support
    const dialog = computed({
      get: () => {
        return props.modelValue;
      },
      set: (val) => {
        context.emit("update:modelValue", val);
      },
    });

    return {
      dialog,
      ImagePosition,
      preferences,
    };
  },
});
</script>
