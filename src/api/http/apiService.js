import axios from 'axios'

const apiService = axios.create({
    baseURL: 'https://localhost:3000/',
  },
)

apiService.interceptors.request.use((config) => {
  if (localStorage.getItem('token')) {
    config.headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }
  }
  return config
})


const getData = async (url) => {
  try {
    const response = await apiService.get(url)
    return response.data
  } catch (e) {
    return Promise.reject(e)
  }
}
const getFile = async (url) => {
  try {
    const response = await apiService.get(url, {
      responseType: 'blob'
    })
    return response
  } catch (e) {
    return Promise.reject(e)
  }
}
const postData = async (url, payload) => {
  try {
    const response = await apiService.post(url, { ...payload })
    return response.data
  } catch (e) {
    return Promise.reject(e)
  }
}
const patchData = async (url, payload) => {
    try {
        const response = await apiService.patch(url, { ...payload })
        return response.data
    } catch (e) {
        return Promise.reject(e)
    }
}
const deleteData = async (url) => {
  try {
    const response = await apiService.delete(url)
    return response.data
  } catch (e) {
    return Promise.reject(e)
  }
}
const editData = async (url, payload) => {
  try {
    const response = await apiService.put(url, { ...payload })
    return response.data
  } catch (e) {
    return Promise.reject(e)
  }
}

export { getData, postData, deleteData, editData, getFile, apiService }

