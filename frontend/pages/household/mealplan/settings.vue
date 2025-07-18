<template>
  <v-container class="md-container">
    <BasePageTitle divider>
      <template #header>
        <v-img
          width="100%"
          max-height="100"
          max-width="100"
          :src="require('~/static/svgs/manage-cookbooks.svg')"
        />
      </template>
      <template #title>
        {{ $t('meal-plan.meal-plan-rules') }}
      </template>
      {{ $t('meal-plan.meal-plan-rules-description') }}
    </BasePageTitle>

    <v-card>
      <v-card-title class="headline">
        {{ $t('meal-plan.new-rule') }}
      </v-card-title>
      <v-divider class="mx-2" />
      <v-card-text>
        {{ $t('meal-plan.new-rule-description') }}

        <GroupMealPlanRuleForm
          :key="createDataFormKey"
          v-model:day="createData.day"
          v-model:entry-type="createData.entryType"
          v-model:query-filter-string="createData.queryFilterString"
          class="mt-2"
        />
      </v-card-text>
      <v-card-actions class="justify-end">
        <BaseButton
          create
          :disabled="!createData.queryFilterString"
          @click="createRule"
        />
      </v-card-actions>
    </v-card>

    <section>
      <BaseCardSectionTitle
        class="mt-10"
        :title="$t('meal-plan.recipe-rules')"
      />
      <div>
        <div
          v-for="(rule, idx) in allRules"
          :key="rule.id"
        >
          <v-card class="my-2 left-border">
            <v-card-title class="headline pb-1">
              {{ rule.day === "unset" ? $t('meal-plan.applies-to-all-days') : $t('meal-plan.applies-on-days', [rule.day]) }}
              {{ rule.entryType === "unset" ? $t('meal-plan.for-all-meal-types') : $t('meal-plan.for-type-meal-types', [rule.entryType]) }}
              <span class="ml-auto">
                <BaseButtonGroup
                  :buttons="[
                    {
                      icon: $globals.icons.edit,
                      text: $t('general.edit'),
                      event: 'edit',
                    },
                    {
                      icon: $globals.icons.delete,
                      text: $t('general.delete'),
                      event: 'delete',
                    },
                  ]"
                  @delete="deleteRule(rule.id)"
                  @edit="toggleEditState(rule.id)"
                />
              </span>
            </v-card-title>
            <v-card-text>
              <template v-if="!editState[rule.id]">
                <div v-if="rule.categories">
                  <h4 class="py-1">
                    {{ $t("category.categories") }}:
                  </h4>
                  <RecipeChips
                    v-if="rule.categories.length"
                    :items="rule.categories"
                    small
                    class="pb-3"
                  />
                  <v-card-text
                    v-else
                    label
                    class="ma-0 px-0 pt-0 pb-3"
                    text-color="accent"
                    size="small"
                    dark
                  >
                    {{ $t("meal-plan.any-category") }}
                  </v-card-text>
                </div>

                <div v-if="rule.tags">
                  <h4 class="py-1">
                    {{ $t("tag.tags") }}:
                  </h4>
                  <RecipeChips
                    v-if="rule.tags.length"
                    :items="rule.tags"
                    url-prefix="tags"
                    small
                    class="pb-3"
                  />
                  <v-card-text
                    v-else
                    label
                    class="ma-0 px-0 pt-0 pb-3"
                    text-color="accent"
                    size="small"
                    dark
                  >
                    {{ $t("meal-plan.any-tag") }}
                  </v-card-text>
                </div>
                <div v-if="rule.households">
                  <h4 class="py-1">
                    {{ $t("household.households") }}:
                  </h4>
                  <div v-if="rule.households.length">
                    <v-chip
                      v-for="household in rule.households"
                      :key="household.id"
                      label
                      class="ma-1"
                      color="accent"
                      size="small"
                      dark
                    >
                      {{ household.name }}
                    </v-chip>
                  </div>
                  <v-card-text
                    v-else
                    label
                    class="ma-0 px-0 pt-0 pb-3"
                    text-color="accent"
                    size="small"
                    dark
                  >
                    {{ $t("meal-plan.any-household") }}
                  </v-card-text>
                </div>
              </template>
              <template v-else>
                <GroupMealPlanRuleForm
                  v-model:day="allRules[idx].day"
                  v-model:entry-type="allRules[idx].entryType"
                  v-model:query-filter-string="allRules[idx].queryFilterString"
                  :query-filter="allRules[idx].queryFilter"
                />
                <div class="d-flex justify-end">
                  <BaseButton
                    update
                    :disabled="!allRules[idx].queryFilterString"
                    @click="updateRule(rule)"
                  />
                </div>
              </template>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </section>
  </v-container>
</template>

<script lang="ts">
import { useUserApi } from "~/composables/api";
import type { PlanRulesCreate, PlanRulesOut } from "~/lib/api/types/meal-plan";
import GroupMealPlanRuleForm from "~/components/Domain/Household/GroupMealPlanRuleForm.vue";
import { useAsyncKey } from "~/composables/use-utils";
import RecipeChips from "~/components/Domain/Recipe/RecipeChips.vue";

export default defineNuxtComponent({
  components: {
    GroupMealPlanRuleForm,
    RecipeChips,
  },
  middleware: ["sidebase-auth"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const api = useUserApi();
    const i18n = useI18n();

    useSeoMeta({
      title: i18n.t("meal-plan.meal-plan-settings"),
    });

    // ======================================================
    // Manage All
    const editState = ref<{ [key: string]: boolean }>({});
    const allRules = ref<PlanRulesOut[]>([]);

    function toggleEditState(id: string) {
      editState.value[id] = !editState.value[id];
      editState.value = { ...editState.value };
    }

    async function refreshAll() {
      const { data } = await api.mealplanRules.getAll();

      if (data) {
        allRules.value = data.items ?? [];
      }
    }

    useAsyncData(useAsyncKey(), async () => {
      await refreshAll();
    });

    // ======================================================
    // Creating Rules

    const createDataFormKey = ref(0);
    const createData = ref<PlanRulesCreate>({
      entryType: "unset",
      day: "unset",
      queryFilterString: "",
    });

    async function createRule() {
      const { data } = await api.mealplanRules.createOne(createData.value);
      if (data) {
        refreshAll();
        createData.value = {
          entryType: "unset",
          day: "unset",
          queryFilterString: "",
        };
        createDataFormKey.value++;
      }
    }

    async function deleteRule(ruleId: string) {
      const { data } = await api.mealplanRules.deleteOne(ruleId);
      if (data) {
        refreshAll();
      }
    }

    async function updateRule(rule: PlanRulesOut) {
      const { data } = await api.mealplanRules.updateOne(rule.id, rule);
      if (data) {
        refreshAll();
        toggleEditState(rule.id);
      }
    }

    return {
      allRules,
      createDataFormKey,
      createData,
      createRule,
      deleteRule,
      editState,
      updateRule,
      toggleEditState,
    };
  },
});
</script>
