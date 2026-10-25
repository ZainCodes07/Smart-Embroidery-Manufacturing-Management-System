// Machines Fleet Controller
document.addEventListener('DOMContentLoaded', () => {
    loadMachinesList();
});

async function loadMachinesList() {
    const container = document.getElementById('machines-full-grid');
    try {
        const res = await fetch(`${API_BASE_URL}/production/machines/`);
        const data = await res.json();
        const machines = data.results || data;

        container.innerHTML = '';
        machines.forEach(m => {
            const card = document.createElement('div');
            card.className = 'machine-pod-card';

            let needleDotsHtml = '';
            for (let i = 0; i < m.headcount; i++) {
                needleDotsHtml += '<span class="needle-dot" title="Head #' + (i + 1) + '"></span>';
            }

            card.innerHTML = `
                <div class="pod-card-header">
                    <div class="pod-identity">
                        <div class="machine-illustration-box">
                            ⚙️
                        </div>
                        <div class="pod-names">
                            <h3>${m.machinename || 'Machine ' + m.machinenumber}</h3>
                            <p>Unit #${m.machinenumber} • ${m.headcount} Heads</p>
                        </div>
                    </div>
                    <span class="status-badge-pill badge-online">
                        <span class="shift-dot-beacon" style="width: 7px; height: 7px;"></span> Active
                    </span>
                </div>

                <div class="heads-visual-container">
                    <div class="heads-meta">
                        <span>Head Synchronization (${m.headcount} Heads)</span>
                        <span style="color: var(--accent-blue);">Ready</span>
                    </div>
                    <div class="heads-needle-row">
                        ${needleDotsHtml}
                    </div>
                </div>

                <div class="pod-details-grid">
                    <div class="pod-metric-item">
                        <span>Total Heads</span>
                        <strong style="color: var(--accent-blue);">${m.headcount} Heads</strong>
                    </div>
                    <div class="pod-metric-item">
                        <span>Shift Multiplier</span>
                        <strong>1 × ${m.headcount}</strong>
                    </div>
                    <div class="pod-metric-item">
                        <span>Cycle Duration</span>
                        <strong>12-Hour Dual</strong>
                    </div>
                    <div class="pod-metric-item">
                        <span>Health Rating</span>
                        <strong style="color: var(--accent-emerald);">99.2%</strong>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 18px;">
                    <a href="production.html?machine=${m.machineid}" class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 12px; padding: 10px;">
                        Log Shift ➔
                    </a>
                    <a href="reports.html?machine=${m.machinenumber}" class="btn btn-secondary" style="font-size: 12px; padding: 10px;">
                        Audit
                    </a>
                </div>
            `;

            // Mouse 3D tilt
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0)';
            });

            container.appendChild(card);
        });
    } catch (err) {
        console.warn('Backend API offline, loading default 6-machine fleet:', err);
        const defaultMachines = [
            { machineid: 1, machinenumber: 1, machinename: "Machine 01 (Blue)", headcount: 18 },
            { machineid: 2, machinenumber: 2, machinename: "Machine 02 (Green Multi-Head)", headcount: 18 },
            { machineid: 3, machinenumber: 3, machinename: "Machine 03 (Worlden Heavy-Duty)", headcount: 24 },
            { machineid: 4, machinenumber: 4, machinename: "Machine 04 (White High-Speed A)", headcount: 24 },
            { machineid: 5, machinenumber: 5, machinename: "Machine 05 (White High-Speed B)", headcount: 24 },
            { machineid: 6, machinenumber: 6, machinename: "Machine 06 (Jinyu Precision)", headcount: 20 }
        ];
        container.innerHTML = '';
        defaultMachines.forEach(m => {
            const card = document.createElement('div');
            card.className = 'machine-pod-card';
            let needleDotsHtml = '';
            for (let i = 0; i < m.headcount; i++) {
                needleDotsHtml += '<span class="needle-dot" title="Head #' + (i + 1) + '"></span>';
            }
            card.innerHTML = `
                <div class="pod-card-header">
                    <div class="pod-identity">
                        <div class="machine-illustration-box">⚙️</div>
                        <div class="pod-names">
                            <h3>${m.machinename}</h3>
                            <p>Unit #${m.machinenumber} • ${m.headcount} Heads</p>
                        </div>
                    </div>
                    <span class="status-badge-pill badge-online">
                        <span class="shift-dot-beacon" style="width: 7px; height: 7px;"></span> Active
                    </span>
                </div>
                <div class="heads-visual-container">
                    <div class="heads-meta">
                        <span>Head Synchronization (${m.headcount} Heads)</span>
                        <span style="color: var(--brand-forest); font-weight: 600;">Ready</span>
                    </div>
                    <div class="heads-needle-row">${needleDotsHtml}</div>
                </div>
                <div class="pod-details-grid">
                    <div class="pod-metric-item"><span>Total Heads</span><strong style="color: var(--brand-forest);">${m.headcount} Heads</strong></div>
                    <div class="pod-metric-item"><span>Shift Multiplier</span><strong>1 × ${m.headcount}</strong></div>
                    <div class="pod-metric-item"><span>Cycle Duration</span><strong>12-Hour Dual</strong></div>
                    <div class="pod-metric-item"><span>Health Rating</span><strong style="color: #16a34a;">99.2%</strong></div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 18px;">
                    <a href="production.html?machine=${m.machineid}" class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 12px; padding: 10px;">Log Shift ➔</a>
                    <a href="reports.html?machine=${m.machinenumber}" class="btn btn-secondary" style="font-size: 12px; padding: 10px;">Audit</a>
                </div>
            `;
            container.appendChild(card);
        });
    }
}
