<script setup>
import avatar1 from '@/assets/images/avatars/avatar-1.png'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const userData = ref({
  name : userStore.getUserData.displayName,
  email : userStore.getUserData.email,
})

onMounted( async () => {
  await userStore.fetchUserData()
})
const oneDigitRegex = ".*\\d+.*"
const changePassword =( async() => {
  const oneLetterRegex = ".*[a-z].*"
  if(confirmPassword.value != newPassword.value) {
    isPasswordErrorVisible.value = true
    passwordErrorText.value = "Паролі не співпадають"
  } else if(
    newPassword.value.length < 8 ||
    !newPassword.value.match(oneLetterRegex) ||
    !newPassword.value.match(oneDigitRegex)
  ) {
    isPasswordErrorVisible.value = true
    passwordErrorText.value = "Пароль не відповідає вимогам"
  }  else {
    try {
      await userStore.changePassword( newPassword.value)
      await userStore.fetchUserData()
      newPassword.value=''
      confirmPassword.value=''
    } catch(error) {
      isPasswordErrorVisible.value = true
      passwordErrorText.value = "Невірний новий пароль"
    }
  }
})
const newEmail = ref('')
const avatarImg= avatar1
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordRequirements = [
  'Мінімум 8 символів - чим більше, тим краще',
  'Принаймні один малий регістр',
  'Принаймні одне число, символ або пробіл',
]
const isPasswordErrorVisible = ref(false)
const passwordErrorText = ref('')
const isNameErrorVisible = ref(false)
const isEmailErrorVisible = ref(false)
const emailErrorText = ref('')
const nameErrorText = ref('')
const newName = ref('')
const changeName =( async() => {
  if(newName.value.length < 3) {
    isNameErrorVisible.value = true
    nameErrorText.value = "Ім'я занадто коротке"
  } else if(newName.value.match(oneDigitRegex)) {
    isNameErrorVisible.value = true
    nameErrorText.value = "Ім'я не повинно містити цифр"
  } else {
    await userStore.changeUserName(newName.value)
    await userStore.fetchUserData()
    console.log(userStore.getUserData.displayName)
    userData.value.name = userStore.getUserData.displayName
    newName.value=''
  }
})

const rulesUser = ref({
  emailRules: [
    v => !!v || "Пошта обов'язкова",
    v => /.+@.+/.test(v) || 'Некоректний запис пошти',
  ],
})

const changeEmail = (async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log(newEmail.value)
  if (newEmail.value.length === 0) {
    isEmailErrorVisible.value = true
    emailErrorText.value = "Введіть адресу електронної пошти"
  } else if (!emailRegex.test(newEmail.value)){
    isEmailErrorVisible.value = true
    emailErrorText.value = "Невірний запис електронної пошти"
  }else {
    await userStore.changeEmail(newEmail.value)
    await userStore.fetchUserData()
    userData.value.email = userStore.getUserData.email
    newEmail.value=''
  }
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Інформація про акаунт">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="avatarImg"
          />
          
          <VRow>
            <p class="text-body-1 mb-0">
              Iм'я: {{ userData.name }}
              <br>
              Пошта: {{ userData.email }}
            </p>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title="Змінити ім'я">
        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="newName"
                  label="Введіть сюди нове ім'я"
                  @input="isNameErrorVisible = false"
                />
              
                <div class="mt-4">
                  <VAlert 
                    type="error" 
                    :class="isNameErrorVisible ? 'd-flex' : 'd-none'"
                  >
                    {{ unref(nameErrorText) }}
                  </VAlert>
                </div>
              </VCol>


              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn @click="changeName">
                  Зберегти зміни
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Змінити пошту">
        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="newEmail"
                  label="Введіть сюди нову пошту"
                  type="email"
                  @input="isEmailErrorVisible = false"
                />

                <div class="mt-4">
                  <VAlert
                    type="error"
                    :class="isEmailErrorVisible ? 'd-flex' : 'd-none'"
                  >
                    {{ unref(emailErrorText) }}
                  </VAlert>
                </div>
              </VCol>


              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn @click="changeEmail">
                  Зберегти зміни
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>


    <VCol cols="12">
      <VCard title="Змінити пароль">
        <VForm>
          <VCardText>
            <!-- 👉 New Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <VTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  label="Новий пароль"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                  @input="isPasswordErrorVisible = false"
                />
              </VCol>
                
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <VTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  label="Повторіть пароль"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  @input="isPasswordErrorVisible = false"
                />
              </VCol>
            </VRow>

            <div class="mt-4">
              <VAlert 
                type="error" 
                :class="isPasswordErrorVisible ? 'd-flex' : 'd-none'"
              >
                {{ unref(passwordErrorText) }}
              </VAlert>
            </div>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <p class="text-base font-weight-medium mt-2">
              Вимоги до паролю:
            </p>

            <ul class="d-flex flex-column gap-y-3">
              <li
                v-for="item in passwordRequirements"
                :key="item"
                class="d-flex"
              >
                <div>
                  <VIcon
                    size="7"
                    icon="mdi-circle"
                    class="me-3"
                  />
                </div>
                <span class="font-weight-medium">{{ item }}</span>
              </li>
            </ul>
          </VCardText>

          <!-- 👉 Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn @click="changePassword">
              Зберегти зміни
            </VBtn>

            <VBtn
              type="reset"
              color="secondary"
              variant="tonal"
            >
              Повернути назад
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
  </VRow>
</template>
