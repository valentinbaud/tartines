<template>
  <div>
    <v-card-actions>
      <v-menu
        v-if="tableConfig.hideColumns"
        offset-y
        bottom
        nudge-bottom="6"
        :close-on-content-click="false"
      >
        <template #activator="{ props }">
          <v-btn
            color="accent"
            variant="elevated"
            v-bind="props"
          >
            <v-icon>
              {{ $globals.icons.cog }}
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <v-checkbox
              v-for="itemValue in headers"
              :key="itemValue.text + itemValue.show"
              v-model="filteredHeaders"
              :value="itemValue.value"
              density="compact"
              flat
              inset
              :label="itemValue.text"
              hide-details
            />
          </v-card-text>
        </v-card>
      </v-menu>
      <BaseOverflowButton
        v-if="bulkActions.length > 0"
        :disabled="selected.length < 1"
        mode="event"
        color="info"
        variant="elevated"
        :items="bulkActions"
        v-on="bulkActionListener"
      />
      <slot name="button-row" />
    </v-card-actions>
    <div class="mx-2 clip-width">
      <v-text-field
        v-model="search"
        variant="underlined"
        :label="$t('search.search')"
      />
    </div>
    <v-data-table
      v-model="selected"
      return-object
      :headers="activeHeaders"
      :show-select="bulkActions.length > 0"
      :sort-by="sortBy"
      :items="data || []"
      :items-per-page="15"
      :search="search"
      class="elevation-2"
    >
      <template
        v-for="header in headersWithoutActions"
        #[`item.${header.value}`]="{ item }"
      >
        <slot
          :name="'item.' + header.value"
          v-bind="{ item }"
        >
          {{ item[header.value] }}
        </slot>
      </template>
      <template #[`item.actions`]="{ item }">
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
          @delete="$emit('delete-one', item)"
          @edit="$emit('edit-one', item)"
        />
      </template>
    </v-data-table>
    <v-card-actions class="justify-end">
      <slot name="button-bottom" />
      <BaseButton
        color="info"
        @click="downloadAsJson(data, 'export.json')"
      >
        <template #icon>
          {{ $globals.icons.download }}
        </template>
        {{ $t("general.download") }}
      </BaseButton>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import { downloadAsJson } from "~/composables/use-utils";

export interface TableConfig {
  hideColumns: boolean;
  canExport: boolean;
}

export interface TableHeaders {
  text: string;
  value: string;
  show: boolean;
  align?: string;
  sortable?: boolean;
  sort?: (a: any, b: any) => number;
}

export interface BulkAction {
  icon: string;
  text: string;
  event: string;
}

export default defineNuxtComponent({
  props: {
    tableConfig: {
      type: Object as () => TableConfig,
      default: () => ({
        hideColumns: false,
        canExport: false,
      }),
    },
    headers: {
      type: Array as () => TableHeaders[],
      required: true,
    },
    data: {
      type: Array as () => any[],
      required: true,
    },
    bulkActions: {
      type: Array as () => BulkAction[],
      default: () => [],
    },
    initialSort: {
      type: String,
      default: "id",
    },
    initialSortDesc: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["delete-one", "edit-one"],
  setup(props, context) {
    const i18n = useI18n();
    const sortBy = computed(() => [{
      key: props.initialSort,
      order: props.initialSortDesc ? "desc" : "asc",
    }]);

    // ===========================================================
    // Reactive Headers
    const filteredHeaders = computed<string[]>(() => {
      return props.headers.filter(header => header.show).map(header => header.value);
    });

    const headersWithoutActions = computed(() =>
      props.headers
        .filter(header => filteredHeaders.value.includes(header.value))
        .map(header => ({
          ...header,
          title: i18n.t(header.text),
        })),
    );

    const activeHeaders = computed(() => [
      ...headersWithoutActions.value,
      { title: "", value: "actions", show: true, align: "end" },
    ]);

    const selected = ref<any[]>([]);

    // ===========================================================
    // Bulk Action Event Handler

    const bulkActionListener = computed(() => {
      const handlers: { [key: string]: () => void } = {};

      props.bulkActions.forEach((action) => {
        handlers[action.event] = () => {
          context.emit(action.event, selected.value);
          // clear selection
          selected.value = [];
        };
      });

      return handlers;
    });

    const search = ref("");

    return {
      sortBy,
      selected,
      filteredHeaders,
      headersWithoutActions,
      activeHeaders,
      bulkActionListener,
      search,
      downloadAsJson,
    };
  },
});
</script>

<style>
.clip-width {
  max-width: 400px;
}
.v-btn--disabled {
  opacity: 0.5 !important;
}
</style>
