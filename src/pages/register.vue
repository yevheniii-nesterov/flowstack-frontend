<script setup>
import { useTheme } from 'vuetify'
import logo from '@/assets/logo.svg?raw'
import authV1MaskDark from '@/assets/images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@/assets/images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@/assets/images/pages/auth-v1-tree-2.png'
import authV1Tree from '@/assets/images/pages/auth-v1-tree.png'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const form = ref({
  name: '',
  email: '',
  password: '',
})

const rulesUser = ref({
  emailRules: [
    v => !!v || "Пошта обов'язкова",
    v => /.+@.+/.test(v) || 'Некоректний запис пошти',
  ],
})
const vuetifyTheme = useTheme()
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

const hideError = async () => {
  isErrorVisible.value = false
}

const singUp = async () => {
  const password = form.value.password
  const name = form.value.name
  const oneLetterRegex = ".*[a-z].*"
  const oneDigitRegex = ".*\\d+.*"
  errors.length = 0
  if(name.length < 3) {
    isErrorVisible.value = true
    errors.push("Надто коротке ім'я")
  }
  if(name.match(oneDigitRegex)) {
    isErrorVisible.value = true
    errors.push("Ім'я не повинно містити цифр")
  }
  if(password.length < 8) {
    isErrorVisible.value = true
    errors.push("Мінімальна кількість символів паролю - 8")
  }
  if(!password.match(oneLetterRegex)) {
    isErrorVisible.value = true
    errors.push("Пароль повинен містити мінімум одну літеру малого регістру")
  }
  if(!password.match(oneDigitRegex)) {
    isErrorVisible.value = true
    errors.push("Пароль повинен містити мінімум одну цифру")
  } 
  if(!isErrorVisible.value) {
    try {
      isErrorVisible.value = 
      await userStore.signUp(form.value)
    } catch(error) {
      isErrorVisible.value = true
      let errorMessage
      if(error.response.status == 400) {
        errorMessage = "Користувач з такою поштою уже існує"
      } else {
        errorMessage = "Щось пішло не так"
      }
      errors.push(errorMessage)
    }
  }
}

const isPasswordVisible = ref(false)
const isErrorVisible = ref(false)
const errors = []
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
          Реєстрація
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- Username -->
            <VCol cols="12">
              <VTextField
                v-model.trim="form.name"
                @input="isErrorVisible = fasle"
                label="Ім'я"
              />
            </VCol>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model.trim="form.email"
                label="Пошта"
                type="email"
                :rules="rulesUser.emailRules"
                @input="isErrorVisible = fasle"
                required
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model.trim="form.password"
                label="Пароль"
                @input="isErrorVisible = fasle"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <VCol cols="12">
              <VAlert
                type="error"
                :class="isErrorVisible ? 'd-flex' : 'd-none'"
              >
                <ul
                  v-for="error in errors"
                  :key="error"
                >
                  <li>
                    {{ errors.length > 1 ? '•' : ''}} {{error}}
                  </li>
                </ul>
              </VAlert>
            </VCol>

            <VCol cols="12">
              <VBtn
                block
                type="submit"
                @click="singUp"
              >
                Зареєструватись
              </VBtn>
            </VCol>
            <!-- login instead -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Уже є аккаунт?</span>
              <RouterLink
                class="text-primary ms-2"
                to="login"
              >
                Увійдіть
              </RouterLink>
            </VCol>
            <!-- auth providers -->
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
</template>

<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  requiresUnAuth: true
</route>
