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



<style lang='scss'>
@use "@core/scss/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  requiresUnAuth: true
</route>
