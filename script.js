document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list ul");
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");
  const closeBtn = document.getElementById("closeBtn");


  hamburger.addEventListener("click", function () {
    navList.classList.toggle("active");
    hamburger.classList.toggle("active");
  });

  loginBtn.addEventListener("click", function () {
    loginForm.style.display = "flex";
  });

  closeBtn.addEventListener("click", function () {
    loginForm.style.display = "none";
  });
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFfAIp5XLLkWkbuiPbLin1fcQjSvd09Gw",
  authDomain: "ephphathalogin-9f3c4.firebaseapp.com",
  projectId: "ephphathalogin-9f3c4",
  storageBucket: "ephphathalogin-9f3c4.appspot.com",
  messagingSenderId: "59436453215",
  appId: "1:59436453215:web:90019b6796125f72587aea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const submit = document.getElementById('submit')

const auth = getAuth();

submit.addEventListener("click", function (event) {
  event.preventDefault()
  //inputs
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      alert("Login Successfully")
      //window.location.href("yung pupuntahan na file pag tapos mag login")

         // Redirect sa main page
         window.location.href = "main.html"; 
    
    })
    .catch((error) => {
      //pagwala sa database yung ininput na username and/or password
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage)
    });
})



