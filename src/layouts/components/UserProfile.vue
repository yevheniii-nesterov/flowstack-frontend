<script setup>
import avatar1 from '@/assets/images/avatars/avatar-1.png'
import { useUserStore, auth } from '@/stores/user'
const userStore = useUserStore()
onMounted( async () => {
  await userStore.fetchUserData()

})
const userData = computed(() => userStore.getUserData)
const avatarBadgeProps = {
  dot: true,
  location: 'bottom right',
  offsetX: 3,
  offsetY: 3,
  color: 'success',
  bordered: true,
}

const logout = () => {
  userStore.logout()
}
</script>

<template>
  <VBadge v-bind="avatarBadgeProps">
    <VAvatar
      style="cursor: pointer;"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge v-bind="avatarBadgeProps">
                  <VAvatar
                    color="primary"
                    size="40"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userData.displayName }}
            </VListItemTitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem to="/account-settings">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-account-outline"
                size="22"
              />
            </template>

            <VListItemTitle>Профіль</VListItemTitle>
          </VListItem>

          <VDivider class="my-2" />

           <VListItem
             to="/login"
             @click="logout"
           >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-logout-variant"
                size="22"
              />
            </template>

            <VListItemTitle>Вийти</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
