<template>
  <v-card
    v-bind="$attrs"
    :class="classes"
    class="v-card--material pa-3"
  >
    <div class="d-flex grow flex-wrap">
      <slot name="avatar">
        <v-sheet
          :color="color"
          :max-height="icon ? 90 : undefined"
          :width="icon ? 'auto' : '100%'"
          elevation="6"
          class="text-start v-card--material__heading mb-n6 mt-n10 pa-7"
          dark
        >
          <v-icon
            v-if="icon"
            size="40"
          >
            {{ icon }}
          </v-icon>
          <div
            v-if="text"
            class="headline font-weight-thin"
            v-text="text"
          />
        </v-sheet>
      </slot>

      <div
        v-if="$slots['after-heading']"
        class="ml-auto"
      >
        <slot name="after-heading" />
      </div>
    </div>

    <slot />

    <template v-if="$slots.actions">
      <v-divider class="mt-2" />

      <v-card-actions class="pb-0">
        <slot name="actions" />
      </v-card-actions>
    </template>

    <template v-if="$slots.bottom">
      <v-divider
        v-if="!$slots.actions"
        class="mt-2"
      />

      <div class="pb-0">
        <slot name="bottom" />
      </div>
    </template>
  </v-card>
</template>

<script lang="ts">
export default defineNuxtComponent({
  name: "MaterialCard",

  props: {
    avatar: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "primary",
    },
    icon: {
      type: String,
      default: undefined,
    },
    image: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  setup() {
    const { $vuetify } = useNuxtApp();
    const hasHeading = computed(() => false);
    const hasAltHeading = computed(() => false);
    const classes = computed(() => {
      return {
        "v-card--material--has-heading": hasHeading,
        "mt-3": $vuetify.display.name.value === "xs" || $vuetify.display.name.value === "sm",
      };
    });

    return {
      hasHeading,
      hasAltHeading,
      classes,
    };
  },
});
</script>

<style lang="sass">
.v-card--material
  &__avatar
    position: relative
    top: -64px
    margin-bottom: -32px

    &__heading
      position: relative
      top: -40px
      transition: .3s ease
      z-index: 1
</style>
