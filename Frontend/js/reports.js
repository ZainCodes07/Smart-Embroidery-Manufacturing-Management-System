// Production Reports Controller
let allShifts = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadMachinesFilter();
    await loadReportsData();

    document.getElementById('apply-filter-btn').addEventListener('click', applyFilters);
    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });

    // Check URL params for pre-selected machine filter
    const urlParams = new URLSearchParams(window.location.search);
    const preMachine = urlParams.get('machine');
    if (preMachine) {
        document.getElementById('filter-machine').value = preMachine;
        applyFilters();
    }
});

async function loadMachinesFilter() {
    const select = document.getElementById('filter-machine');
    try {
        const res = await fetch(`${API_BASE_URL}/production/machines/`);
        const data = await res.json();
        const machines = data.results || data;

        machines.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.machinenumber;
            opt.textContent = `Machine #${m.machinenumber} (${m.headcount} Heads)`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.warn('Could not load machines filter dropdown:', err);
    }
}

async function loadReportsData() {
    try {
        const res = await fetch(`${API_BASE_URL}/production/shifts/`);
        const data = await res.json();
        allShifts = data.results || data;
        renderReportsTable(allShifts);
    } catch (err) {
        console.error('Failed to load reports:', err);
        document.getElementById('reports-tbody').innerHTML = '<tr><td colspan="7" style="color: var(--accent-rose); text-align: center;">Could not load report data from backend server.</td></tr>';
    }
}

function applyFilters() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const machineNum = document.getElementById('filter-machine').value;

    let filtered = allShifts;

    if (startDate) {
        filtered = filtered.filter(s => s.shiftdate >= startDate);
    }
    if (endDate) {
        filtered = filtered.filter(s => s.shiftdate <= endDate);
    }
    if (machineNum) {
        filtered = filtered.filter(s => (s.machine_number || s.machineid) == machineNum);
    }

    renderReportsTable(filtered);
    showNotification(`Filtered ${filtered.length} shift records`, 'success');
}

function renderReportsTable(shifts) {
    const tbody = document.getElementById('reports-tbody');
    let totalStitches = 0;
    let totalMirrors = 0;

    if (shifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No shift records match the selected filters.</td></tr>';
        document.getElementById('report-total-stitches').textContent = "0";
        document.getElementById('report-total-mirrors').textContent = "0";
        document.getElementById('report-total-shifts').textContent = "0";
        return;
    }

    tbody.innerHTML = '';
    shifts.forEach(s => {
        let shiftStitches = 0;
        let shiftMirrors = 0;
        if (s.details && s.details.length > 0) {
            shiftStitches = s.details.reduce((acc, d) => acc + Number(d.stitchcount || 0), 0);
            shiftMirrors = s.details.reduce((acc, d) => acc + Number(d.totalmirrors || 0), 0);
        }

        totalStitches += shiftStitches;
        totalMirrors += shiftMirrors;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: var(--accent-cyan);">#${s.productionshiftid}</strong></td>
            <td>Machine #${s.machine_number || s.machineid}</td>
            <td>${formatDate(s.shiftdate)}</td>
            <td>
                <span class="status-pill ${s.shifttype === 'DAY' ? 'status-standby' : 'status-running'}">
                    ${s.shifttype === 'DAY' ? '☀ DAY' : '☾ NIGHT'}
                </span>
            </td>
            <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${formatNumber(shiftStitches)}</td>
            <td style="font-family: 'JetBrains Mono'; color: var(--accent-emerald);">${formatNumber(shiftMirrors)}</td>
            <td style="color: var(--text-muted);">${s.notes || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('report-total-stitches').textContent = formatNumber(totalStitches);
    document.getElementById('report-total-mirrors').textContent = formatNumber(totalMirrors);
    document.getElementById('report-total-shifts').textContent = shifts.length;
}
