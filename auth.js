// Import Firebase modules
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "./firebaseConfig" // Import your firebaseConfig object

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app)
const db = getFirestore(app)

// Check authentication state
auth.onAuthStateChanged((user) => {
  // If on login page and user is logged in, redirect to home
  if (window.location.pathname.includes("login.html") && user) {
    window.location.href = "home.html"
  }

  // If on index page (register) and user is logged in, redirect to home
  if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
    if (user) {
      window.location.href = "home.html"
    }
  }

  // If on home or category page and user is not logged in, redirect to login
  if ((window.location.pathname.includes("home.html") || window.location.pathname.includes("category.html")) && !user) {
    window.location.href = "login.html"
  }

  // Update UI based on authentication state
  if (user) {
    // If user is logged in and we're on a page with user display
    const userDisplayElement = document.getElementById("userDisplayName")
    if (userDisplayElement) {
      userDisplayElement.textContent = user.displayName || user.email
    }
  }
})

// Register form submission
const registerForm = document.getElementById("registerForm")
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validate passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    // Create user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Update profile with display name
        return updateProfile(userCredential.user, {
          displayName: fullName,
        })
      })
      .then(() => {
        // Create user document in Firestore
        return setDoc(doc(db, "users", auth.currentUser.uid), {
          fullName: fullName,
          email: email,
          createdAt: serverTimestamp(),
        })
      })
      .then(() => {
        // Redirect to home page
        window.location.href = "home.html"
      })
      .catch((error) => {
        alert("Error: " + error.message)
      })
  })
}

// Login form submission
const loginForm = document.getElementById("loginForm")
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    // Sign in with email and password
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Redirect to home page
        window.location.href = "home.html"
      })
      .catch((error) => {
        alert("Error: " + error.message)
      })
  })
}

// Logout button
const logoutBtn = document.getElementById("logoutBtn")
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Redirect to login page
        window.location.href = "login.html"
      })
      .catch((error) => {
        alert("Error: " + error.message)
      })
  })
}
