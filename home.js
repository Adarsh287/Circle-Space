// Import Firebase modules (if using modules)
import { initializeApp } from "firebase/app"
import { getFirestore, serverTimestamp, collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyCG6d0AlMuiqVSCk0H6pZgeT472eDIXXWg",
    authDomain: "communityplatform-a15d7.firebaseapp.com",
    projectId: "communityplatform-a15d7",
    storageBucket: "communityplatform-a15d7.firebasestorage.app",
    messagingSenderId: "498808991473",
    appId: "1:498808991473:web:edcfea6e773c8083da8350",
    measurementId: "G-LNHRQCYRL1"
}

// function moveToLogin(){
//   window.location.href='index.html'
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const firebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: serverTimestamp,
    },
  },
}

// Wait for DOM content to load
document.addEventListener("DOMContentLoaded", () => {
  // Get references to elements
  const postsContainer = document.getElementById("postsContainer")
  const categoryCards = document.querySelectorAll(".category-card")
  const createPostBtn = document.getElementById("createPostBtn")
  const createPostModal = document.getElementById("createPostModal")
  const createPostForm = document.getElementById("createPostForm")
  const closeButtons = document.querySelectorAll(".close")

  // Add event listeners to category cards
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category")
      window.location.href = `category.html?category=${category}`
    })
  })

  // Handle create post modal
  createPostBtn.addEventListener("click", () => {
    createPostModal.style.display = "block"
  })

  // Close modals when clicking close button
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      createPostModal.style.display = "none"
    })
  })

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === createPostModal) {
      createPostModal.style.display = "none"
    }
  })

  // Handle create post form submission
  createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const title = document.getElementById("postTitle").value
    const category = document.getElementById("postCategory").value
    const content = document.getElementById("postContent").value

    try {
      // Create post in Firestore
      await addDoc(collection(db, "posts"), {
        title: title,
        category: category,
        content: content,
        author: {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName || auth.currentUser.email,
        },
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      })

      // Reset form and close modal
      createPostForm.reset()
      createPostModal.style.display = "none"

      // Reload posts
      loadRecentPosts()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })

  // Load recent posts
  async function loadRecentPosts() {
    postsContainer.innerHTML = ""

    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(6))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        postsContainer.innerHTML = "<p>No posts yet. Be the first to create a post!</p>"
        return
      }

      snapshot.forEach((doc) => {
        const post = doc.data()
        const postId = doc.id
        const postDate = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Just now"

        const postCard = document.createElement("div")
        postCard.className = "post-card"
        postCard.innerHTML = `
                    <div class="post-content">
                        <span class="post-category">${post.category}</span>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-excerpt">${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}</p>
                        <div class="post-meta">
                            <span>${post.author.name} • ${postDate}</span>
                            <div class="post-actions">
                                <button class="like-btn" data-id="${postId}">
                                    <i class="far fa-heart"></i> <span>${post.likes || 0}</span>
                                </button>
                                <button class="comment-btn" data-id="${postId}">
                                    <i class="far fa-comment"></i> <span>${post.comments || 0}</span>
                                </button>
                                <button class="share-btn" data-id="${postId}">
                                    <i class="far fa-share-square"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `

        postCard.addEventListener("click", () => {
          window.location.href = `category.html?category=${post.category}&post=${postId}`
        })

        postsContainer.appendChild(postCard)
      })
    } catch (error) {
      console.error("Error loading posts:", error)
      postsContainer.innerHTML = "<p>Error loading posts. Please try again later.</p>"
    }
  }

  // Load recent posts when page loads
  loadRecentPosts()
})


// logout button  logoutBtn

const logoutButton = Document.getElementById("logoutBtn");

logoutButton.addEventListener('click', () => {
  auth.signOut().then(() => {
      console.log("User signed out");
       messageArea.textContent = "You have been logged out.";
       messageArea.style.color = "green";
  }).catch((error) => {
      console.error("Sign out error:", error);
      messageArea.textContent = "Error signing out: " + error.message;
      messageArea.style.color = "red";
  });
});