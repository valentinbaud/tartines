import { computed, reactive, ref } from "@nuxtjs/composition-api";
import { useStoreActions } from "./partials/use-actions-factory";
import { useUserApi } from "~/composables/api";
import { GroupRecipeActionOut, GroupRecipeActionType } from "~/lib/api/types/household";
import { RequestResponse } from "~/lib/api/types/non-generated";
import { Recipe } from "~/lib/api/types/recipe";

const groupRecipeActions = ref<GroupRecipeActionOut[] | null>(null);
const loading = ref(false);

export function useGroupRecipeActionData() {
  const data = reactive({
    id: "",
    actionType: "link" as GroupRecipeActionType,
    title: "",
    url: "",
  });

  function reset() {
    data.id = "";
    data.actionType = "link";
    data.title = "";
    data.url = "";
  }

  return {
    data,
    reset,
  };
}

export const useGroupRecipeActions = function (
  orderBy: string | null = "title",
  orderDirection: string | null = "asc",
) {
  const api = useUserApi();
  async function refreshGroupRecipeActions() {
    loading.value = true;
    const { data } = await api.groupRecipeActions.getAll(1, -1, { orderBy, orderDirection });
    groupRecipeActions.value = data?.items || null;
    loading.value = false;
  }

  const recipeActions = computed<GroupRecipeActionOut[] | null>(() => {
    return groupRecipeActions.value;
  });

  function getTokenLink(token: string, groupSlug: string) {
    return `${window.location.origin}/g/${groupSlug}/shared/r/${token}`;
  }

  async function parseRecipeActionUrl(url: string, recipe: Recipe, recipeScale: number): Promise<string> {
    const recipeServings = (recipe.recipeServings || 1) * recipeScale;
    const recipeYieldQuantity = (recipe.recipeYieldQuantity || 1) * recipeScale;

    /* eslint-disable no-template-curly-in-string */
    const shareLinkRegex = /\$\{share-link-expires-seconds-[0-9]+\}/g;
    const group = (await api.groups.getOne(recipe.groupId || "")).data;


    const shareLinkStringMatches = url.matchAll(shareLinkRegex);
    if (shareLinkStringMatches) {
      const shareLinkSet = new Set<string>();
      for (const match of shareLinkStringMatches) {
        shareLinkSet.add(match[0]);
      }
      const shareLinkStrings = Array.from(shareLinkSet.values());

      for (let i = 0; i < shareLinkStrings.length; i++) {
        const shareLinkString = shareLinkStrings[i];
        const seconds = parseInt(shareLinkString.split("-")[4]);
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + seconds);

        const shareLink = await api.recipes.share.createOne({
          recipeId: recipe.id || "",
          expiresAt: expires.toISOString(),
        });

        const groupSlug = group?.slug || "";
        url = url.replace(shareLinkString, getTokenLink(shareLink.data?.id || "", groupSlug));
      }
    }

    return url
      .replace("${url}", window.location.href)
      .replace("${id}", recipe.id || "")
      .replace("${slug}", recipe.slug || "")
      .replace("${servings}", recipeServings.toString())
      .replace("${yieldQuantity}", recipeYieldQuantity.toString())
      .replace("${yieldText}", recipe.recipeYield || "")
    /* eslint-enable no-template-curly-in-string */
  };

  async function execute(action: GroupRecipeActionOut, recipe: Recipe, recipeScale: number): Promise<void | RequestResponse<unknown>> {
    const url = await parseRecipeActionUrl(action.url, recipe, recipeScale);

    switch (action.actionType) {
      case "link":

        window.open(url, "_blank")?.focus();
        return;
      case "post":
        return await api.groupRecipeActions.triggerAction(action.id, recipe.slug || "");
      default:
        break;
    }
  };

  if (!groupRecipeActions.value && !loading.value) {
    refreshGroupRecipeActions();
  };

  const actions = {
    ...useStoreActions<GroupRecipeActionOut>(api.groupRecipeActions, groupRecipeActions, loading),
    flushStore() {
      groupRecipeActions.value = [];
    }
  }

  return {
    actions,
    execute,
    recipeActions,
  };
};
