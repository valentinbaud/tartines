<template>
  <v-container
    v-if="shoppingListChoices && ready"
    class="narrow-container"
  >
    <BaseDialog
      v-model="createDialog"
      :title="$t('shopping-list.create-shopping-list')"
      can-submit
      @submit="createOne"
    >
      <v-card-text>
        <v-text-field
          v-model="createName"
          autofocus
          :label="$t('shopping-list.new-list')"
        />
      </v-card-text>
    </BaseDialog>

    <!-- Settings -->
    <BaseDialog
      v-model="ownerDialog"
      :icon="$globals.icons.admin"
      :title="$t('user.edit-user')"
      can-confirm
      @confirm="updateOwner"
    >
      <v-container>
        <v-form>
          <v-select
            v-model="updateUserId"
            :items="allUsers"
            item-title="fullName"
            item-value="id"
            :label="$t('general.owner')"
            :prepend-icon="$globals.icons.user"
          />
        </v-form>
      </v-container>
    </BaseDialog>

    <BaseDialog
      v-model="deleteDialog"
      :title="$t('general.confirm')"
      color="error"
      can-confirm
      @confirm="deleteOne"
    >
      <v-card-text>{{ $t('shopping-list.are-you-sure-you-want-to-delete-this-item') }}</v-card-text>
    </BaseDialog>
    <BasePageTitle divider>
      <template #header>
        <v-img
          width="100%"
          max-height="100"
          max-width="100"
          :src="require('~/static/svgs/shopping-cart.svg')"
        />
      </template>
      <template #title>
        {{ $t('shopping-list.shopping-lists') }}
      </template>
    </BasePageTitle>

    <v-container class="d-flex align-center justify-end px-0 pt-0 pb-4">
      <v-checkbox
        v-model="preferences.viewAllLists"
        hide-details
        :label="$t('general.show-all')"
        class="my-0 mr-4"
      />
      <BaseButton
        create
        class="my-0"
        @click="createDialog = true"
      />
    </v-container>

    <v-container v-if="!shoppingListChoices.length">
      <BasePageTitle>
        <template #title>
          {{ $t('shopping-list.no-shopping-lists-found') }}
        </template>
      </BasePageTitle>
    </v-container>

    <section>
      <v-card
        v-for="list in shoppingListChoices"
        :key="list.id"
        class="my-2 left-border"
        :to="`/shopping-lists/${list.id}`"
      >
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">
          {{ $globals.icons.cartCheck }}
        </v-icon>
        <span class="flex-grow-1">
          {{ list.name }}
        </span>
        <v-btn
          icon
          variant="plain"
          @click.prevent="toggleOwnerDialog(list)"
        >
          <v-icon>
            {{ $globals.icons.user }}
          </v-icon>
        </v-btn>
        <v-btn
          icon
          variant="plain"
          @click.prevent="openDelete(list.id)"
        >
          <v-icon>
            {{ $globals.icons.delete }}
          </v-icon>
        </v-btn>
      </v-card-title>
      </v-card>
    </section>
  </v-container>
</template>

<script lang="ts">
import type { ShoppingListOut } from "~/lib/api/types/household";
import { useUserApi } from "~/composables/api";
import { useAsyncKey } from "~/composables/use-utils";
import { useShoppingListPreferences } from "~/composables/use-users/preferences";
import type { UserOut } from "~/lib/api/types/user";

export default defineNuxtComponent({
  middleware: "sidebase-auth",
  setup() {
    const $auth = useMealieAuth();
    const i18n = useI18n();
    const ready = ref(false);
    const userApi = useUserApi();
    const route = useRoute();

    useSeoMeta({
      title: i18n.t("shopping-list.shopping-list"),
    });

    const groupSlug = computed(() => route.params.groupSlug || $auth.user.value?.groupSlug || "");
    const overrideDisableRedirect = ref(false);
    const disableRedirect = computed(() => route.query.disableRedirect === "true" || overrideDisableRedirect.value);
    const preferences = useShoppingListPreferences();

    const state = reactive({
      createName: "",
      createDialog: false,
      deleteDialog: false,
      deleteTarget: "",
      ownerDialog: false,
      ownerTarget: ref<ShoppingListOut | null>(null),
    });

    const { data: shoppingLists } = useAsyncData(useAsyncKey(), async () => {
      return await fetchShoppingLists();
    });

    const shoppingListChoices = computed(() => {
      if (!shoppingLists.value) {
        return [];
      }

      return shoppingLists.value.filter(list => preferences.value.viewAllLists || list.userId === $auth.user.value?.id);
    });

    // This has to appear before the shoppingListChoices watcher, otherwise that runs first and the redirect is not disabled
    watch(
      () => preferences.value.viewAllLists,
      () => {
        overrideDisableRedirect.value = true;
      },
    );

    watch(
      () => shoppingListChoices,
      () => {
        if (!disableRedirect.value && shoppingListChoices.value.length === 1) {
          navigateTo(`/shopping-lists/${shoppingListChoices.value[0].id}`);
        }
        else {
          ready.value = true;
        }
      },
      {
        deep: true,
      },
    );

    async function fetchShoppingLists() {
      const { data } = await userApi.shopping.lists.getAll(1, -1, { orderBy: "name", orderDirection: "asc" });

      if (!data) {
        return [];
      }

      return data.items;
    }

    async function refresh() {
      shoppingLists.value = await fetchShoppingLists();
    }

    async function createOne() {
      const { data } = await userApi.shopping.lists.createOne({ name: state.createName });

      if (data) {
        refresh();
        state.createName = "";
      }
    }

    async function toggleOwnerDialog(list: ShoppingListOut) {
      if (!state.ownerDialog) {
        state.ownerTarget = list;
        await fetchAllUsers();
      }
      state.ownerDialog = !state.ownerDialog;
    }

    // ===============================================================
    // Shopping List Edit User/Owner

    const allUsers = ref<UserOut[]>([]);
    const updateUserId = ref<string | undefined>();
    async function fetchAllUsers() {
      const { data } = await userApi.households.fetchMembers();
      if (!data) {
        return;
      }

      // update current user
      allUsers.value = data.items.sort((a, b) => ((a.fullName || "") < (b.fullName || "") ? -1 : 1));
      updateUserId.value = state.ownerTarget?.userId;
    }

    async function updateOwner() {
      if (!state.ownerTarget || !updateUserId.value) {
        return;
      }
      // user has not changed, so we should not update
      if (state.ownerTarget.userId === updateUserId.value) {
        return;
      }
      // get full list, so the move does not delete shopping list items
      const { data: fullList } = await userApi.shopping.lists.getOne(state.ownerTarget.id);
      if (!fullList) {
        return;
      }
      const { data } = await userApi.shopping.lists.updateOne(
        state.ownerTarget.id,
        { ...fullList, userId: updateUserId.value },
      );

      if (data) {
        refresh();
      }
    }

    function openDelete(id: string) {
      state.deleteDialog = true;
      state.deleteTarget = id;
    }

    async function deleteOne() {
      const { data } = await userApi.shopping.lists.deleteOne(state.deleteTarget);
      if (data) {
        refresh();
      }
    }

    return {
      ...toRefs(state),
      ready,
      groupSlug,
      preferences,
      shoppingListChoices,
      createOne,
      toggleOwnerDialog,
      allUsers,
      updateUserId,
      updateOwner,
      deleteOne,
      openDelete,
    };
  },
});
</script>
