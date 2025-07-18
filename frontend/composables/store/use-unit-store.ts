import type { Composer } from "vue-i18n";
import { useData, useStore } from "../partials/use-store-factory";
import type { IngredientUnit } from "~/lib/api/types/recipe";
import { useUserApi } from "~/composables/api";

const store: Ref<IngredientUnit[]> = ref([]);
const loading = ref(false);

export const useUnitData = function () {
  return useData<IngredientUnit>({
    id: "",
    name: "",
    fraction: true,
    abbreviation: "",
    description: "",
  });
};

export const useUnitStore = function (i18n?: Composer) {
  const api = useUserApi(i18n);
  return useStore<IngredientUnit>(store, loading, api.units);
};
