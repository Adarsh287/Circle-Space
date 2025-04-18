// Check if user is logged in
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    document.getElementById("userDisplayName").textContent = user.displayName || user.email
    document.getElementById("logoutBtn").style.display = "block"
  } else {
    // User is signed out
    document.getElementById("userDisplayName").textContent = "Guest"
    document.getElementById("logoutBtn").style.display = "none"
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful
      window.location.reload()
    })
    .catch((error) => {
      // An error happened
      console.error("Logout Error:", error)
      alert("Error logging out. Please try again.")
    })
})
