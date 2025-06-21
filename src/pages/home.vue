<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Icon } from '@iconify/vue'
import {useUserStore} from "@/stores/user";
const userStore = useUserStore()
const tasks = ref([])
const addDialog = ref(false)
const updateDialog = ref(false)
const deleteDialog = ref(false)
const selectedTask = ref(null)
const searchTerm = ref('')
const sortByColumn = ref('')
const sortDirection = ref('asc')

const task = ref({
  id: '',
  task: '',
  description: '',
  status: false
})

onMounted(async () => {
  await fetchTasks()
})

async function fetchTasks() {
  try {
    tasks.value = userStore.fetchTasksData();
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

function addTask() {
  task.value = { id: '', task: '', description: '', status: false }
  addDialog.value = true
}

async function createTask() {
  try {
    const newTask = {
      task: task.value.task,
      description: task.value.description,
      status: task.value.status ? 'true' : 'false'
    }
    await userStore.postTaskData(newTask)
    await fetchTasks()
    addDialog.value = false
    resetTask()
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

function editTask(item) {
  task.value = { ...item }
  updateDialog.value = true
}

async function updateTask() {
  try {
    const updatedTask = {
      task: task.value.task,
      description: task.value.description,
      status: task.value.status ? 'true' : 'false'
    }
    await userStore.updateTaskData({ ...updatedTask, id: task.value.id })
    await fetchTasks()
    updateDialog.value = false
    resetTask()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

function confirmDeleteTask(item) {
  selectedTask.value = item
  deleteDialog.value = true
}

async function deleteTask() {
  try {
    await userStore.deleteTaskData(selectedTask.value.id)
    await fetchTasks()
    deleteDialog.value = false
    selectedTask.value = null
  } catch (error) {
    console.error('Error deleting task:', error)
  }
}

function resetTask() {
  task.value = { id: '', task: '', description: '', status: false }
}

function cancelDialog() {
  addDialog.value = false
  updateDialog.value = false
  resetTask()
}

const filteredData = computed(() => {
  if (!searchTerm.value) return tasks.value
  return tasks.value.filter(item =>
    item.task.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

function sortBy(column) {
  if (column === sortByColumn.value) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortByColumn.value = column
    sortDirection.value = 'asc'
  }
  tasks.value.sort((a, b) => {
    const modifier = sortDirection.value === 'asc' ? 1 : -1
    if (a[column] < b[column]) return -1 * modifier
    if (a[column] > b[column]) return 1 * modifier
    return 0
  })
}
</script>

<template>
  <VContainer class="pa-4">
    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="deleteDialog" max-width="290">
      <VCard>
        <VCardTitle>Підтвердіть видалення</VCardTitle>
        <VCardText>Ви впевнені, що хочете видалити завдання?</VCardText>
        <VCardActions>
          <VBtn color="green darken-1" text @click="deleteDialog = false">Ні</VBtn>
          <VBtn color="green darken-1" text @click="deleteTask">Так</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add Task Dialog -->
    <VDialog v-model="addDialog" persistent width="600">
      <VCard>
        <VCardTitle>Додати завдання</VCardTitle>
        <VCardText>
          <VContainer>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="task.task"
                  label="Назва завдання"
                  required
                  variant="underlined"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="task.description"
                  label="Опис завдання"
                  maxlength="1000"
                  variant="underlined"
                  clearable
                  auto-grow
                  rows="1"
                />
              </VCol>
              <VCol cols="12">
                <VCheckbox
                  v-model="task.status"
                  label="Виконано"
                  color="success"
                />
              </VCol>
            </VRow>
          </VContainer>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="blue-darken-1" variant="text" @click="cancelDialog">Закрити</VBtn>
          <VBtn color="blue-darken-1" variant="text" @click="createTask">Створити</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Update Task Dialog -->
    <VDialog v-model="updateDialog" persistent width="600">
      <VCard>
        <VCardTitle>Редагувати завдання</VCardTitle>
        <VCardText>
          <VContainer>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="task.task"
                  label="Назва завдання"
                  required
                  variant="underlined"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="task.description"
                  label="Опис завдання"
                  maxlength="1000"
                  variant="underlined"
                  clearable
                  auto-grow
                  rows="1"
                />
              </VCol>
              <VCol cols="12">
                <VCheckbox
                  v-model="task.status"
                  label="Виконано"
                  color="success"
                />
              </VCol>
            </VRow>
          </VContainer>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="blue-darken-1" variant="text" @click="cancelDialog">Закрити</VBtn>
          <VBtn color="blue-darken-1" variant="text" @click="updateTask">Змінити</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Tasks Table -->
    <VRow>
      <VCol>
        <VTextField
          v-model="searchTerm"
          label="Пошук по завданнях"
          single-line
          hide-details
          variant="underlined"
        />
        <VTable>
          <thead>
          <tr>
            <th style="text-align: center" @click="sortBy('task')">Назва завдання</th>
            <th style="text-align: center" @click="sortBy('description')">Опис</th>
            <th style="text-align: center" @click="sortBy('status')">Статус</th>
            <th style="text-align: center">Дії</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in filteredData" :key="index">
            <td style="text-align: center">{{ item.task }}</td>
            <td style="text-align: center">{{ item.description }}</td>
            <td style="text-align: center">
              <VCheckbox
                v-model="item.status"
                :color="item.status ? 'success' : 'error'"
                readonly
              />
            </td>
            <td style="text-align: center">
              <VBtn
                icon="mdi-pencil"
                size="x-small"
                style="margin-right: 2%"
                @click="editTask(item)"
              />
              <VBtn
                icon="mdi-trash-can"
                size="x-small"
                @click="confirmDeleteTask(item)"
              />
            </td>
          </tr>
          </tbody>
        </VTable>
        <VBtn style="margin-top: 20px" icon="mdi-plus" @click="addTask"></VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>

<style>
.custom-text-field input {
  font-size: 20px!important;
}
.custom-text-field label {
  font-size: 18px!important;
}
.v-input__control {
  display: block;
  grid-area: control;
}

.v-input--density-comfortable {
  --v-input-control-height: 38px;
  --v-input-padding-top: 9px;
}
</style>

https://github.com/KAZAHv2/Diplom-vue3
https://diplom-5ae23.web.app/
