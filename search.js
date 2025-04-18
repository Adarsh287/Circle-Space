// Initialize Firebase
const firebaseConfig = {
    // Your Firebase configuration
apiKey: "AIzaSyAyQfGC56dqmcRGwb-ZFzxgO2f1FceqPkc",
authDomain: "communityplatform-4cd65.firebaseapp.com",
projectId: "communityplatform-4cd65",
storageBucket: "communityplatform-4cd65.firebasestorage.app",
messagingSenderId: "378118087548",
appId: "1:378118087548:web:a57649b4d4302733e4faf9",
measurementId: "G-LFPPGG23KL",
  }
  
  // Initialize Firebase if it hasn't been initialized yet
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  }
  
  // References
  const db = firebase.firestore()
  const auth = firebase.auth()
  
  // DOM Elements
  const createPostBtn = document.getElementById("createPostBtn")
  const createPostModal = document.getElementById("createPostModal")
  const createPostForm = document.getElementById("createPostForm")
  const loginModal = document.getElementById("loginModal")
  const registerModal = document.getElementById("registerModal")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const showRegisterForm = document.getElementById("showRegisterForm")
  const showLoginForm = document.getElementById("showLoginForm")
  const postDetailModal = document.getElementById("postDetailModal")
  const postsContainer = document.getElementById("postsContainer")
  const searchQuery = document.getElementById("searchQuery")
  const searchInput = document.getElementById("searchInput")
  const postFilter = document.getElementById("postFilter")
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
  
  // Variables
  let lastVisible = null
  let currentUser = null
  let currentSearchTerm = ""
  const postsPerPage = 6
  let currentFilter = "recent"
  
  // Event Listeners
  document.addEventListener("DOMContentLoaded", () => {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search)
    currentSearchTerm = urlParams.get("q") || ""
  
    if (!currentSearchTerm) {
      window.location.href = "home.html"
      return
    }
  
    // Set search query in UI
    searchQuery.textContent = currentSearchTerm
    searchInput.value = currentSearchTerm
  
    // Check authentication state
    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = user
        document.getElementById("userDisplayName").textContent = user.displayName || user.email
        searchPosts()
      } else {
        currentUser = null
        document.getElementById("userDisplayName").textContent = "Guest"
        searchPosts()
      }
    })
  
    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === createPostModal) {
        createPostModal.style.display = "none"
      }
      if (e.target === loginModal) {
        loginModal.style.display = "none"
      }
      if (e.target === registerModal) {
        registerModal.style.display = "none"
      }
      if (e.target === postDetailModal) {
        postDetailModal.style.display = "none"
      }
    })
  
    // Close buttons for modals
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        createPostModal.style.display = "none"
        loginModal.style.display = "none"
        registerModal.style.display = "none"
        postDetailModal.style.display = "none"
      })
    })
  
    // Create Post Button
    if (createPostBtn) {
      createPostBtn.addEventListener("click", () => {
        if (currentUser) {
          createPostModal.style.display = "block"
        } else {
          loginModal.style.display = "block"
        }
      })
    }
  
    // Cancel button in create post form
    document.querySelector(".cancel-btn").addEventListener("click", () => {
      createPostModal.style.display = "none"
    })
  
    // Create Post Form Submission
    if (createPostForm) {
      createPostForm.addEventListener("submit", handleCreatePost)
    }
  
    // Login Form Submission
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin)
    }
  
    // Register Form Submission
    if (registerForm) {
      registerForm.addEventListener("submit", handleRegister)
    }
  
    // Show Register Form
    if (showRegisterForm) {
      showRegisterForm.addEventListener("click", (e) => {
        e.preventDefault()
        loginModal.style.display = "none"
        registerModal.style.display = "block"
      })
    }
  
    // Show Login Form
    if (showLoginForm) {
      showLoginForm.addEventListener("click", (e) => {
        e.preventDefault()
        registerModal.style.display = "none"
        loginModal.style.display = "block"
      })
    }
  
    // Post Filter Change
    if (postFilter) {
      postFilter.addEventListener("change", () => {
        currentFilter = postFilter.value
        postsContainer.innerHTML = ""
        lastVisible = null
        searchPosts()
      })
    }
  
    // Load More Button
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadMorePosts)
    }
  
    // Search Input
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const searchTerm = searchInput.value.trim()
          if (searchTerm) {
            window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`
          }
        }
      })
    }
  
    // Mobile Menu Toggle
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", () => {
        document.body.classList.toggle("mobile-menu-active")
      })
    }
  
    // Dropdown Toggle in Mobile View
    document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault()
          toggle.parentElement.classList.toggle("active")
        }
      })
    })
  })
  
  // Search Posts
  async function searchPosts() {
    try {
      // This is a simple implementation that searches only in title and content
      // For a more advanced search, you might want to use a dedicated search service like Algolia
  
      // Get all posts
      let query = db.collection("posts")
  
      if (currentFilter === "recent") {
        query = query.orderBy("createdAt", "desc")
      } else if (currentFilter === "popular") {
        query = query.orderBy("likes", "desc")
      } else if (currentFilter === "commented") {
        query = query.orderBy("commentCount", "desc")
      }
  
      if (lastVisible) {
        query = query.startAfter(lastVisible)
      }
  
      const snapshot = await query.limit(50).get() // Get more posts to filter locally
  
      if (snapshot.empty && !lastVisible) {
        postsContainer.innerHTML = '<p class="no-posts">No posts found matching your search.</p>'
        loadMoreBtn.style.display = "none"
        return
      }
  
      // Filter posts locally based on search term
      const searchTermLower = currentSearchTerm.toLowerCase()
      const matchingPosts = []
  
      snapshot.forEach((doc) => {
        const post = doc.data()
        post.id = doc.id
  
        const titleLower = post.title.toLowerCase()
        const contentLower = post.content.toLowerCase()
        const tagsLower = post.tags ? post.tags.map((tag) => tag.toLowerCase()) : []
  
        if (
          titleLower.includes(searchTermLower) ||
          contentLower.includes(searchTermLower) ||
          tagsLower.some((tag) => tag.includes(searchTermLower))
        ) {
          matchingPosts.push(post)
        }
      })
  
      if (matchingPosts.length === 0 && !lastVisible) {
        postsContainer.innerHTML = '<p class="no-posts">No posts found matching your search.</p>'
        loadMoreBtn.style.display = "none"
        return
      }
  
      // Display only the first 'postsPerPage' matching posts
      const postsToDisplay = matchingPosts.slice(0, postsPerPage)
  
      if (postsToDisplay.length > 0) {
        lastVisible = snapshot.docs[snapshot.docs.length - 1]
      }
  
      postsToDisplay.forEach((post) => {
        renderPost(post)
      })
  
      loadMoreBtn.style.display = postsToDisplay.length < postsPerPage ? "none" : "block"
    } catch (error) {
      console.error("Error searching posts:", error)
      postsContainer.innerHTML = '<p class="error">Error searching posts. Please try again later.</p>'
    }
  }
  
  // Load More Posts
  function loadMorePosts() {
    searchPosts()
  }
  
  // Render Post
  function renderPost(post) {
    const postElement = document.createElement("div")
    postElement.className = "post-card"
  
    const date = new Date(post.createdAt.toDate())
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  
    // Highlight search term in title and content
    let highlightedTitle = post.title
    let highlightedContent = post.content
  
    if (currentSearchTerm) {
      const regex = new RegExp(currentSearchTerm, "gi")
      highlightedTitle = post.title.replace(regex, (match) => `<span class="highlight">${match}</span>`)
      highlightedContent = post.content.replace(regex, (match) => `<span class="highlight">${match}</span>`)
    }
  
    postElement.innerHTML = `
          <div class="post-header">
              <h3 class="post-title">${highlightedTitle}</h3>
              <div class="post-meta">
                  <div class="author-info">
                      <i class="fas fa-user-circle"></i>
                      <span>${post.authorName || "Anonymous"}</span>
                  </div>
                  <div class="post-date">
                      <i class="far fa-calendar-alt"></i>
                      <span>${formattedDate}</span>
                  </div>
                  <div class="post-category">
                      <i class="fas fa-tag"></i>
                      <span>${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</span>
                  </div>
              </div>
          </div>
          <div class="post-body">
              <p class="post-content">${highlightedContent}</p>
          </div>
          <div class="post-footer">
              <div class="post-stats">
                  <div class="stat">
                      <i class="far fa-heart"></i>
                      <span>${post.likes || 0}</span>
                  </div>
                  <div class="stat">
                      <i class="far fa-comment"></i>
                      <span>${post.commentCount || 0}</span>
                  </div>
              </div>
              <a href="#" class="read-more" data-post-id="${post.id}">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
      `
  
    // Add event listener to "Read more" link
    postElement.querySelector(".read-more").addEventListener("click", (e) => {
      e.preventDefault()
      const postId = e.target.getAttribute("data-post-id") || e.target.parentElement.getAttribute("data-post-id")
      openPostDetail(postId)
    })
  
    postsContainer.appendChild(postElement)
  }
  
  // Open Post Detail
  async function openPostDetail(postId) {
    try {
      const doc = await db.collection("posts").doc(postId).get()
  
      if (!doc.exists) {
        alert("Post not found!")
        return
      }
  
      const post = doc.data()
      post.id = doc.id
  
      const date = new Date(post.createdAt.toDate())
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
  
      document.getElementById("detailPostTitle").textContent = post.title
      document.getElementById("detailPostAuthor").textContent = post.authorName || "Anonymous"
      document.getElementById("detailPostDate").textContent = formattedDate
      document.getElementById("detailPostCategory").textContent =
        post.category.charAt(0).toUpperCase() + post.category.slice(1)
      document.getElementById("detailPostContent").textContent = post.content
      document.getElementById("likeCount").textContent = post.likes || 0
      document.getElementById("commentCount").textContent = post.commentCount || 0
  
      // Check if user has liked the post
      if (currentUser) {
        const likeDoc = await db.collection("likes").doc(`${currentUser.uid}_${postId}`).get()
        const likeBtn = document.getElementById("likePostBtn")
  
        if (likeDoc.exists) {
          likeBtn.classList.add("active")
          likeBtn.querySelector("i").className = "fas fa-heart"
        } else {
          likeBtn.classList.remove("active")
          likeBtn.querySelector("i").className = "far fa-heart"
        }
  
        // Add event listener to like button
        likeBtn.addEventListener("click", () => toggleLike(postId))
      }
  
      // Load comments
      loadComments(postId)
  
      // Add event listener to comment form
      const submitCommentBtn = document.getElementById("submitCommentBtn")
      submitCommentBtn.onclick = () => {
        if (currentUser) {
          addComment(postId)
        } else {
          postDetailModal.style.display = "none"
          loginModal.style.display = "block"
        }
      }
  
      postDetailModal.style.display = "block"
    } catch (error) {
      console.error("Error opening post detail:", error)
      alert("Error loading post details. Please try again later.")
    }
  }
  
  // Load Comments
  async function loadComments(postId) {
    try {
      const commentsContainer = document.getElementById("commentsContainer")
      commentsContainer.innerHTML = ""
  
      const snapshot = await db.collection("comments").where("postId", "==", postId).orderBy("createdAt", "desc").get()
  
      if (snapshot.empty) {
        commentsContainer.innerHTML = "<p>No comments yet. Be the first to comment!</p>"
        return
      }
  
      snapshot.forEach((doc) => {
        const comment = doc.data()
        const date = new Date(comment.createdAt.toDate())
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
  
        const commentElement = document.createElement("div")
        commentElement.className = "comment"
        commentElement.innerHTML = `
                  <div class="comment-header">
                      <div class="comment-author">${comment.authorName || "Anonymous"}</div>
                      <div class="comment-date">${formattedDate}</div>
                  </div>
                  <div class="comment-body">${comment.content}</div>
              `
  
        commentsContainer.appendChild(commentElement)
      })
    } catch (error) {
      console.error("Error loading comments:", error)
      document.getElementById("commentsContainer").innerHTML =
        '<p class="error">Error loading comments. Please try again later.</p>'
    }
  }
  
  // Add Comment
  async function addComment(postId) {
    try {
      const commentText = document.getElementById("commentText").value.trim()
  
      if (!commentText) {
        alert("Please enter a comment.")
        return
      }
  
      const comment = {
        postId,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        content: commentText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
  
      await db.collection("comments").add(comment)
  
      // Update comment count in post
      await db
        .collection("posts")
        .doc(postId)
        .update({
          commentCount: firebase.firestore.FieldValue.increment(1),
        })
  
      // Clear comment text
      document.getElementById("commentText").value = ""
  
      // Reload comments
      loadComments(postId)
  
      // Update comment count in UI
      const commentCount = document.getElementById("commentCount")
      commentCount.textContent = (Number.parseInt(commentCount.textContent) + 1).toString()
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Error adding comment. Please try again later.")
    }
  }
  
  // Toggle Like
  async function toggleLike(postId) {
    try {
      if (!currentUser) {
        postDetailModal.style.display = "none"
        loginModal.style.display = "block"
        return
      }
  
      const likeId = `${currentUser.uid}_${postId}`
      const likeDoc = await db.collection("likes").doc(likeId).get()
      const likeBtn = document.getElementById("likePostBtn")
      const likeCount = document.getElementById("likeCount")
  
      if (likeDoc.exists) {
        // Unlike
        await db.collection("likes").doc(likeId).delete()
        await db
          .collection("posts")
          .doc(postId)
          .update({
            likes: firebase.firestore.FieldValue.increment(-1),
          })
  
        likeBtn.classList.remove("active")
        likeBtn.querySelector("i").className = "far fa-heart"
        likeCount.textContent = (Number.parseInt(likeCount.textContent) - 1).toString()
      } else {
        // Like
        await db.collection("likes").doc(likeId).set({
          userId: currentUser.uid,
          postId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
  
        await db
          .collection("posts")
          .doc(postId)
          .update({
            likes: firebase.firestore.FieldValue.increment(1),
          })
  
        likeBtn.classList.add("active")
        likeBtn.querySelector("i").className = "fas fa-heart"
        likeCount.textContent = (Number.parseInt(likeCount.textContent) + 1).toString()
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      alert("Error updating like. Please try again later.")
    }
  }
  
  // Handle Create Post
  async function handleCreatePost(e) {
    e.preventDefault()
  
    if (!currentUser) {
      createPostModal.style.display = "none"
      loginModal.style.display = "block"
      return
    }
  
    const title = document.getElementById("postTitle").value.trim()
    const category = document.getElementById("postCategory").value
    const content = document.getElementById("postContent").value.trim()
    const tags = document
      .getElementById("postTags")
      .value.trim()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
  
    if (!title || !category || !content) {
      alert("Please fill in all required fields.")
      return
    }
  
    try {
      const post = {
        title,
        category,
        content,
        tags,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        commentCount: 0,
      }
  
      await db.collection("posts").add(post)
  
      createPostForm.reset()
      createPostModal.style.display = "none"
  
      // Reload posts
      postsContainer.innerHTML = ""
      lastVisible = null
      searchPosts()
  
      alert("Post created successfully!")
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Error creating post. Please try again later.")
    }
  }
  
  // Handle Login
  async function handleLogin(e) {
    e.preventDefault()
  
    const email = document.getElementById("loginEmail").value.trim()
    const password = document.getElementById("loginPassword").value
  
    if (!email || !password) {
      alert("Please fill in all fields.")
      return
    }
  
    try {
      await auth.signInWithEmailAndPassword(email, password)
      loginForm.reset()
      loginModal.style.display = "none"
    } catch (error) {
      console.error("Error logging in:", error)
      alert(`Login failed: ${error.message}`)
    }
  }
  
  // Handle Register
  async function handleRegister(e) {
    e.preventDefault()
  
    const name = document.getElementById("registerName").value.trim()
    const email = document.getElementById("registerEmail").value.trim()
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("registerConfirmPassword").value
  
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.")
      return
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.")
      return
    }
  
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      await userCredential.user.updateProfile({
        displayName: name,
      })
  
      registerForm.reset()
      registerModal.style.display = "none"
    } catch (error) {
      console.error("Error registering:", error)
      alert(`Registration failed: ${error.message}`)
    }
  }
  
  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await auth.signOut()
      alert("Logged out successfully!")
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Error logging out. Please try again later.")
    }
  })
  