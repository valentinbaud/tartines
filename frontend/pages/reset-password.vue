<template>
  <v-container
    fill-height
    fluid
    class="d-flex justify-center align-center"
  >
    <v-card
      color="background d-flex flex-column align-center"
      flat
      width="600px"
    >
      <v-card-title class="text-h5 justify-center">
        {{ $t("user.reset-password") }}
      </v-card-title>
      <BaseDivider />
      <v-card-text>
        <v-form @submit.prevent="requestLink()">
          <v-text-field
            v-model="email"
            :prepend-inner-icon="$globals.icons.email"
            variant="solo-filled"
            flat
            autofocus
            name="login"
            :label="$t('user.email')"
            type="text"
          />
          <v-text-field
            v-model="password"
            variant="solo-filled"
            flat
            :prepend-inner-icon="$globals.icons.lock"
            name="password"
            :label="$t('user.password')"
            type="password"
            :rules="[validators.required]"
          />
          <v-text-field
            v-model="passwordConfirm"
            variant="solo-filled"
            flat
            validate-on="blur"
            :prepend-inner-icon="$globals.icons.lock"
            name="password"
            :label="$t('user.confirm-password')"
            type="password"
            :rules="[validators.required, passwordMatch]"
          />
          <p class="text-center">
            {{ $t("user.please-enter-password") }}
          </p>
          <v-card-actions class="justify-center">
            <div class="max-button">
              <v-btn
                :loading="loading"
                color="primary"
                :disabled="token === ''"
                type="submit"
                size="large"
                rounded
                class="rounded-xl"
                block
              >
                <v-icon start>
                  {{ $globals.icons.lock }}
                </v-icon>
                {{ token === "" ? "Token Required" : $t("user.reset-password") }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-form>
      </v-card-text>
      <v-btn
        class="mx-auto"
        variant="text"
        to="/login"
      >
        {{ $t("user.login") }}
      </v-btn>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { useUserApi } from "~/composables/api";
import { alert } from "~/composables/use-toast";
import { validators } from "@/composables/use-validators";
import { useRouteQuery } from "~/composables/use-router";

export default defineNuxtComponent({
  setup() {
    definePageMeta({
      layout: "basic",
    });

    const state = reactive({
      email: "",
      password: "",
      passwordConfirm: "",
      loading: false,
      error: false,
    });

    const i18n = useI18n();
    const passwordMatch = () => state.password === state.passwordConfirm || i18n.t("user.password-must-match");

    // Set page title
    useSeoMeta({
      title: i18n.t("user.login"),
    });

    // ===================
    // Token Getter
    const token = useRouteQuery("token", "");

    // ===================
    // API
    const api = useUserApi();
    async function requestLink() {
      state.loading = true;
      // TODO: Fix Response to send meaningful error
      const { response } = await api.users.resetPassword({
        token: token.value,
        email: state.email,
        password: state.password,
        passwordConfirm: state.passwordConfirm,
      });

      state.loading = false;

      if (response?.status === 200) {
        state.loading = false;
        state.error = false;
        alert.success(i18n.t("user.password-updated"));
      }
      else {
        state.loading = false;
        state.error = true;
        alert.error(i18n.t("events.something-went-wrong"));
      }
    }

    return {
      passwordMatch,
      token,
      requestLink,
      validators,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="css">
.max-button {
  width: 300px;
}
</style>
