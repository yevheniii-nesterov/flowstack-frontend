<template>
  <div class="w-100 h-100 d-flex align-center justify-space-between">
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="mdi-heart-outline"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
    </span>
  </div>
</template>
