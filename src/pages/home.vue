<script setup>
import { auth, db, useUserStore } from '@/stores/user'
import {DataDB} from '@/stores/dataDB'
import {v4 as uuidv4} from 'uuid'
import { Icon } from '@iconify/vue'
const dataBase = DataDB()
const tasks = ref([])
const customers = ref([])
const categories = ref([])
const show = ref(false)
const upCategory = ref(false)
const newCategory = ref({
  categoryId: '',
  name: '',
})


const rulesUser = ref({
  emailRules: [
    v => !!v || "Пошта обов'язкова",
    v => /.+@.+/.test(v) || 'Некоректний запис пошти',
  ],
})

const searchTerm = ref('')

onMounted( async () => {
  await allTask()
})

const sortByColumn = ref('')
const sortDirection = ref('asc')
const category = ref(false)
const info = ref(false)
const selectedItem = ref()
const admit = ref(false)
const addDiolog = ref(false)
const updateDiolog = ref(false)
const showCustomerFields = ref(false)
const task = ref({
  uuid : '',
  name:'',
  description:'',
  date:'',
  Ldate:'',
  clietn_id:'',
  client_name:'',
  maket_link:'',
  category_id:'',
  category_name:'',
  status: false,
})

const customer = ref({
  name:'',
  email:'',
  phone:'',
  description:'',
  customerID:'',
})


function getCurrentDateTime() {
  const currentDate = new Date()

  const day = String(currentDate.getDate()).padStart(2, '0')
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const year = currentDate.getFullYear()

  return `${day}.${month}.${year}`
}

function addTask(){
  addDiolog.value = true
}

async function createTask() {
  customer.value.customerID = uuidv4()
  task.value.date = getCurrentDateTime()
  task.value.uuid = uuidv4()
  task.value.category_name = newCategory.value.name
  task.value.category_id = newCategory.value.categoryId
  console.log(task.value)

  console.log(customer.value)

  if (Object.values(customer.value).some(value => value === '')) {
    console.log('lox')
    console.log(customer.value)

    task.value.client_name = customer.value.name
    await dataBase.addTask(task.value)
    cancelAddTask()
  } else {
    console.log('ne lox')
    task.value.clietn_id = customer.value.customerID
    task.value.client_name = customer.value.name

    await dataBase.addTask(task.value)
    await dataBase.addСustomer(customer.value)
    cancelAddTask()

  }
  showCustomerFields.value = false
  await allTask()
}

function cancelAddTask(){
  showCustomerFields.value = false
  addDiolog.value = false
  task.value.name = ''
  task.value.description= ''
  task.value.clietn_id= ''
  task.value.maket_link = ''
  task.value.Ldate = ''
  task.value.client_name = ''
  task.value.category_name = ''
  task.value.category_id = ''

  customer.value.name = ''
  customer.value.phone = ''
  customer.value.email = ''
  customer.value.description = ''
}

async function allTask() {
  try {
    customers.value = Object.values(await dataBase.fetchCustomers())

    categories.value = Object.values (await dataBase.fetchCategory())

    tasks.value = getObjectsByCategoryId(newCategory.value.categoryId)

  } catch (error) {
    console.error(error)
  }
}

function udateTask(item){
  console.log(item)
  updateDiolog.value = true
  task.value.name = item.name
  task.value.description= item.description
  task.value.clietn_id= item.clietn_id
  customer.value.name = getCustomerName(item.clietn_id)
  task.value.maket_link = item.maket_link
  task.value.Ldate = item.date_do
  task.value. uuid = item.taskId
  task.value.client_name = customer.value.name
  task.value.category_name = newCategory.value.name
  task.value.category_id = newCategory.value.categoryId
}

async function edit(){
  customer.value.customerID = uuidv4()
  if (Object.values(customer.value).some(value => value === '')) {
    console.log('lox')
    console.log(customer.value)
    await dataBase.updateTask(task.value)
    cancelAddTask()
  } else {
    console.log('ne lox')
    task.value.clietn_id = customer.value.customerID

    await dataBase.updateTask(task.value)
    await dataBase.addСustomer(customer.value)
    cancelAddTask()
  }


  await allTask()
  updateDiolog.value = false
  cancelAddTask()
}

function clancel(){
  updateDiolog.value = false
  cancelAddTask()
}



async function deleteTask(){
  console.log(selectedItem.value)
  await dataBase.removeTask(selectedItem.value)
  await allTask()
}

async function updateCategory(){
  
  await dataBase.updateCategory(newCategory.value)
  newCategory.value.categoryId = ''
  newCategory.value.name = ''
  await allTask()
}

async function deleteCategory(item){

  await dataBase.removeCategory(item)
  await allTask()
}

function  handleCustomerSelection(name) {
  console.log(customers.value)
  console.log(name)
  if(customers.value === null ){
    showCustomerFields.value = true
  } else {
    const foundCustomer = customers.value.find(customer => customer.name === name)
    console.log(foundCustomer)
    if (foundCustomer) {
      console.log(foundCustomer.customerId)
      task.value.clietn_id = foundCustomer.customerId
      showCustomerFields.value = false
    } else {
      showCustomerFields.value = true
    }
  }
}

function getCustomerName(customerId) {
  const id = customers.value.find(customer => customer.customerId === customerId)

  return id ? id.name : ''
}

function getName(customerId){

  if (customers.value.find(customer => customer.customerId === customerId)){
    const id = customers.value.find(customer => customer.customerId === customerId)
    customer.value.name = id.name
  } else {
    customer.value.name = ''
  }
  console.log(selectedItem.value)
}

async function updateStatus(item){
  await dataBase.updateStatus(item)
}

async function createCategory(){
  newCategory.value.categoryId = uuidv4()

  await dataBase.addCategory(newCategory.value)

  newCategory.value.name = '',
  newCategory.value.categoryId = ''

  await allTask()
}

const filteredData = computed(() => {
  const found = tasks.value

  if (!searchTerm.value) {
    return found
  }

  return found.filter(item => {
    // Применение фильтрации на основе поискового запроса
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  })
})


function sortedData(){
  if (sortByColumn.value) {
    tasks.value.sort((a, b) => {
      const modifier =  sortDirection.value === 'asc' ? 1 : -1
      if (a[sortByColumn.value] < b[sortByColumn.value]) return -1 * modifier
      if (a[sortByColumn.value] > b[sortByColumn.value]) return 1 * modifier
      
      return 0
    })
  }

  return  tasks.value
}

function sortBy(column) {
  console.log(column)
  if (column === sortByColumn.value) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortByColumn.value = column
    sortDirection.value = 'asc'
  }
  sortedData()
}

function getObjectsByCategoryId(categoryId) {
  const objects = []

  // Перебираем все свойства в data
  for (const key in categories.value) {
    if (categories.value.hasOwnProperty(key)) {
      const obj = categories.value[key]

      // Проверяем, содержит ли User_Task нужный category_id
      if (obj.User_Task) {
        const userTasks = obj.User_Task
        for (const taskId in userTasks) {
          if (userTasks.hasOwnProperty(taskId)) {
            const task = userTasks[taskId]
            if (task.category_id === categoryId) {
              objects.push(task)
            }
          }
        }
      }
    }
  }

  return objects
}
</script>

<template>
<!--  <VDialog-->
<!--    v-model="admit"-->
<!--    max-width="290"-->
<!--  >-->
<!--    <VCard>-->
<!--      <VCardTitle>-->
<!--        Підтвердіть видалення-->
<!--      </VCardTitle>-->
<!--      <VCardText>-->
<!--        Ви впевнені  що хочете видалити завдання?-->
<!--      </VCardText>-->

<!--      <VCardActions>-->
<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="admit = false"-->
<!--        >-->
<!--          Ні-->
<!--        </VBtn>-->

<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="deleteTask(); admit = false"-->
<!--        >-->
<!--          Так-->
<!--        </VBtn>-->
<!--      </VCardActions>-->
<!--    </VCard>-->
<!--  </VDialog>-->


<!--  <VRow justify="center">-->
<!--    <VDialog-->
<!--      v-model="addDiolog"-->
<!--      persistent-->
<!--      width="1024"-->
<!--    >-->
<!--      <VCard>-->
<!--        <VCardTitle style="margin-left: 1%; margin-top: 2%">-->
<!--          <VTextField-->
<!--            v-model="task.name"-->
<!--            class="custom-text-field"-->
<!--            label="Назва замовлення"-->
<!--            required-->
<!--            variant="underlined"-->
<!--          />-->
<!--        </VCardTitle>-->
<!--        <VCardText>-->
<!--          <VContainer>-->
<!--            <VRow>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="task.Ldate"-->
<!--                  label="Дата завершення"-->
<!--                  required-->
<!--                  type="date"-->
<!--                  variant="underlined"-->
<!--                />-->
<!--              </VCol>-->

<!--              <VCol cols="12">-->
<!--                <VTextarea-->
<!--                  v-model="task.description"-->
<!--                  label="Опис замовлення"-->
<!--                  maxlength="1000"-->
<!--                  variant="underlined"-->
<!--                  clearable-->
<!--                  auto-grow-->
<!--                  rows="1"-->
<!--                  row-height="15"-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="task.maket_link"-->
<!--                  label="Посилання на макет проекту"-->
<!--                  required-->
<!--                  type="url"-->
<!--                  variant="underlined"-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VCombobox-->
<!--                  v-model="customer.name"-->
<!--                  :items="customers"-->
<!--                  item-value="customerId"-->
<!--                  item-title="name"-->
<!--                  label="Ім'я замовника"-->
<!--                  variant="underlined"-->
<!--                  @blur="handleCustomerSelection(customer.name)"-->
<!--                />-->
<!--              </VCol>-->

<!--              <VCol-->
<!--                v-if="showCustomerFields"-->
<!--                cols="12"-->
<!--              >-->
<!--                &lt;!&ndash; Дополнительные поля для ввода данных заказчика &ndash;&gt;-->
<!--                &lt;!&ndash; Например: &ndash;&gt;-->

<!--                <VCol cols="12">-->
<!--                  <VTextField-->
<!--                    v-model="customer.phone"-->
<!--                    label="Телефон замовника"-->
<!--                    required-->
<!--                    variant="underlined"-->
<!--                  />-->
<!--                </VCol>-->

<!--                <VCol cols="12">-->
<!--                  <VTextarea-->
<!--                    v-model="customer.description"-->
<!--                    label="Про замовника"-->
<!--                    maxlength="1000"-->
<!--                    variant="underlined"-->
<!--                    clearable-->
<!--                    auto-grow-->
<!--                    rows="1"-->
<!--                    row-height="15"-->
<!--                  />-->
<!--                </VCol>-->

<!--                <VCol cols="12">-->
<!--                  <VTextField-->
<!--                    v-model="customer.email"-->
<!--                    label="Email замовника"-->
<!--                    required-->
<!--                    variant="underlined"-->
<!--                    :rules="rulesUser.emailRules"-->
<!--                  />-->
<!--                </VCol>-->
<!--              </VCol>-->
<!--            </VRow>-->
<!--          </VContainer>-->
<!--        </VCardText>-->
<!--        <VCardActions>-->
<!--          <VSpacer />-->
<!--          <VBtn-->
<!--            color="blue-darken-1"-->
<!--            variant="text"-->
<!--            @click="cancelAddTask"-->
<!--          >-->
<!--            Закрити-->
<!--          </VBtn>-->
<!--          <VBtn-->
<!--            color="blue-darken-1"-->
<!--            variant="text"-->
<!--            @click="createTask"-->
<!--          >-->
<!--            Створити-->
<!--          </VBtn>-->
<!--        </VCardActions>-->
<!--      </VCard>-->
<!--    </VDialog>-->
<!--  </VRow>-->


<!--  <VRow justify="center">-->
<!--    <VDialog-->
<!--      v-model="updateDiolog"-->
<!--      persistent-->
<!--      width="1024"-->
<!--    >-->
<!--      <VCard>-->
<!--        <VCardTitle style="margin-left: 1%; margin-top: 2%">-->
<!--          <VTextField-->
<!--            v-model="task.name"-->
<!--            class="custom-text-field"-->
<!--            label="Назва замовлення"-->
<!--            required-->
<!--            variant="underlined"-->
<!--          />-->
<!--        </VCardTitle>-->
<!--        <VCardText>-->
<!--          <VContainer>-->
<!--            <VRow>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="task.Ldate"-->
<!--                  label="Дата завершення"-->
<!--                  required-->
<!--                  type="date"-->
<!--                  variant="underlined"-->
<!--                />-->
<!--              </VCol>-->

<!--              <VCol cols="12">-->
<!--                <VTextarea-->
<!--                  v-model="task.description"-->
<!--                  label="Опис замовлення"-->
<!--                  maxlength="1000"-->
<!--                  variant="underlined"-->
<!--                  clearable-->
<!--                  auto-grow-->
<!--                  rows="1"-->
<!--                  row-height="15"-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="task.maket_link"-->
<!--                  label="Посилання на макет проекту"-->
<!--                  required-->
<!--                  type="url"-->
<!--                  variant="underlined"-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VCombobox-->
<!--                  v-model="customer.name"-->
<!--                  :items="customers"-->
<!--                  item-value="customerId"-->
<!--                  item-title="name"-->
<!--                  label="Ім'я замовника"-->
<!--                  variant="underlined"-->
<!--                  @blur="handleCustomerSelection(customer.name)"-->
<!--                />-->
<!--              </VCol>-->

<!--              <VCol-->
<!--                v-if="showCustomerFields"-->
<!--                cols="12"-->
<!--              >-->
<!--                &lt;!&ndash; Дополнительные поля для ввода данных заказчика &ndash;&gt;-->
<!--                &lt;!&ndash; Например: &ndash;&gt;-->

<!--                <VCol cols="12">-->
<!--                  <VTextField-->
<!--                    v-model="customer.phone"-->
<!--                    label="Телефон замовника"-->
<!--                    required-->
<!--                    variant="underlined"-->
<!--                  />-->
<!--                </VCol>-->

<!--                <VCol cols="12">-->
<!--                  <VTextarea-->
<!--                    v-model="customer.description"-->
<!--                    label="Про замовника"-->
<!--                    maxlength="1000"-->
<!--                    variant="underlined"-->
<!--                    clearable-->
<!--                    auto-grow-->
<!--                    rows="1"-->
<!--                    row-height="15"-->
<!--                  />-->
<!--                </VCol>-->

<!--                <VCol cols="12">-->
<!--                  <VTextField-->
<!--                    v-model="customer.email"-->
<!--                    label="Email замовника"-->
<!--                    required-->
<!--                    variant="underlined"-->
<!--                    :rules="rulesUser.emailRules"-->
<!--                  />-->
<!--                </VCol>-->
<!--              </VCol>-->
<!--            </VRow>-->
<!--          </VContainer>-->
<!--        </VCardText>-->
<!--        <VCardActions>-->
<!--          <VSpacer />-->
<!--          <VBtn-->
<!--            color="blue-darken-1"-->
<!--            variant="text"-->
<!--            @click="clancel"-->
<!--          >-->
<!--            Закрити-->
<!--          </VBtn>-->
<!--          <VBtn-->
<!--            color="blue-darken-1"-->
<!--            variant="text"-->
<!--            @click="edit"-->
<!--          >-->
<!--            Змінити-->
<!--          </VBtn>-->
<!--        </VCardActions>-->
<!--      </VCard>-->
<!--    </VDialog>-->
<!--  </VRow>-->

<!--  <VRow justify="center">-->
<!--    <VDialog-->
<!--      v-model="info"-->
<!--      persistent-->
<!--      width="1024"-->
<!--    >-->
<!--      <VCard>-->
<!--        <VCardTitle style="margin-left: 1%; margin-top: 2%">-->
<!--          <VTextField-->
<!--            v-model="selectedItem.name"-->
<!--            class="custom-text-field"-->
<!--            label="Назва замовлення"-->
<!--            required-->
<!--            variant="underlined"-->
<!--            readonly-->
<!--          />-->
<!--        </VCardTitle>-->
<!--        <VCardText>-->
<!--          <VContainer>-->
<!--            <VRow>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="selectedItem.date_do"-->
<!--                  label="Дата завершення"-->
<!--                  required-->
<!--                  type="date"-->
<!--                  variant="underlined"-->
<!--                  readonly-->
<!--                />-->
<!--              </VCol>-->

<!--              <VCol cols="12">-->
<!--                <VTextarea-->
<!--                  v-model="selectedItem.description"-->
<!--                  label="Опис замовлення"-->
<!--                  maxlength="1000"-->
<!--                  variant="underlined"-->
<!--                  auto-grow-->
<!--                  rows="1"-->
<!--                  row-height="15"-->
<!--                  readonly-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VTextField-->
<!--                  v-model="selectedItem.maket_link"-->
<!--                  label="Посилання на макет проекту"-->
<!--                  required-->
<!--                  type="url"-->
<!--                  variant="underlined"-->
<!--                  readonly-->
<!--                />-->
<!--              </VCol>-->
<!--              <VCol cols="12">-->
<!--                <VCombobox-->
<!--                  v-model="customer.name"-->
<!--                  :items="customers"-->
<!--                  item-value="customerId"-->
<!--                  item-title="name"-->
<!--                  label="Ім'я замовника"-->
<!--                  variant="underlined"-->
<!--                  readonly-->
<!--                />-->
<!--              </VCol>-->
<!--            </VRow>-->
<!--          </VContainer>-->
<!--        </VCardText>-->
<!--        <VCardActions>-->
<!--          <VSpacer />-->
<!--          <VBtn-->
<!--            color="blue-darken-1"-->
<!--            variant="text"-->
<!--            @click="info = false; customer.name = ''"-->
<!--          >-->
<!--            Закрити-->
<!--          </VBtn>-->
<!--        </VCardActions>-->
<!--      </VCard>-->
<!--    </VDialog>-->
<!--  </VRow>-->

<!--  <VContainer class="pa-4">-->
<!--    <VRow-->
<!--      class="fill-height"-->
<!--      align="center"-->
<!--      justify="center"-->
<!--    >-->
<!--      <template-->
<!--        v-for="(item, index) in categories"-->
<!--        :key="index"-->
<!--      >-->
<!--        <VCol-->
<!--          cols="12"-->
<!--          xl="2"-->
<!--          lg="4"-->
<!--          sm="6"-->
<!--          xs="12"-->
<!--          @click="show = true;-->
<!--                  newCategory.name = item.name;-->
<!--                  newCategory.categoryId = item.categoryId;-->
<!--                  tasks = getObjectsByCategoryId(newCategory.categoryId)"-->
<!--        >-->
<!--          <VHover v-slot="{ isHovering, props }">-->
<!--            <VCard-->
<!--              :elevation="isHovering ? 12 : 2"-->
<!--              :class="{ 'on-hover': isHovering }"-->
<!--              v-bind="props"-->
<!--            >-->
<!--              <VCardTitle class="text-h6 d-flex flex-column">-->
<!--                <div class="d-flex justify-space-between">-->
<!--                  <div class="text-center flex-grow-1">-->
<!--                    <h1 class="mt-4">-->
<!--                      {{ item.name }}-->
<!--                    </h1>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </VCardTitle>-->
<!--              <VCardActions class="justify-center flex-column">-->
<!--                <VBtn-->
<!--                  @click.stop="-->
<!--                    upCategory = true;-->
<!--                    newCategory.categoryId = item.categoryId"-->
<!--                >-->
<!--                  Перейменувати-->
<!--                </VBtn>-->
<!--                <VBtn-->
<!--                  class="mr-2"-->
<!--                  @click.stop=" deleteCategory(item.categoryId) "-->
<!--                >-->
<!--                  Видалити-->
<!--                </VBtn>-->
<!--              </VCardActions>-->
<!--            </VCard>-->
<!--          </VHover>-->
<!--        </VCol>-->
<!--      </template>-->
<!--      <VCol-->
<!--        cols="12"-->
<!--        md="2"-->
<!--        sm="6"-->
<!--        xs="12"-->
<!--        @click="category = true"-->
<!--      >-->
<!--        <VHover v-slot="{ isHovering, props }">-->
<!--          <VCard-->
<!--            :elevation="isHovering ? 12 : 2"-->
<!--            :class="{ 'on-hover': isHovering }"-->
<!--            v-bind="props"-->
<!--          >-->
<!--            <div>-->
<!--              <VIcon-->
<!--                icon="mdi-plus"-->
<!--                size="30%"-->
<!--                style="margin-left: 35%"-->
<!--              />-->
<!--            </div>-->
<!--            <div class="text-center flex-grow-1 text-h6 d-flex flex-column">-->
<!--              <p> Створити <br> категорію</p>-->
<!--            </div>-->
<!--          </VCard>-->
<!--        </VHover>-->
<!--      </VCol>-->
<!--    </VRow>-->
<!--  </VContainer>-->


<!--  <VDialog-->
<!--    v-model="show"-->
<!--    persistent-->
<!--    max-width="1000"-->
<!--  >-->
<!--    <VCard>-->
<!--      <VCardTitle>-->
<!--        <h1 style="text-align: center">-->
<!--          {{ newCategory.name }}-->
<!--        </h1>-->
<!--      </VCardTitle>-->
<!--      <VCardText>-->
<!--        <VRow>-->
<!--          <VCol>-->
<!--            <VTextField-->
<!--              v-model="searchTerm"-->
<!--              append-icon="mdi-magnify"-->
<!--              label="Пошук по замовленням"-->
<!--              single-line-->
<!--              hide-details-->
<!--              variant="underlined"-->
<!--            />-->
<!--            <VTable>-->
<!--              <thead>-->
<!--                <tr>-->
<!--                  <th-->
<!--                    style="text-align: center"-->
<!--                    @click="sortBy('name')"-->
<!--                  >-->
<!--                    Назва замовлення-->
<!--                  </th>-->
<!--                  <th-->
<!--                    style="text-align: center"-->
<!--                    @click="sortBy('date_do')"-->
<!--                  >-->
<!--                    Дата виконання замовлення-->
<!--                  </th>-->
<!--                  <th-->
<!--                    style="text-align: center"-->
<!--                    @click="sortBy('client_name')"-->
<!--                  >-->
<!--                    Замовник-->
<!--                  </th>-->
<!--                  <th-->
<!--                    style="text-align: center"-->
<!--                    @click="sortBy('status')"-->
<!--                  >-->
<!--                    Cтан замовлення-->
<!--                  </th>-->
<!--                  <th>-->
<!--                    <VBtn-->
<!--                      icon="mdi-plus"-->
<!--                      size="x-small"-->
<!--                      @click="addTask"-->
<!--                    />-->
<!--                  </th>-->
<!--                </tr>-->
<!--              </thead>-->
<!--              <tbody>-->
<!--                <tr-->
<!--                  v-for="(item, index) in filteredData"-->
<!--                  :key="index"-->
<!--                  @click="info = true; selectedItem = item; getName(item.clietn_id)"-->
<!--                >-->
<!--                  <td style="text-align: center">-->
<!--                    <span> {{ item.name }}</span>-->
<!--                  </td>-->
<!--                  <td style="text-align: center">-->
<!--                    <span>{{ item.date_do }}</span>-->
<!--                  </td>-->
<!--                  <td style="text-align: center">-->
<!--                    <span> {{ getCustomerName(item.clietn_id) }}</span>-->
<!--                  </td>-->
<!--                  <td style="text-align: center">-->
<!--                    <template v-if="item.status">-->
<!--                      <VCheckbox-->
<!--                        v-model="item.status"-->
<!--                        color="success"-->
<!--                        hide-details-->
<!--                        @change="updateStatus(item)"-->
<!--                        @click.stop-->
<!--                      >-->
<!--                        Виконано-->
<!--                      </VCheckbox>-->
<!--                    </template>-->
<!--                    <template v-else>-->
<!--                      <VCheckbox-->
<!--                        v-model="item.status"-->
<!--                        style="color: red"-->
<!--                        color="error"-->
<!--                        hide-details-->
<!--                        @change="updateStatus(item)"-->
<!--                        @click.stop-->
<!--                      >-->
<!--                        Не виконано-->
<!--                      </VCheckbox>-->
<!--                    </template>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <VBtn-->
<!--                      icon="mdi-pencil"-->
<!--                      size="x-small"-->
<!--                      style="margin-right: 2%"-->
<!--                      @click.stop="udateTask(item)"-->
<!--                    />-->
<!--                    <VBtn-->
<!--                      style="margin-right: 2%"-->
<!--                      icon="mdi-trash-can"-->
<!--                      size="x-small"-->
<!--                      @click.stop="admit = true; selectedItem = item"-->
<!--                    />-->
<!--                  </td>-->
<!--                </tr>-->
<!--              </tbody>-->
<!--            </VTable>-->
<!--          </VCol>-->
<!--        </VRow>-->
<!--      </VCardText>-->
<!--      <VCardActions>-->
<!--        <VSpacer />-->
<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="show = false; newCategory.name = ''"-->
<!--        >-->
<!--          Закрити-->
<!--        </VBtn>-->
<!--      </VCardActions>-->
<!--    </VCard>-->
<!--  </VDialog>-->





<!--  <VDialog-->
<!--    v-model="category"-->
<!--    persistent-->
<!--    max-width="400"-->
<!--  >-->
<!--    <VCard>-->
<!--      <VCardTitle>-->
<!--        Нова категорія-->
<!--      </VCardTitle>-->
<!--      <VCardText>-->
<!--        <VCol cols="12">-->
<!--          <VTextField-->
<!--            v-model="newCategory.name"-->
<!--            label="Назва категорії"-->
<!--            required-->
<!--            variant="underlined"-->
<!--          />-->
<!--        </VCol>-->
<!--      </VCardText>-->

<!--      <VCardActions>-->
<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="category = false"-->
<!--        >-->
<!--          Відмінити-->
<!--        </VBtn>-->

<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="createCategory(); category = false"-->
<!--        >-->
<!--          Створити-->
<!--        </VBtn>-->
<!--      </VCardActions>-->
<!--    </VCard>-->
<!--  </VDialog>-->



<!--  <VDialog-->
<!--    v-model="upCategory"-->
<!--    persistent-->
<!--    max-width="400"-->
<!--  >-->
<!--    <VCard>-->
<!--      <VCardTitle>-->
<!--        Введіть нову назву-->
<!--      </VCardTitle>-->
<!--      <VCardText>-->
<!--        <VCol cols="12">-->
<!--          <VTextField-->
<!--            v-model="newCategory.name"-->
<!--            label="Назва категорії"-->
<!--            required-->
<!--            variant="underlined"-->
<!--          />-->
<!--        </VCol>-->
<!--      </VCardText>-->

<!--      <VCardActions>-->
<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="upCategory = false"-->
<!--        >-->
<!--          Відмінити-->
<!--        </VBtn>-->

<!--        <VBtn-->
<!--          color="green darken-1"-->
<!--          text-->
<!--          @click="updateCategory(); upCategory = false"-->
<!--        >-->
<!--          Змінити-->
<!--        </VBtn>-->
<!--      </VCardActions>-->
<!--    </VCard>-->
<!--  </VDialog>-->
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
