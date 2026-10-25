// Global Centralized Config & Shared State Management for ZJI Fashions
const API_BASE_URL = "http://127.0.0.1:8000/api";

// 1. Authentication & Role State
function getCurrentUser() {
    const raw = localStorage.getItem('smart_embroidery_user');
    if (!raw) {
        return {
            name: "Guest Operator",
            username: "guest",
            role: "guest",
            is_staff: false,
            authenticated: false
        };
    }
    try {
        const u = JSON.parse(raw);
        return {
            ...u,
            authenticated: true,
            role: u.is_staff || u.role === 'admin' ? "admin" : "operator"
        };
    } catch {
        return { name: "Guest Operator", username: "guest", role: "guest", is_staff: false, authenticated: false };
    }
}

function setCurrentUser(user) {
    localStorage.setItem('smart_embroidery_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
}

function clearUser() {
    localStorage.removeItem('smart_embroidery_user');
    localStorage.removeItem('user');
}

// 2. Format Helpers
function formatNumber(num) {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getCurrentShift() {
    const hour = new Date().getHours();
    return (hour >= 9 && hour < 21) ? "DAY" : "NIGHT";
}

// 3. Global Toast Banner
function showNotification(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; top: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px;";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    let borderColor = '#1b4332';
    let icon = '✔';
    if (type === 'warning') {
        borderColor = '#f59e0b';
        icon = '🔒';
    } else if (type === 'error') {
        borderColor = '#ef4444';
        icon = '⚠';
    }

    toast.style.cssText = `
        background: #ffffff;
        color: #17211d;
        padding: 12px 18px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 600;
        box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        border: 1px solid #e7ece8;
        border-left: 5px solid ${borderColor};
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateY(-10px);
        opacity: 0;
        font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    toast.innerHTML = `<span style="font-size: 15px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1";
    });

    setTimeout(() => {
        toast.style.transform = "translateY(-10px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 4. Universal Live Clock & Topbar Sync Across ALL Pages
function initSharedHeader() {
    function updateClock() {
        const now = new Date();
        const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

        const dateStr = now.toLocaleDateString('en-GB', dateOptions);
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);

        document.querySelectorAll('#live-date-label, .live-date-label').forEach(el => el.textContent = dateStr);
        document.querySelectorAll('#live-time-label, .live-time-label').forEach(el => el.textContent = timeStr);

        const hour = now.getHours();
        const isDayShift = hour >= 9 && hour < 21;
        document.querySelectorAll('#topbar-shift-title, .topbar-shift-title').forEach(el => el.textContent = isDayShift ? "Day Shift" : "Night Shift");
        document.querySelectorAll('#topbar-shift-hours, .topbar-shift-hours').forEach(el => el.textContent = isDayShift ? "9:00 AM – 9:00 PM" : "9:00 PM – 9:00 AM");
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Sync Auth Display on All Pages
    syncUserAvatars();

    // Universal Sidebar Toggle
    initUniversalSidebar();
}

function syncUserAvatars() {
    const user = getCurrentUser();
    const isAdmin = user.is_staff || user.role === 'admin';
    const isAuth = user.authenticated;

    const displayName = isAuth ? (isAdmin ? "Admin" : (user.name || user.username)) : "Sign In";
    const displayRole = isAuth ? (isAdmin ? "Administrator" : "Shift Operator") : "Guest Access";
    const initial = isAuth ? (isAdmin ? "A" : (displayName.charAt(0).toUpperCase() || "O")) : "G";
    const roleClass = isAuth ? (isAdmin ? "admin" : "operator") : "guest";

    document.querySelectorAll('#topbar-user-name, .topbar-user-name').forEach(el => el.textContent = displayName);
    document.querySelectorAll('#topbar-user-role, .topbar-user-role').forEach(el => el.textContent = displayRole);
    document.querySelectorAll('#sidebar-user-name, .sidebar-user-name').forEach(el => el.textContent = displayName);
    document.querySelectorAll('#sidebar-user-role, .sidebar-user-role').forEach(el => el.textContent = displayRole);

    document.querySelectorAll('#topbar-user-avatar, #sidebar-user-avatar, .user-initials-circle').forEach(el => {
        el.textContent = initial;
        el.className = `user-initials-circle ${roleClass}`;
    });
}

function initUniversalSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const viewport = document.getElementById('main-viewport');
    const collapseTrigger = document.getElementById('sidebar-collapse-trigger');
    const navbarToggle = document.getElementById('sidebar-toggle-navbar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar) return;

    function collapseSidebarDesktop() {
        sidebar.classList.add('collapsed');
        if (viewport) viewport.classList.add('expanded');
        document.body.classList.add('sidebar-collapsed');
        try {
            localStorage.setItem('smart_embroidery_sidebar_collapsed', 'true');
        } catch (e) {}
    }

    function expandSidebarDesktop() {
        sidebar.classList.remove('collapsed');
        if (viewport) viewport.classList.remove('expanded');
        document.body.classList.remove('sidebar-collapsed');
        try {
            localStorage.setItem('smart_embroidery_sidebar_collapsed', 'false');
        } catch (e) {}
    }

    // Apply saved desktop state from localStorage on page load
    try {
        const isSavedCollapsed = localStorage.getItem('smart_embroidery_sidebar_collapsed') === 'true';
        if (window.innerWidth > 1024 && isSavedCollapsed) {
            collapseSidebarDesktop();
        }
    } catch (e) {}

    // 1. Collapse Trigger (Inside Sidebar next to ZJI Fashions Brand)
    if (collapseTrigger) {
        collapseTrigger.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            } else {
                collapseSidebarDesktop();
            }
        };
    }

    // 2. Expand / Unfold Trigger (In Navbar next to Search; visible ONLY when sidebar is collapsed)
    if (navbarToggle) {
        navbarToggle.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth <= 1024) {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('active');
            } else {
                expandSidebarDesktop();
            }
        };
    }

    // 3. Mobile Backdrop Overlay
    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        };
    }

    // 4. Responsive Resize Listener
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            if (overlay) overlay.classList.remove('active');
            sidebar.classList.remove('open');
            try {
                const isSavedCollapsed = localStorage.getItem('smart_embroidery_sidebar_collapsed') === 'true';
                if (isSavedCollapsed) {
                    collapseSidebarDesktop();
                } else {
                    expandSidebarDesktop();
                }
            } catch (e) {}
        } else {
            sidebar.classList.remove('collapsed');
            if (viewport) viewport.classList.remove('expanded');
            document.body.classList.remove('sidebar-collapsed');
        }
    });
}

// Auto-run shared header initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initSharedHeader();
});
