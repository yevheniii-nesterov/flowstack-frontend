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



<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  requiresUnAuth: true
</route>
