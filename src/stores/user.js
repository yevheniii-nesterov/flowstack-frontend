import { defineStore } from 'pinia'
import router from '../router'
import {apiService, postData} from "@/api/http/apiService";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getDatabase} from "firebase/database"
import {sendPasswordResetEmail,getAuth,createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut,updatePassword,updateEmail} from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBK-6H5yNztvGBnn1AT7yh13xxXs16bR-U",
  authDomain: "diplom-5ae23.firebaseapp.com",
  projectId: "diplom-5ae23",
  storageBucket: "diplom-5ae23.appspot.com",
  messagingSenderId: "209774935604",
  appId: "1:209774935604:web:8fba49382a7a8d40499461",
  measurementId: "G-X4BTVV1H8B",
  databaseURL: "https://diplom-5ae23-default-rtdb.europe-west1.firebasedatabase.app",
}

const firebaseApp = initializeApp(firebaseConfig)

export const db = getDatabase(firebaseApp)
export const auth = getAuth(firebaseApp)



export const useUserStore = defineStore({
  id: 'user',

  state: () => ({
    token: localStorage.getItem('token'),
    user: {},
    tokenValid: false,
  }),

  getters: {
    isUserAuth: state => !!state.token,
    getUserData: state => state.user,
    tokenIsValid: state => state.tokenValid,
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    async checkToken(){
      try{
        auth.onIdTokenChanged(user => {
          if (user) {
            this.tokenValid=true
          } else {
            this.tokenValid = false
          }
        })
      }
      catch(err){
        this.tokenValid = false
      }
    },

    async fetchUserData() {
      this.user = auth.currentUser

    },

    async signUp(payload) {
      const response = await postData('auth/register', payload)
      router.replace('/login')

    },
    async login(payload) {
      console.log(payload)
      const response = await postData('auth/login', payload)
      this.setToken(response.token)
      router.replace('/')
    },

    async logout() {
      await signOut(auth)
      this.token = null
      localStorage.clear()
      router.replace('/login')
    },

    async changeUserName(enteredName) {
      console.log(enteredName)
      await updateProfile(auth.currentUser, {
        displayName: enteredName,
      }).then(function() {

      }).catch(function(error) {
        console.log(error)
      })
    },

    async changePassword(newPassword) {
      console.log(newPassword)
      await updatePassword(auth.currentUser, newPassword)
          .then(function() {
            this.setToken(auth.currentUser.accessToken)
          }).catch(function(error) {
            console.log(error)
          })

    },

    async changeEmail(newEmail){
      await updateEmail(auth.currentUser, newEmail)
          .then(function() {
            this.setToken(auth.currentUser.accessToken)
          }).catch(function(error) {
            console.log(error)
          })

    },
    async resetPass(Email){
      console.log(Email)
      await sendPasswordResetEmail(auth, Email)
          .then(() => {
          })
          .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
          })

    },

  },
})


// npm run dev
// firebase init
