import type { Recipe } from "~/lib/api/types/recipe";
import type { RecipeSearchQuery } from "~/lib/api/user/recipes/recipe";

interface RecipeListState {
  recipes: Recipe[];
  page: number;
  hasMore: boolean;
  scrollPosition: number;
  query: RecipeSearchQuery | null;
  ready: boolean;
}

const recipeListStates = new Map<string, RecipeListState>();

function generateStateKey(query: RecipeSearchQuery | null): string {
  if (!query) return "default";

  const keyParts = [
    query.search || "",
    query.orderBy || "",
    query.orderDirection || "",
    query.queryFilter || "",
    JSON.stringify(query.categories || []),
    JSON.stringify(query.tags || []),
    JSON.stringify(query.tools || []),
    JSON.stringify(query.foods || []),
    JSON.stringify(query.households || []),
  ];

  return keyParts.join("|");
}

export function useRecipeListState(query: RecipeSearchQuery | null) {
  const stateKey = generateStateKey(query);

  // Initialize state if it doesn't exist
  if (!recipeListStates.has(stateKey)) {
    recipeListStates.set(stateKey, {
      recipes: [],
      page: 1,
      hasMore: true,
      scrollPosition: 0,
      query,
      ready: false,
    });
  }

  const state = recipeListStates.get(stateKey)!;

  function saveState(newState: Partial<RecipeListState>) {
    Object.assign(state, newState);
  }

  function saveScrollPosition() {
    state.scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
  }

  function restoreScrollPosition() {
    if (state.scrollPosition > 0) {
      // Use nextTick to ensure DOM is updated before scrolling
      nextTick(() => {
        window.scrollTo(0, state.scrollPosition);
      });
    }
  }

  function clearState() {
    recipeListStates.delete(stateKey);
  }

  function hasValidState(): boolean {
    return state.recipes.length > 0 && state.ready;
  }

  function isQueryMatch(newQuery: RecipeSearchQuery | null): boolean {
    const newKey = generateStateKey(newQuery);
    return newKey === stateKey;
  }

  return {
    state: readonly(state),
    saveState,
    saveScrollPosition,
    restoreScrollPosition,
    clearState,
    hasValidState,
    isQueryMatch,
  };
}

// Clean up old states when navigating away from recipe sections
export function cleanupRecipeListStates() {
  recipeListStates.clear();
}
