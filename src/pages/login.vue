<script setup>
import { useTheme } from 'vuetify'
import logo from '@/assets/logo.svg?raw'
import authV1MaskDark from '@/assets/images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@/assets/images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@/assets/images/pages/auth-v1-tree-2.png'
import authV1Tree from '@/assets/images/pages/auth-v1-tree.png'
import { useUserStore } from '@/stores/user'
import router from '../router'

const userStore = useUserStore()
const form = ref({
  email: '',
  password: '',
})

const resPass = ref({
  email: '',
})

const isErrorVisible = ref(false)
const vuetifyTheme = useTheme()
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

const rulesUser = ref({
  emailRules: [
    v => !!v || "Пошта обов'язкова",
    v => /.+@.+/.test(v) || 'Некоректний запис пошти',
  ],
})

const resPassword = ref(false)

const isPasswordVisible = ref(false)

const authData = computed(() => {
  return { password: form.password.value, email: form.email.value }
})

const logIn = async () => {
  try {
    await userStore.login(form.value)
  } catch {
    isErrorVisible.value = true
  }
}

async function resetPass(){

  console.log(resPass.value.email)

  await userStore.resetPass(resPass.value.email)
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div v-html="logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
          Увійти
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Пошта"
                type="email"
                :rules="rulesUser.emailRules"
                @input="isErrorVisible = false"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Пароль"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                @input="isErrorVisible = false"
              />

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <a
                  class="ms-2 mb-1"
                  @click="resPassword = true"
                >
                  Забули пароль?
                </a>
              </div>

              <div class="mt-1 mb-4">
                <VAlert
                  type="error"
                  :class="isErrorVisible ? 'd-flex' : 'd-none'"
                >
                  Невірний логін чи пароль
                </VAlert>
              </div>

              <!-- login button -->
              <VBtn
                block
                @click="logIn"
              >
                Увійти
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Ще немає аккаунту?</span>
              <RouterLink
                class="text-primary ms-2"
                :to="{ name: 'register' }"
              >
                Зареєструйтесь
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <VImg
      class="auth-footer-start-tree d-none d-md-block"
      :src="authV1Tree"
      :width="250"
    />

    <VImg
      :src="authV1Tree2"
      class="auth-footer-end-tree d-none d-md-block"
      :width="350"
    />

    <!-- bg img -->
    <VImg
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
    />
  </div>

  <VDialog
    v-model="resPassword"
    persistent
    max-width="400"
  >
    <VCard>
      <VCardTitle style="text-align: center">
        Введіть пошту для відновлення
      </VCardTitle>
      <VCardText>
        <VTextField
          v-model="resPass.email"
          label="Пошта"
          type="email"
          :rules="rulesUser.emailRules"
          @input="isErrorVisible = false"
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="green darken-1"
          text
          @click="resPassword = false; resPass.email = ''"
        >
          Відмінити
        </VBtn>

        <VBtn
          color="green darken-1"
          text
          :disabled='!resPass.email'
          @click="resetPass(); resPassword = false; resPass.email = ''"
        >
          Змінити
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang='scss'>
@use "@core/scss/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  requiresUnAuth: true
</route>
