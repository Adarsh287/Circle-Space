// Import Firebase modules (replace with your actual Firebase configuration)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js"
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-firestore.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js"

// Your web app's Firebase configuration
// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG6d0AlMuiqVSCk0H6pZgeT472eDIXXWg",
  authDomain: "communityplatform-a15d7.firebaseapp.com",
  projectId: "communityplatform-a15d7",
  storageBucket: "communityplatform-a15d7.firebasestorage.app",
  messagingSenderId: "498808991473",
  appId: "1:498808991473:web:edcfea6e773c8083da8350",
  measurementId: "G-LNHRQCYRL1"
}

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
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const category = urlParams.get("category")
  const postId = urlParams.get("post")

  // Get references to elements
  const categoryTitle = document.getElementById("categoryTitle")
  const categoryDescription = document.getElementById("categoryDescription")
  const categoryPosts = document.getElementById("categoryPosts")
  const postDetailModal = document.getElementById("postDetailModal")
  const postDetailContent = document.getElementById("postDetailContent")
  const commentsContainer = document.getElementById("commentsContainer")
  const commentForm = document.getElementById("commentForm")
  const createPostBtn = document.getElementById("createPostBtn")
  const createPostModal = document.getElementById("createPostModal")
  const createPostForm = document.getElementById("createPostForm")
  const closeButtons = document.querySelectorAll(".close")

  // Set category title and description
  if (category) {
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1)

    // Set category description based on category
    const descriptions = {
      health: "Discussions about health, wellness, and fitness",
      education: "Topics related to learning, schools, and education",
      sports: "All about sports, games, and athletic activities",
      technology: "Tech news, gadgets, and digital innovations",
      entertainment: "Movies, music, TV shows, and other entertainment",
      lifestyle: "Fashion, food, travel, and daily life",
    }

    categoryDescription.textContent = descriptions[category] || ""
  }

  // Handle create post modal
  createPostBtn.addEventListener("click", () => {
    createPostModal.style.display = "block"

    // Pre-select the current category
    if (category) {
      document.getElementById("postCategory").value = category
    }
  })

  // Close modals when clicking close button
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      postDetailModal.style.display = "none"
      createPostModal.style.display = "none"
    })
  })

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === postDetailModal) {
      postDetailModal.style.display = "none"
    }
    if (e.target === createPostModal) {
      createPostModal.style.display = "none"
    }
  })

  // Handle create post form submission
  createPostForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const title = document.getElementById("postTitle").value
    const postCategory = document.getElementById("postCategory").value
    const content = document.getElementById("postContent").value

    // Create post in Firestore
    db.collection("posts")
      .add({
        title: title,
        category: postCategory,
        content: content,
        author: {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName || auth.currentUser.email,
        },
        likes: 0,
        comments: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        // Reset form and close modal
        createPostForm.reset()
        createPostModal.style.display = "none"

        // Reload posts if we're on the same category
        if (postCategory === category) {
          loadCategoryPosts()
        } else {
          // Redirect to the new post's category
          window.location.href = `category.html?category=${postCategory}`
        }
      })
      .catch((error) => {
        alert("Error: " + error.message)
      })
  })

  // Load posts for the current category
  function loadCategoryPosts() {
    categoryPosts.innerHTML = ""

    db.collection("posts")
      .where("category", "==", category)
      .orderBy("createdAt", "desc")
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          categoryPosts.innerHTML = "<p>No posts in this category yet. Be the first to create a post!</p>"
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
            openPostDetail(postId)
          })

          categoryPosts.appendChild(postCard)
        })

        // If a specific post ID was provided in the URL, open it
        if (postId) {
          openPostDetail(postId)
        }
      })
      .catch((error) => {
        console.error("Error loading posts:", error)
        categoryPosts.innerHTML = "<p>Error loading posts. Please try again later.</p>"
      })
  }

  // Open post detail modal
  function openPostDetail(postId) {
    db.collection("posts")
      .doc(postId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          alert("Post not found!")
          return
        }

        const post = doc.data()
        const postDate = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Just now"

        // Update post detail content
        postDetailContent.innerHTML = `
                    <div class="post-detail">
                        <h2>${post.title}</h2>
                        <div class="post-detail-meta">
                            <span>${post.author.name} • ${postDate}</span>
                            <span class="post-detail-category">${post.category}</span>
                        </div>
                        <div class="post-detail-content">
                            ${post.content}
                        </div>
                        <div class="post-detail-actions">
                            <button class="like-btn" data-id="${postId}">
                                <i class="far fa-heart"></i> <span>${post.likes || 0}</span> Likes
                            </button>
                            <button class="comment-btn" data-id="${postId}">
                                <i class="far fa-comment"></i> <span>${post.comments || 0}</span> Comments
                            </button>
                            <button class="share-btn" data-id="${postId}">
                                <i class="far fa-share-square"></i> Share
                            </button>
                        </div>
                    </div>
                `

        // Set up like button functionality
        const likeBtn = postDetailContent.querySelector(".like-btn")
        likeBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          let snapshot // Declare snapshot here
          // Check if user has already liked this post
          db.collection("likes")
            .where("postId", "==", postId)
            .where("userId", "==", auth.currentUser.uid)
            .get()
            .then((snapshotResult) => {
              snapshot = snapshotResult
              if (snapshot.empty) {
                // User hasn't liked this post yet, add like
                return db.collection("likes").add({
                  postId: postId,
                  userId: auth.currentUser.uid,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                })
              } else {
                // User already liked this post, remove like
                return snapshot.docs[0].ref.delete()
              }
            })
            .then(() => {
              // Update post likes count
              return db.collection("likes").where("postId", "==", postId).get()
            })
            .then((snapshotResult) => {
              snapshot = snapshotResult
              // Update post with new likes count
              return db.collection("posts").doc(postId).update({
                likes: snapshot.size,
              })
            })
            .then(() => {
              // Update UI
              likeBtn.querySelector("span").textContent = Number.parseInt(likeBtn.querySelector("span").textContent) + 1
            })
            .catch((error) => {
              console.error("Error updating like:", error)
            })
        })

        // Set up share button functionality
        const shareBtn = postDetailContent.querySelector(".share-btn")
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation()

          // Create a temporary input to copy the URL
          const input = document.createElement("input")
          input.value = window.location.href
          document.body.appendChild(input)
          input.select()
          document.execCommand("copy")
          document.body.removeChild(input)

          alert("Link copied to clipboard!")
        })

        // Load comments for this post
        loadComments(postId)

        // Show the modal
        postDetailModal.style.display = "block"

        // Set up comment form submission
        commentForm.onsubmit = (e) => {
          e.preventDefault()

          const commentText = document.getElementById("commentText").value

          // Add comment to Firestore
          db.collection("comments")
            .add({
              postId: postId,
              text: commentText,
              author: {
                uid: auth.currentUser.uid,
                name: auth.currentUser.displayName || auth.currentUser.email,
              },
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
              // Reset form
              document.getElementById("commentText").value = ""

              // Reload comments
              loadComments(postId)

              // Update post comments count
              return db.collection("comments").where("postId", "==", postId).get()
            })
            .then((snapshot) => {
              // Update post with new comments count
              return db.collection("posts").doc(postId).update({
                comments: snapshot.size,
              })
            })
            .catch((error) => {
              console.error("Error adding comment:", error)
            })
        }
      })
      .catch((error) => {
        console.error("Error loading post:", error)
      })
  }

  // Load comments for a post
  function loadComments(postId) {
    commentsContainer.innerHTML = ""

    db.collection("comments")
      .where("postId", "==", postId)
      .orderBy("createdAt", "desc")
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          commentsContainer.innerHTML = "<p>No comments yet. Be the first to comment!</p>"
          return
        }

        snapshot.forEach((doc) => {
          const comment = doc.data()
          const commentDate = comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleDateString() : "Just now"

          const commentElement = document.createElement("div")
          commentElement.className = "comment"
          commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">${comment.author.name}</span>
                            <span class="comment-date">${commentDate}</span>
                        </div>
                        <div class="comment-text">
                            ${comment.text}
                        </div>
                    `

          commentsContainer.appendChild(commentElement)
        })
      })
      .catch((error) => {
        console.error("Error loading comments:", error)
        commentsContainer.innerHTML = "<p>Error loading comments. Please try again later.</p>"
      })
  }

  // Load posts when page loads
  if (category) {
    loadCategoryPosts()
  }
})
