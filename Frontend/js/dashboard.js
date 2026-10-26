/**
 * ZJI Fashions - Smart Embroidery Management System
 * Dashboard Controller: Telemetry, Dual Animated Gauges, Chart.js & Auth Interceptor
 */

let productionChartInstance = null;
let currentActiveMachine = null;

// Telemetry Machine Data matching the authentic layout
const machinesData = {
    1: {
        id: 1,
        title: "Machine 01",
        heads: 18,
        status: "Running",
        design: "SH-70",
        part: 3,
        progress: 68,
        produced: 450,
        target: 600,
        stitches: "45,280",
        rpm: 850,
        eff: 94,
        img: "assets/images/embroidery-machine-1-blue-12-head.png",
        thread: "18 Cones (Poly Silk #40)",
        fusing: "24 Meters (Tearaway)",
        needles: "3 Replaced",
        zari: "2 Cones (Metallic Gold)"
    },
    2: {
        id: 2,
        title: "Machine 02",
        heads: 18,
        status: "Running",
        design: "AB-101",
        part: 5,
        progress: 52,
        produced: 320,
        target: 500,
        stitches: "38,120",
        rpm: 820,
        eff: 89,
        img: "assets/images/embroidery-machine-2-green-multi-head.png",
        thread: "16 Cones (Poly Silk #40)",
        fusing: "20 Meters (Tearaway)",
        needles: "2 Replaced",
        zari: "1 Cone (Silver Zari)"
    },
    3: {
        id: 3,
        title: "Machine 03",
        heads: 24,
        status: "Idle",
        design: "D-101",
        part: 2,
        progress: 0,
        produced: 0,
        target: 600,
        stitches: "0",
        rpm: 0,
        eff: 0,
        img: "assets/images/embroidery-machine-3-worlden-multi-head.png",
        thread: "0 Cones (Standby)",
        fusing: "0 Meters",
        needles: "0 Replaced",
        zari: "0 Cones"
    },
    4: {
        id: 4,
        title: "Machine 04",
        heads: 24,
        status: "Running",
        design: "SH-70",
        part: 4,
        progress: 73,
        produced: 680,
        target: 800,
        stitches: "58,400",
        rpm: 890,
        eff: 96,
        img: "assets/images/embroidery-machine-4-white-12-head-a.png",
        thread: "24 Cones (Poly Silk #40)",
        fusing: "32 Meters (Tearaway)",
        needles: "4 Replaced",
        zari: "3 Cones (Metallic Gold)"
    },
    5: {
        id: 5,
        title: "Machine 05",
        heads: 24,
        status: "Setup",
        design: "AB-101",
        part: 1,
        progress: 21,
        produced: 105,
        target: 500,
        stitches: "12,300",
        rpm: 450,
        eff: 65,
        img: "assets/images/embroidery-machine-5-white-12-head-b.png",
        thread: "12 Cones (Setup Bobbin)",
        fusing: "10 Meters",
        needles: "1 Replaced",
        zari: "0 Cones"
    },
    6: {
        id: 6,
        title: "Machine 06",
        heads: 20,
        status: "Running",
        design: "D-101",
        part: 6,
        progress: 64,
        produced: 290,
        target: 400,
        stitches: "41,900",
        rpm: 830,
        eff: 91,
        img: "assets/images/embroidery-machine-6-jinyu-10-head.png",
        thread: "20 Cones (Poly Silk #40)",
        fusing: "22 Meters (Tearaway)",
        needles: "2 Replaced",
        zari: "1 Cone (Copper Zari)"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLiveDateTime();
    // Universal sidebar collapse and navbar toggle are handled by config.js
    initAuthSystem();
    initProductionChart();
    initMachineInspectHandlers();
    tryFetchBackendStats();
});

/* =========================================================
   1. Live Date & Time Tracker
   ========================================================= */
function initLiveDateTime() {
    function updateClock() {
        const now = new Date();
        const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

        const dateStr = now.toLocaleDateString('en-GB', dateOptions);
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);

        const dateEl = document.getElementById('live-date-label');
        const timeEl = document.getElementById('live-time-label');

        if (dateEl) dateEl.textContent = dateStr;
        if (timeEl) timeEl.textContent = timeStr;

        // Shift determination (9:00 AM to 9:00 PM)
        const hour = now.getHours();
        const isDayShift = hour >= 9 && hour < 21;
        const shiftTitle = document.getElementById('topbar-shift-title');
        const shiftHours = document.getElementById('topbar-shift-hours');
        const kpiShiftVal = document.getElementById('kpi-current-shift');
        const kpiShiftTimes = document.getElementById('kpi-shift-times');

        if (shiftTitle) shiftTitle.textContent = isDayShift ? "Day Shift" : "Night Shift";
        if (shiftHours) shiftHours.textContent = isDayShift ? "9:00 AM – 9:00 PM" : "9:00 PM – 9:00 AM";
        if (kpiShiftVal) kpiShiftVal.textContent = isDayShift ? "Day Shift" : "Night Shift";
        if (kpiShiftTimes) kpiShiftTimes.textContent = isDayShift ? "9:00 AM – 9:00 PM" : "9:00 PM – 9:00 AM";

        // Dynamic greeting
        const greetingEl = document.getElementById('greeting-title');
        if (greetingEl) {
            let greeting = "Good Afternoon, Admin! 👋";
            if (hour < 12) greeting = "Good Morning, Admin! ☕";
            else if (hour >= 18) greeting = "Good Evening, Admin! 🌙";
            greetingEl.textContent = greeting;
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* =========================================================
   2. Sidebar Collapse & Toggle (Delegated to config.js)
   ========================================================= */
function initSidebarToggle() {
    // Delegated to universal initUniversalSidebar in config.js
}

/* =========================================================
   3. Auth Interceptor & Sign-In / Register Modal
   (User requirement: Dashboard is visible, but unauthenticated clicks trigger Login popup)
   ========================================================= */
function initAuthSystem() {
    const authModal = document.getElementById('auth-modal');
    const authCloseBtn = document.getElementById('auth-modal-close');
    const userProfileModal = document.getElementById('user-profile-modal');
    const profileCloseBtn = document.getElementById('profile-modal-close');
    const topbarUserPill = document.getElementById('topbar-user-pill');
    const sidebarUserPill = document.getElementById('sidebar-user-pill');
    const signinForm = document.getElementById('auth-signin-form');
    const quickAdminBtn = document.getElementById('quick-demo-admin');
    const quickOperatorBtn = document.getElementById('quick-demo-operator');
    const logoutBtn = document.getElementById('logout-btn');
    const tabSigninBtn = document.getElementById('tab-signin-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');

    // Update UI based on initial auth state
    updateAuthDisplay();

    // Open Profile / Auth Modal on User Pill click
    function handleUserPillClick(e) {
        e.stopPropagation();
        const user = getCurrentUser();
        if (user.authenticated) {
            userProfileModal.classList.add('active');
        } else {
            authModal.classList.add('active');
        }
    }

    if (topbarUserPill) topbarUserPill.addEventListener('click', handleUserPillClick);
    if (sidebarUserPill) sidebarUserPill.addEventListener('click', handleUserPillClick);

    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', () => authModal.classList.remove('active'));
    }

    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', () => userProfileModal.classList.remove('active'));
    }

    // Close on backdrop click
    [authModal, userProfileModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    });

    // Tab switcher
    if (tabSigninBtn && tabRegisterBtn) {
        tabSigninBtn.addEventListener('click', () => {
            tabSigninBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            document.getElementById('submit-signin-btn').textContent = "Sign In to Command Center";
        });
        tabRegisterBtn.addEventListener('click', () => {
            tabRegisterBtn.classList.add('active');
            tabSigninBtn.classList.remove('active');
            document.getElementById('submit-signin-btn').textContent = "Create Account & Access";
        });
    }

    // Submit Sign In
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('auth-username').value.trim() || "admin";
            const role = document.getElementById('auth-role').value;
            performLogin({
                username: username,
                name: username === 'admin' ? "Administrator" : username,
                is_staff: role === 'admin',
                role: role
            });
        });
    }

    // Quick 1-Click Demo Logins
    if (quickAdminBtn) {
        quickAdminBtn.addEventListener('click', () => {
            performLogin({
                username: "admin",
                name: "Administrator",
                is_staff: true,
                role: "admin"
            });
        });
    }

    if (quickOperatorBtn) {
        quickOperatorBtn.addEventListener('click', () => {
            performLogin({
                username: "operator_ali",
                name: "Ali Raza (Operator)",
                is_staff: false,
                role: "operator"
            });
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearUser();
            userProfileModal.classList.remove('active');
            updateAuthDisplay();
            showNotification("Signed out. You are now in Guest Preview mode.", "success");
        });
    }

    // Global Click Interceptor for Unauthenticated Users
    // Intercepts clicks on interactive elements and opens Login popup if not logged in
    document.addEventListener('click', (e) => {
        const user = getCurrentUser();
        if (user.authenticated) return; // Authenticated users have full interaction

        // Interactive targets that require login
        const interactiveTarget = e.target.closest(
            '.nav-item a, .metric-card, .machine-card-unit, .custom-table tr, .section-link-btn, .promo-cta-btn, .dropdown-pill-select, .notification-bell-btn, #view-all-machines-btn, #view-all-production-btn, #view-all-activity-btn'
        );

        // Don't intercept if clicking inside the auth modal itself or user pill
        const insideAuth = e.target.closest('#auth-modal, #user-profile-modal, #topbar-user-pill, #sidebar-user-pill, #sidebar-toggle-btn');

        if (interactiveTarget && !insideAuth) {
            e.preventDefault();
            e.stopPropagation();
            authModal.classList.add('active');
            showNotification("Please Sign In to access factory telemetry and controls.", "warning");
        }
    }, true);
}

function performLogin(userData) {
    setCurrentUser(userData);
    updateAuthDisplay();
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('active');
    showNotification(`Welcome back, ${userData.name}! Access Granted.`, "success");
}

function updateAuthDisplay() {
    const user = getCurrentUser();
    const topbarName = document.getElementById('topbar-user-name');
    const topbarRole = document.getElementById('topbar-user-role');
    const topbarAvatar = document.getElementById('topbar-user-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarRole = document.getElementById('sidebar-user-role');
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    const profileCardName = document.getElementById('profile-card-name');
    const profileCardRole = document.getElementById('profile-card-role');
    const profileCardAvatar = document.getElementById('profile-card-avatar');

    if (user.authenticated) {
        const isAdmin = user.is_staff || user.role === 'admin';
        const displayName = isAdmin ? "Admin" : (user.name || user.username);
        const displayRole = isAdmin ? "Administrator" : "Shift Operator";
        const initial = isAdmin ? "A" : (displayName.charAt(0).toUpperCase() || "O");
        const roleClass = isAdmin ? "admin" : "operator";

        if (topbarName) topbarName.textContent = displayName;
        if (topbarRole) topbarRole.textContent = displayRole;
        if (topbarAvatar) {
            topbarAvatar.textContent = initial;
            topbarAvatar.className = `user-initials-circle ${roleClass}`;
        }

        if (sidebarName) sidebarName.textContent = displayName;
        if (sidebarRole) sidebarRole.textContent = displayRole;
        if (sidebarAvatar) {
            sidebarAvatar.textContent = initial;
            sidebarAvatar.className = `user-initials-circle ${roleClass}`;
        }

        if (profileCardName) profileCardName.textContent = user.name || displayName;
        if (profileCardRole) profileCardRole.textContent = displayRole;
        if (profileCardAvatar) {
            profileCardAvatar.textContent = initial;
            profileCardAvatar.className = `user-initials-circle ${roleClass}`;
        }
    } else {
        if (topbarName) topbarName.textContent = "Sign In";
        if (topbarRole) topbarRole.textContent = "Guest Access";
        if (topbarAvatar) {
            topbarAvatar.textContent = "G";
            topbarAvatar.className = "user-initials-circle guest";
        }

        if (sidebarName) sidebarName.textContent = "Sign In";
        if (sidebarRole) sidebarRole.textContent = "Guest Access";
        if (sidebarAvatar) {
            sidebarAvatar.textContent = "G";
            sidebarAvatar.className = "user-initials-circle guest";
        }
    }
}

/* =========================================================
   4. Production Analytics Chart (Chart.js Area Chart)
   Matches the reference image 1:1 with soft green fill & target line
   ========================================================= */
function initProductionChart() {
    const canvas = document.getElementById('productionAnalyticsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Create Soft Mint Gradient Fill for Actual Production
    const greenGradient = ctx.createLinearGradient(0, 0, 0, 160);
    greenGradient.addColorStop(0, 'rgba(22, 163, 74, 0.22)');
    greenGradient.addColorStop(1, 'rgba(22, 163, 74, 0.01)');

    const labels = ['23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct'];
    const actualData = [1900, 2600, 2200, 3100, 3050, 3700, 3850];
    const targetData = [1600, 2100, 2400, 2700, 2900, 3200, 3500];

    if (productionChartInstance) {
        productionChartInstance.destroy();
    }

    productionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual Production',
                    data: actualData,
                    borderColor: '#16a34a',
                    borderWidth: 2.2,
                    backgroundColor: greenGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#16a34a',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Target',
                    data: targetData,
                    borderColor: '#94a3b8',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Using custom HTML legend matching screenshot
                },
                tooltip: {
                    backgroundColor: '#1b4332',
                    titleColor: '#ffffff',
                    bodyColor: '#dcfce7',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString()} stitches`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#8b9a91',
                        font: {
                            size: 10,
                            family: 'Plus Jakarta Sans'
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 4000,
                    ticks: {
                        stepSize: 1000,
                        color: '#8b9a91',
                        font: {
                            size: 10,
                            family: 'Plus Jakarta Sans'
                        },
                        callback: function(value) {
                            if (value === 0) return '0';
                            return (value / 1000) + 'K';
                        }
                    },
                    grid: {
                        color: '#f0f4f1',
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/* =========================================================
   5. Interactive Machine Inspection & Dual Animated Gauges
   ========================================================= */
function initMachineInspectHandlers() {
    const modal = document.getElementById('machine-inspect-modal');
    const closeBtn = document.getElementById('inspect-modal-close');
    const machineCards = document.querySelectorAll('.machine-card-unit');

    machineCards.forEach(card => {
        card.addEventListener('click', () => {
            const user = getCurrentUser();
            if (!user.authenticated) return; // Let auth interceptor handle if guest

            const machineId = card.getAttribute('data-machine-id');
            const data = machinesData[machineId];
            if (data) {
                openMachineInspection(data);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

function openMachineInspection(data) {
    const modal = document.getElementById('machine-inspect-modal');
    currentActiveMachine = data;

    // Fill Modal Data
    document.getElementById('modal-machine-pill').textContent = data.title;
    document.getElementById('modal-machine-title').textContent = `${data.heads} Heads Multi-Head Telemetry`;
    document.getElementById('modal-machine-img').src = data.img;
    document.getElementById('modal-job-val').textContent = `${data.design} (Part ${data.part})`;

    const statusEl = document.getElementById('modal-status-val');
    statusEl.textContent = data.status;
    if (data.status === 'Running') {
        statusEl.style.color = 'var(--status-running)';
    } else if (data.status === 'Setup') {
        statusEl.style.color = 'var(--status-setup)';
    } else {
        statusEl.style.color = 'var(--status-idle)';
    }

    document.getElementById('modal-progress-val').textContent = `${data.progress}%`;
    document.getElementById('modal-stitches-val').textContent = data.stitches;
    document.getElementById('modal-target-val').textContent = `${data.produced} / ${data.target} pcs`;
    document.getElementById('modal-heads-val').textContent = `${data.heads} / ${data.heads} Online`;

    // Materials
    document.getElementById('mat-thread-val').textContent = data.thread;
    document.getElementById('mat-fusing-val').textContent = data.fusing;
    document.getElementById('mat-needles-val').textContent = data.needles;
    document.getElementById('mat-zari-val').textContent = data.zari;

    // Build Heads Matrix
    const matrixGrid = document.getElementById('heads-matrix-grid');
    matrixGrid.innerHTML = '';
    matrixGrid.style.gridTemplateColumns = `repeat(${Math.min(data.heads, 12)}, 1fr)`;

    for (let i = 1; i <= data.heads; i++) {
        const node = document.createElement('div');
        node.className = 'head-node';
        node.textContent = `H${i}`;
        node.title = `Head #${i} - 100% Needle Health`;
        matrixGrid.appendChild(node);
    }

    // Open Modal
    modal.classList.add('active');

    // Trigger Animated Gauge Meters
    animateGauges(data.rpm, data.eff);
}

function animateGauges(targetRpm, targetEff) {
    const rpmValEl = document.getElementById('modal-rpm-val');
    const effValEl = document.getElementById('modal-eff-val');
    const rpmNeedle = document.getElementById('rpm-needle');
    const effNeedle = document.getElementById('eff-needle');

    let start = null;
    const duration = 1000; // 1 second animation

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = easeOutCubic(progress);

        // Current Animated Values
        const currentRpm = Math.round(targetRpm * ease);
        const currentEff = Math.round(targetEff * ease);

        if (rpmValEl) rpmValEl.textContent = currentRpm;
        if (effValEl) effValEl.textContent = `${currentEff}%`;

        // Calculate Needle Angles (Arc spans from 180° to 0° across top half)
        // Angle: 180 (far left, 0 RPM) to 0 (far right, 1000 RPM)
        const rpmAngleDeg = 180 - (currentRpm / 1000) * 180;
        const rpmAngleRad = (rpmAngleDeg * Math.PI) / 180;
        const rpmX2 = 90 + 55 * Math.cos(rpmAngleRad);
        const rpmY2 = 95 - 55 * Math.sin(rpmAngleRad);

        if (rpmNeedle) {
            rpmNeedle.setAttribute('x2', rpmX2.toFixed(1));
            rpmNeedle.setAttribute('y2', rpmY2.toFixed(1));
        }

        // Efficiency Needle (180 to 0 for 0% to 100%)
        const effAngleDeg = 180 - (currentEff / 100) * 180;
        const effAngleRad = (effAngleDeg * Math.PI) / 180;
        const effX2 = 90 + 55 * Math.cos(effAngleRad);
        const effY2 = 95 - 55 * Math.sin(effAngleRad);

        if (effNeedle) {
            effNeedle.setAttribute('x2', effX2.toFixed(1));
            effNeedle.setAttribute('y2', effY2.toFixed(1));
        }

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/* =========================================================
   6. Optional Backend API Synchronizer
   ========================================================= */
async function tryFetchBackendStats() {
    try {
        const resp = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
            const data = await resp.json();
            console.log('Live Backend Dashboard Stats:', data);
            if (data.total_machines && document.getElementById('kpi-total-machines')) {
                document.getElementById('kpi-total-machines').textContent = data.total_machines;
            }
            if (data.total_stitches && document.getElementById('kpi-today-production')) {
                document.getElementById('kpi-today-production').textContent = Number(data.total_stitches).toLocaleString();
            }
        }
    } catch {
        // Backend offline or unreachable, authentic baseline mock values remain intact
    }
}
