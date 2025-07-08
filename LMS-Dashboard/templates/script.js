/**
 * LMS Student Dashboard - Enhanced JavaScript
 * Handles all frontend interactions and API communications
 */

class LMSApp {
  constructor() {
    this.apiBaseUrl = "http://localhost:5000/api"
    this.currentUser = null
    this.currentPage = "dashboard"
    this.activeLeaderboardTab = "weekly"
    this.expandedCourse = null

    this.init()
  }

  async init() {
    this.setupEventListeners()
    this.setupSidebar()
    await this.loadUserData()
    await this.loadDashboardData()
    this.initializeChart()
    this.startPeriodicUpdates()
  }

  setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle")
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => this.toggleSidebar())
    }

    // Navigation and interaction handlers
    document.addEventListener("click", (e) => {
      // Navigation
      if (e.target.matches("[data-page]")) {
        e.preventDefault()
        const page = e.target.getAttribute("data-page")
        this.navigateToPage(page)
      }

      // Course roadmap toggle
      if (e.target.matches(".course-toggle-btn") || e.target.closest(".course-toggle-btn")) {
        const btn = e.target.closest(".course-toggle-btn") || e.target
        const courseId = btn.getAttribute("data-course-id")
        this.toggleCourseRoadmap(courseId)
      }

      // Course continue button
      if (e.target.matches(".continue-btn") || e.target.closest(".continue-btn")) {
        const btn = e.target.closest(".continue-btn") || e.target
        const courseId = btn.getAttribute("data-course-id")
        this.navigateToCourse(courseId)
      }

      // Leaderboard tabs
      if (e.target.matches(".tab-btn")) {
        const tab = e.target.getAttribute("data-tab")
        this.switchLeaderboardTab(tab)
      }

      // Back to dashboard
      if (e.target.matches("#backToDashboard")) {
        this.navigateToPage("dashboard")
      }

      // Skill items
      if (e.target.matches(".skill-item") || e.target.closest(".skill-item")) {
        const skillItem = e.target.closest(".skill-item") || e.target
        const skillType = skillItem.getAttribute("data-skill")
        this.openSkillModule(skillType)
      }

      // Club and activity items
      if (e.target.matches(".club-item") || e.target.closest(".club-item")) {
        const clubItem = e.target.closest(".club-item") || e.target
        const clubId = clubItem.getAttribute("data-club-id")
        this.openClubDetails(clubId)
      }

      if (e.target.matches(".activity-item") || e.target.closest(".activity-item")) {
        const activityItem = e.target.closest(".activity-item") || e.target
        const activityId = activityItem.getAttribute("data-activity-id")
        this.openActivityDetails(activityId)
      }

      // Close popups
      if (e.target.matches("#achievementClose")) {
        this.hideAchievementPopup()
      }
    })

    // Close popups on outside click
    document.addEventListener("click", (e) => {
      if (e.target.matches(".achievement-popup")) {
        this.hideAchievementPopup()
      }
    })
  }

  setupSidebar() {
    // Set initial sidebar state
    const sidebar = document.getElementById("sidebar")
    const savedState = localStorage.getItem("sidebarCollapsed")

    if (savedState === "true") {
      sidebar.classList.add("collapsed")
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar")
    sidebar.classList.toggle("collapsed")

    // Save state
    const isCollapsed = sidebar.classList.contains("collapsed")
    localStorage.setItem("sidebarCollapsed", isCollapsed)
  }

  navigateToPage(page) {
    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })

    const activeNavItem = document.querySelector(`[data-page="${page}"]`)?.closest(".nav-item")
    if (activeNavItem) {
      activeNavItem.classList.add("active")
    }

    // Show/hide page content
    document.querySelectorAll(".page-content").forEach((content) => {
      content.style.display = "none"
    })

    const targetPage = document.getElementById(`${page}Page`)
    if (targetPage) {
      targetPage.style.display = "block"
      targetPage.classList.add("fade-in")
    }

    this.currentPage = page
    this.loadPageData(page)
  }

  async loadUserData() {
    try {
      const userData = {
        id: 1,
        name: "Alex Johnson",
        email: "alex.johnson@university.edu",
        avatar: "https://via.placeholder.com/40/8B5CF6/FFFFFF?text=AJ",
        xp_points: 2450,
        level: 12,
        current_streak: 7,
        leaderboard_position: 3,
      }

      this.currentUser = userData
      this.updateUserInterface(userData)
    } catch (error) {
      console.error("Error loading user data:", error)
      this.showNotification("Error loading user data", "error")
    }
  }

  updateUserInterface(userData) {
    const userName = document.getElementById("userName")
    const userLevel = document.getElementById("userLevel")
    const userAvatar = document.getElementById("userAvatar")

    if (userName) userName.textContent = userData.name
    if (userLevel) userLevel.textContent = userData.level
    if (userAvatar) userAvatar.src = userData.avatar
  }

  async loadDashboardData() {
    try {
      this.showLoading(true)

      const [coursesData, clubsData, activitiesData, leaderboardData, pendingTasksData] = await Promise.all([
        this.loadCourses(),
        this.loadClubs(),
        this.loadActivities(),
        this.loadLeaderboard(),
        this.loadPendingTasks(),
      ])

      this.renderCourses(coursesData)
      this.renderClubs(clubsData)
      this.renderActivities(activitiesData)
      this.renderLeaderboard(leaderboardData)
      this.renderPendingTasks(pendingTasksData)
      this.renderSkills()
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      this.showNotification("Error loading dashboard data", "error")
    } finally {
      this.showLoading(false)
    }
  }

  async loadCourses() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "Data Structures",
            instructor: "Dr. Smith",
            progress: 75,
            type: "Monthly",
          },
          {
            id: 2,
            name: "Web Development",
            instructor: "Prof. Johnson",
            progress: 60,
            type: "Assignments",
          },
          {
            id: 3,
            name: "Machine Learning",
            instructor: "Dr. Williams",
            progress: 30,
            type: "Learnings",
          },
        ])
      }, 500)
    })
  }

  async loadClubs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "Tech Club",
            description: "Programming enthusiasts",
            icon: "tech",
            nextEvent: "Hackathon 2024",
          },
          {
            id: 2,
            name: "Rotaract Club",
            description: "Community service",
            icon: "rotaract",
            nextEvent: "Blood Drive",
          },
          {
            id: 3,
            name: "Cultural Club",
            description: "Arts and culture",
            icon: "cultural",
            nextEvent: "Cultural Fest",
          },
        ])
      }, 300)
    })
  }

  async loadActivities() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "Dance",
            description: "Various dance forms",
            icon: "dance",
            nextEvent: "Dance Competition",
          },
          {
            id: 2,
            name: "Music",
            description: "Instrumental music",
            icon: "music",
            nextEvent: "Music Concert",
          },
          {
            id: 3,
            name: "Sports",
            description: "Athletics",
            icon: "sports",
            nextEvent: "Tournament",
          },
        ])
      }, 300)
    })
  }

  async loadLeaderboard() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          weekly: [
            { rank: 1, name: "Sarah Chen", department: "CS", points: 1250, change: "+50" },
            { rank: 2, name: "David Kim", department: "CS", points: 1180, change: "+30" },
            { rank: 3, name: "Alex Johnson", department: "CS", points: 1150, change: "+25" },
            { rank: 4, name: "Emma Wilson", department: "CS", points: 1100, change: "+20" },
            { rank: 5, name: "Mike Rodriguez", department: "CS", points: 1050, change: "+15" },
          ],
          monthly: [
            { rank: 1, name: "Sarah Chen", department: "CS", points: 4200, change: "+200" },
            { rank: 2, name: "Lisa Wang", department: "ENG", points: 4100, change: "+180" },
            { rank: 3, name: "David Kim", department: "CS", points: 4050, change: "+150" },
            { rank: 4, name: "Alex Johnson", department: "CS", points: 3950, change: "+120" },
            { rank: 5, name: "John Smith", department: "MATH", points: 3900, change: "+100" },
          ],
          currentUser: { rank: 3, name: "Alex Johnson", department: "CS", points: 1150 },
        })
      }, 400)
    })
  }

  async loadPendingTasks() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: "Data Structures Quiz",
            type: "quiz",
            course: "Data Structures",
            dueDate: "2024-01-15",
            urgent: true,
          },
          {
            id: 2,
            title: "React Assignment",
            type: "assignment",
            course: "Web Development",
            dueDate: "2024-01-18",
            urgent: false,
          },
          {
            id: 3,
            title: "ML Project",
            type: "assignment",
            course: "Machine Learning",
            dueDate: "2024-01-20",
            urgent: false,
          },
        ])
      }, 350)
    })
  }

  renderCourses(courses) {
    const coursesList = document.getElementById("coursesList")
    if (!coursesList) return

    coursesList.innerHTML = courses
      .map(
        (course) => `
            <div class="course-item" data-course-id="${course.id}">
                <div class="course-header">
                    <div>
                        <div class="course-title">${course.name}</div>
                        <div class="course-instructor">${course.type}</div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="course-toggle-btn" data-course-id="${course.id}">
                        <i class="fas fa-map"></i> Roadmap
                    </button>
                    <button class="continue-btn" data-course-id="${course.id}">
                        Continue
                    </button>
                </div>
                <div class="course-roadmap" id="roadmap-${course.id}">
                    <div class="roadmap-timeline">
                        ${this.generateCourseRoadmap(course.id)}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  generateCourseRoadmap(courseId) {
    const roadmaps = {
      1: [
        { title: "Introduction", description: "Basic concepts", completed: true },
        { title: "Arrays & Lists", description: "Linear structures", completed: true },
        { title: "Trees", description: "Hierarchical structures", completed: false },
        { title: "Graphs", description: "Graph algorithms", completed: false },
      ],
      2: [
        { title: "HTML & CSS", description: "Web basics", completed: true },
        { title: "JavaScript", description: "Programming", completed: true },
        { title: "React", description: "Framework", completed: false },
        { title: "Backend", description: "Server-side", completed: false },
      ],
      3: [
        { title: "ML Basics", description: "Fundamentals", completed: true },
        { title: "Supervised Learning", description: "Classification", completed: false },
        { title: "Neural Networks", description: "Deep learning", completed: false },
        { title: "Projects", description: "Real applications", completed: false },
      ],
    }

    const roadmap = roadmaps[courseId] || []
    return roadmap
      .map(
        (item) => `
      <div class="roadmap-item ${item.completed ? "completed" : ""}">
        <h4>${item.title}</h4>
        <p>${item.description}</p>
      </div>
    `,
      )
      .join("")
  }

  renderClubs(clubs) {
    const clubsList = document.getElementById("clubsList")
    if (!clubsList) return

    clubsList.innerHTML = clubs
      .map(
        (club) => `
            <div class="club-item" data-club-id="${club.id}">
                <div class="club-header">
                    <div class="club-icon ${club.icon}">
                        <i class="fas fa-${this.getClubIcon(club.icon)}"></i>
                    </div>
                    <div class="club-info">
                        <h4>${club.name}</h4>
                        <p>${club.description}</p>
                    </div>
                </div>
                <div class="event-badge">${club.nextEvent}</div>
            </div>
        `,
      )
      .join("")
  }

  renderActivities(activities) {
    const activitiesList = document.getElementById("activitiesList")
    if (!activitiesList) return

    activitiesList.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item" data-activity-id="${activity.id}">
                <div class="activity-header">
                    <div class="activity-icon ${activity.icon}">
                        <i class="fas fa-${this.getActivityIcon(activity.icon)}"></i>
                    </div>
                    <div class="activity-info">
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                    </div>
                </div>
                <div class="event-badge">${activity.nextEvent}</div>
            </div>
        `,
      )
      .join("")
  }

  renderSkills() {
    const skillsList = document.getElementById("skillsList")
    if (!skillsList) return

    const skills = [
      {
        type: "communication",
        name: "Communication",
        description: "Verbal skills",
        icon: "communication",
      },
      { type: "aptitude", name: "Aptitude", description: "Logic tests", icon: "aptitude" },
      { type: "interview", name: "Interviews", description: "Mock practice", icon: "interview" },
    ]

    skillsList.innerHTML = skills
      .map(
        (skill) => `
            <div class="skill-item" data-skill="${skill.type}">
                <div class="skill-icon ${skill.icon}">
                    <i class="fas fa-${this.getSkillIcon(skill.icon)}"></i>
                </div>
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
            </div>
        `,
      )
      .join("")
  }

  renderLeaderboard(data) {
    const leaderboardTable = document.getElementById("leaderboardTable")
    if (!leaderboardTable) return

    const currentData = data[this.activeLeaderboardTab]
    const currentUser = data.currentUser

    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Dept</th>
            <th>Points</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
    `

    currentData.forEach((student) => {
      const isCurrentUser = student.name === currentUser.name
      tableHTML += `
        <tr class="${isCurrentUser ? "current-user" : ""}">
          <td class="rank-cell">${student.rank}</td>
          <td>${student.name}</td>
          <td>${student.department}</td>
          <td class="${student.change.startsWith("+") ? "points-positive" : "points-negative"}">${student.points}</td>
          <td class="${student.change.startsWith("+") ? "points-positive" : "points-negative"}">${student.change}</td>
        </tr>
      `
    })

    // Add current user if not in top 5
    if (!currentData.some((s) => s.name === currentUser.name)) {
      tableHTML += `
        <tr class="current-user">
          <td class="rank-cell">${currentUser.rank}</td>
          <td>${currentUser.name} (You)</td>
          <td>${currentUser.department}</td>
          <td>${currentUser.points}</td>
          <td>--</td>
        </tr>
      `
    }

    tableHTML += `
        </tbody>
      </table>
    `

    leaderboardTable.innerHTML = tableHTML
  }

  renderPendingTasks(tasks) {
    const pendingTasksList = document.getElementById("pendingTasksList")
    if (!pendingTasksList) return

    pendingTasksList.innerHTML = tasks
      .map(
        (task) => `
            <div class="pending-task-item ${task.urgent ? "urgent" : "due-soon"}">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <span class="task-type ${task.type}">${task.type}</span>
                </div>
                <div class="task-due">Due: ${this.formatDate(task.dueDate)}</div>
                <div class="task-course">${task.course}</div>
            </div>
        `,
      )
      .join("")
  }

  toggleCourseRoadmap(courseId) {
    // Close any currently expanded roadmap
    if (this.expandedCourse && this.expandedCourse !== courseId) {
      const prevRoadmap = document.getElementById(`roadmap-${this.expandedCourse}`)
      const prevCourseItem = document.querySelector(`[data-course-id="${this.expandedCourse}"]`)
      if (prevRoadmap) {
        prevRoadmap.classList.remove("show")
      }
      if (prevCourseItem) {
        prevCourseItem.classList.remove("expanded")
      }
    }

    // Toggle current roadmap
    const roadmap = document.getElementById(`roadmap-${courseId}`)
    const courseItem = document.querySelector(`[data-course-id="${courseId}"]`)

    if (roadmap && courseItem) {
      if (roadmap.classList.contains("show")) {
        roadmap.classList.remove("show")
        courseItem.classList.remove("expanded")
        this.expandedCourse = null
      } else {
        roadmap.classList.add("show")
        courseItem.classList.add("expanded")
        this.expandedCourse = courseId
      }
    }
  }

  navigateToCourse(courseId) {
    // Show course detail page
    document.querySelectorAll(".page-content").forEach((content) => {
      content.style.display = "none"
    })

    const courseDetailPage = document.getElementById("courseDetailPage")
    const courseDetailTitle = document.getElementById("courseDetailTitle")
    const courseDetailContent = document.getElementById("courseDetailContent")

    if (courseDetailPage && courseDetailTitle && courseDetailContent) {
      const courseData = this.getCourseData(courseId)

      courseDetailTitle.textContent = courseData.name
      courseDetailContent.innerHTML = this.generateCourseDetailContent(courseData)

      courseDetailPage.style.display = "block"
      courseDetailPage.classList.add("fade-in")
    }
  }

  getCourseData(courseId) {
    const courses = {
      1: {
        id: 1,
        name: "Data Structures & Algorithms",
        instructor: "Dr. Smith",
        description: "Comprehensive course on fundamental data structures and algorithms",
        progress: 75,
        modules: 12,
        completedModules: 9,
      },
      2: {
        id: 2,
        name: "Web Development",
        instructor: "Prof. Johnson",
        description: "Full-stack web development using modern technologies",
        progress: 60,
        modules: 15,
        completedModules: 9,
      },
      3: {
        id: 3,
        name: "Machine Learning",
        instructor: "Dr. Williams",
        description: "Introduction to machine learning concepts and applications",
        progress: 30,
        modules: 10,
        completedModules: 3,
      },
    }
    return courses[courseId] || courses[1]
  }

  generateCourseDetailContent(course) {
    return `
      <div class="course-detail-overview">
        <h2>Course Overview</h2>
        <p>${course.description}</p>
        <div class="course-stats">
          <div class="stat">
            <strong>Instructor:</strong> ${course.instructor}
          </div>
          <div class="stat">
            <strong>Progress:</strong> ${course.progress}%
          </div>
          <div class="stat">
            <strong>Modules:</strong> ${course.completedModules}/${course.modules} completed
          </div>
        </div>
      </div>
      <div class="course-modules">
        <h3>Course Modules</h3>
        ${this.generateCourseRoadmap(course.id)}
      </div>
    `
  }

  switchLeaderboardTab(tab) {
    this.activeLeaderboardTab = tab

    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active")

    // Reload leaderboard data
    this.loadLeaderboard().then((data) => {
      this.renderLeaderboard(data)
    })
  }

  openSkillModule(skillType) {
    this.showNotification(`Opening ${skillType} skill module...`, "info")
  }

  openClubDetails(clubId) {
    this.showNotification(`Opening club details...`, "info")
  }

  openActivityDetails(activityId) {
    this.showNotification(`Opening activity details...`, "info")
  }

  getClubIcon(type) {
    const icons = {
      tech: "laptop-code",
      rotaract: "hands-helping",
      cultural: "theater-masks",
    }
    return icons[type] || "users"
  }

  getActivityIcon(type) {
    const icons = {
      dance: "music",
      music: "guitar",
      sports: "running",
    }
    return icons[type] || "star"
  }

  getSkillIcon(type) {
    const icons = {
      communication: "comments",
      aptitude: "brain",
      interview: "user-tie",
    }
    return icons[type] || "graduation-cap"
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  initializeChart() {
    const canvas = document.getElementById("communicationsChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    this.drawBarChart(ctx, canvas.width, canvas.height)
  }

  drawBarChart(ctx, width, height) {
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Sample data
    const data = [
      { label: "Week 1", values: [20, 35, 15, 25] },
      { label: "Week 2", values: [25, 40, 20, 30] },
      { label: "Week 3", values: [30, 45, 25, 35] },
      { label: "Week 4", values: [35, 50, 30, 40] },
    ]

    const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"]
    const barWidth = chartWidth / (data.length * 4 + data.length)
    const maxValue = 60

    // Draw bars
    data.forEach((week, weekIndex) => {
      week.values.forEach((value, valueIndex) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = padding + weekIndex * (barWidth * 4 + 20) + valueIndex * barWidth
        const y = height - padding - barHeight

        ctx.fillStyle = colors[valueIndex]
        ctx.fillRect(x, y, barWidth, barHeight)
      })

      // Draw week labels
      ctx.fillStyle = "#374151"
      ctx.font = "12px Arial"
      const labelX = padding + weekIndex * (barWidth * 4 + 20) + barWidth * 2
      ctx.fillText(week.label, labelX - 15, height - 10)
    })

    // Draw legend
    const legendY = 20
    colors.forEach((color, index) => {
      const legendX = padding + index * 80
      ctx.fillStyle = color
      ctx.fillRect(legendX, legendY, 12, 12)
      ctx.fillStyle = "#374151"
      ctx.font = "10px Arial"
      ctx.fillText(`Series ${index + 1}`, legendX + 16, legendY + 9)
    })
  }

  async loadPageData(page) {
    // Load page-specific data based on the current page
    switch (page) {
      case "courses":
        console.log("Loading courses page...")
        break
      case "assignments":
        console.log("Loading assignments page...")
        break
      case "leaderboard":
        console.log("Loading leaderboard page...")
        break
    }
  }

  showLoading(show) {
    const loadingOverlay = document.getElementById("loadingOverlay")
    if (loadingOverlay) {
      if (show) {
        loadingOverlay.classList.add("show")
      } else {
        loadingOverlay.classList.remove("show")
      }
    }
  }

  showNotification(message, type = "info") {
    const toast = document.getElementById("notificationToast")
    const toastMessage = document.getElementById("toastMessage")
    const toastIcon = toast.querySelector(".toast-icon")

    if (!toast || !toastMessage) return

    // Set message and type
    toastMessage.textContent = message
    toast.className = `notification-toast ${type}`

    // Update icon based on type
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }

    toastIcon.className = `toast-icon fas ${icons[type] || icons.info}`

    // Show toast
    toast.classList.add("show")

    // Auto-hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }

  showAchievementPopup(achievement) {
    const popup = document.getElementById("achievementPopup")
    const icon = document.getElementById("achievementIcon")
    const name = document.getElementById("achievementName")
    const description = document.getElementById("achievementDescription")
    const xp = document.getElementById("achievementXP")

    if (!popup) return

    // Set achievement data
    if (icon) icon.textContent = achievement.icon
    if (name) name.textContent = achievement.name
    if (description) description.textContent = achievement.description
    if (xp) xp.textContent = achievement.xp_reward || 100

    // Show popup with animation
    popup.classList.add("show")
    popup.classList.add("bounce-in")

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideAchievementPopup()
    }, 5000)
  }

  hideAchievementPopup() {
    const popup = document.getElementById("achievementPopup")
    if (popup) {
      popup.classList.remove("show")
      popup.classList.remove("bounce-in")
    }
  }

  startPeriodicUpdates() {
    // Update dashboard data every 5 minutes
    setInterval(
      async () => {
        try {
          await this.loadDashboardData()
        } catch (error) {
          console.error("Periodic update failed:", error)
        }
      },
      5 * 60 * 1000,
    )
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.lmsApp = new LMSApp()

  // Add some demo interactions
  setTimeout(() => {
    window.lmsApp.showNotification("Welcome to SagaLearn! 🎓", "success")
  }, 1000)

  // Demo achievement after 5 seconds
  setTimeout(() => {
    window.lmsApp.showAchievementPopup({
      icon: "🎯",
      name: "First Login",
      description: "Welcome to your learning journey!",
      xp_reward: 50,
    })
  }, 5000)
})

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = LMSApp
}

console.log("LMS Dashboard loaded successfully! 🚀")
