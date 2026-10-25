// ZJI Fashions - 12-Hour Shift Production Fleet Controller
// Manages multi-item runs, rounds, stitches, and automatic mirror calculation across 6 machines

const FLEET_MACHINES = [
    { number: 1, name: "Machine 01", heads: 18, color: "Blue 12-Head Standard" },
    { number: 2, name: "Machine 02", heads: 18, color: "Green Multi-Head" },
    { number: 3, name: "Machine 03", heads: 24, color: "Worlden Heavy Multi-Head" },
    { number: 4, name: "Machine 04", heads: 24, color: "White High-Speed A" },
    { number: 5, name: "Machine 05", heads: 24, color: "White High-Speed B" },
    { number: 6, name: "Machine 06", heads: 20, color: "Jinyu Precision 10-Head" }
];

// 7 Official Embroidery Item Types from Database Check Constraint
const ITEM_TYPES = [
    { code: "FRONT", label: "Front" },
    { code: "BACK", label: "Back" },
    { code: "TUK", label: "Tuk" },
    { code: "ASTEEN", label: "Asteen" },
    { code: "DUPATTA", label: "Dupatta" },
    { code: "POCKET", label: "Pocket" },
    { code: "SHALWAR", label: "Shalwar" }
];

// In-Memory Fleet Shift Production State (Preserved across machine tab switching)
const fleetProductionState = {};

FLEET_MACHINES.forEach(m => {
    fleetProductionState[m.number] = {
        number: m.number,
        heads: m.heads,
        operator: "Ali Raza",
        notes: "",
        logged: false,
        runs: []
    };
});

// Seed default initial factory runs matching user scenario for immediate realistic preview
fleetProductionState[1].logged = true;
fleetProductionState[1].runs = [
    { id: 101, designCode: "SH-70", partType: "TUK", rounds: 2, stitchesPerRound: 25000, mirrorsPerHead: 16 },
    { id: 102, designCode: "SH-71", partType: "FRONT", rounds: 1, stitchesPerRound: 42000, mirrorsPerHead: 12 }
];

fleetProductionState[2].logged = true;
fleetProductionState[2].runs = [
    { id: 201, designCode: "AB-101", partType: "DUPATTA", rounds: 2, stitchesPerRound: 38000, mirrorsPerHead: 0 }
];

let activeMachineNumber = 1;
let runIdCounter = 300;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set default production date to today
    const dateInput = document.getElementById('shift-global-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // 2. Auto-detect Shift Cycle (Day vs Night)
    const shiftSelect = document.getElementById('shift-global-type');
    if (shiftSelect && typeof getCurrentShift === 'function') {
        shiftSelect.value = getCurrentShift();
    }

    // 2b. Populate Design Code Suggestions from Custom Registered Designs
    try {
        const stored = localStorage.getItem('smart_embroidery_design_codes');
        if (stored) {
            const codes = JSON.parse(stored);
            const datalist = document.getElementById('design-code-suggestions');
            if (datalist && Array.isArray(codes)) {
                codes.forEach(code => {
                    if (!datalist.querySelector(`option[value="${code}"]`)) {
                        const opt = document.createElement('option');
                        opt.value = code;
                        opt.textContent = `${code} (Registered Custom Design)`;
                        datalist.appendChild(opt);
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Could not load custom designs for datalist', e);
    }

    // 3. Render initial Machine 1 view
    selectMachineTab(1);
    updateFleetTotals();
});

// Switch active machine tab
function selectMachineTab(machineNumber) {
    activeMachineNumber = machineNumber;
    const machine = FLEET_MACHINES.find(m => m.number === machineNumber);
    if (!machine) return;

    // Update Tab UI
    document.querySelectorAll('.fleet-tab-btn').forEach(btn => {
        const num = Number(btn.getAttribute('data-machine-id'));
        btn.classList.toggle('active', num === machineNumber);
    });

    // Update Workstation Headings
    const heading = document.getElementById('current-machine-heading');
    const sub = document.getElementById('current-machine-sub');
    const pill = document.getElementById('current-machine-heads-pill');
    const addLabel = document.getElementById('add-btn-machine-label');

    if (heading) heading.textContent = `${machine.name} Production Runs`;
    if (sub) sub.textContent = `Active Capacity: ${machine.heads} Heads (${machine.color}) • Multi-Item Logging`;
    if (pill) pill.textContent = `${machine.heads} Heads Active`;
    if (addLabel) addLabel.textContent = machine.number < 10 ? `0${machine.number}` : machine.number;

    // Update Operator & Notes
    const state = fleetProductionState[machineNumber];
    const opInput = document.getElementById('machine-operator-input');
    const notesInput = document.getElementById('machine-notes-input');
    if (opInput) opInput.value = state.operator || "Ali Raza";
    if (notesInput) notesInput.value = state.notes || "";

    // Render Run Rows
    renderItemRuns(machineNumber);
    updateMachineSubtotal(machineNumber);
}

// Render dynamic item run rows for active machine
function renderItemRuns(machineNumber) {
    const container = document.getElementById('item-runs-container');
    if (!container) return;

    const machine = FLEET_MACHINES.find(m => m.number === machineNumber);
    const state = fleetProductionState[machineNumber];
    container.innerHTML = '';

    if (!state.runs || state.runs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 28px; background: #fafbf9; border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-muted); font-size: 13px;">
                No item runs logged yet for ${machine.name} on this shift.<br>
                Click <strong>"➕ Add Another Item Run"</strong> below to record a production run.
            </div>
        `;
        return;
    }

    state.runs.forEach((run, index) => {
        const row = document.createElement('div');
        row.className = 'item-run-card';
        row.id = `run-row-${run.id}`;

        const totalStitches = (run.rounds || 0) * (run.stitchesPerRound || 0);
        const totalMirrors = (run.rounds || 0) * (run.mirrorsPerHead || 0) * machine.heads;

        // Build Item Type Options
        const itemOptionsHtml = ITEM_TYPES.map(it => 
            `<option value="${it.code}" ${run.partType === it.code ? 'selected' : ''}>${it.label}</option>`
        ).join('');

        row.innerHTML = `
            <div>
                <span class="run-cell-label">Design Code</span>
                <input type="text" class="form-control" list="design-code-suggestions" 
                       value="${run.designCode || ''}" placeholder="e.g. SH-70"
                       oninput="updateRunField(${run.id}, 'designCode', this.value)" required>
            </div>

            <div>
                <span class="run-cell-label">Item / Part Type (7 Items)</span>
                <select class="form-control" onchange="updateRunField(${run.id}, 'partType', this.value)">
                    ${itemOptionsHtml}
                </select>
            </div>

            <div>
                <span class="run-cell-label">Rounds</span>
                <input type="number" class="form-control" min="1" max="20" 
                       value="${run.rounds || 1}" 
                       oninput="updateRunField(${run.id}, 'rounds', this.value)">
            </div>

            <div>
                <span class="run-cell-label">Stitches / Round</span>
                <input type="number" class="form-control" min="0" step="500" 
                       value="${run.stitchesPerRound || 0}" 
                       oninput="updateRunField(${run.id}, 'stitchesPerRound', this.value)">
            </div>

            <div>
                <span class="run-cell-label">Mirrors / Head</span>
                <input type="number" class="form-control" min="0" 
                       value="${run.mirrorsPerHead || 0}" 
                       oninput="updateRunField(${run.id}, 'mirrorsPerHead', this.value)">
            </div>

            <div class="run-calc-badge">
                <span class="calc-st" id="calc-st-${run.id}">${totalStitches.toLocaleString()} st</span>
                <span class="calc-mir" id="calc-mir-${run.id}">🪞 ${totalMirrors.toLocaleString()} Mirrors</span>
            </div>

            <button type="button" class="btn-remove-run" title="Remove this Item Run" onclick="removeItemRunRow(${run.id})">
                ✕
            </button>
        `;

        container.appendChild(row);
    });
}

// Add a new blank item run to the active machine
function addNewItemRunRow() {
    const state = fleetProductionState[activeMachineNumber];
    runIdCounter++;

    const newRun = {
        id: runIdCounter,
        designCode: "SH-70",
        partType: "TUK",
        rounds: 1,
        stitchesPerRound: 35000,
        mirrorsPerHead: 12
    };

    state.runs.push(newRun);
    state.logged = true;

    renderItemRuns(activeMachineNumber);
    updateMachineSubtotal(activeMachineNumber);
    updateFleetTotals();
    updateTabBadge(activeMachineNumber);
}

// Remove an item run row
function removeItemRunRow(runId) {
    const state = fleetProductionState[activeMachineNumber];
    state.runs = state.runs.filter(r => r.id !== runId);
    if (state.runs.length === 0) {
        state.logged = false;
    }

    renderItemRuns(activeMachineNumber);
    updateMachineSubtotal(activeMachineNumber);
    updateFleetTotals();
    updateTabBadge(activeMachineNumber);
}

// Update specific field in real-time as user types
function updateRunField(runId, field, value) {
    const state = fleetProductionState[activeMachineNumber];
    const machine = FLEET_MACHINES.find(m => m.number === activeMachineNumber);
    const run = state.runs.find(r => r.id === runId);
    if (!run) return;

    if (field === 'rounds' || field === 'stitchesPerRound' || field === 'mirrorsPerHead') {
        run[field] = Number(value) || 0;
    } else {
        run[field] = value;
    }

    // Real-time calculation for this row
    const totalStitches = (run.rounds || 0) * (run.stitchesPerRound || 0);
    const totalMirrors = (run.rounds || 0) * (run.mirrorsPerHead || 0) * machine.heads;

    const stBadge = document.getElementById(`calc-st-${run.id}`);
    const mirBadge = document.getElementById(`calc-mir-${run.id}`);
    if (stBadge) stBadge.textContent = `${totalStitches.toLocaleString()} st`;
    if (mirBadge) mirBadge.textContent = `🪞 ${totalMirrors.toLocaleString()} Mirrors`;

    state.logged = state.runs.length > 0;
    updateMachineSubtotal(activeMachineNumber);
    updateFleetTotals();
    updateTabBadge(activeMachineNumber);
}

// Update Machine Subtotal Bar
function updateMachineSubtotal(machineNumber) {
    const machine = FLEET_MACHINES.find(m => m.number === machineNumber);
    const state = fleetProductionState[machineNumber];

    let totalStitches = 0;
    let totalMirrors = 0;

    state.runs.forEach(r => {
        totalStitches += (r.rounds || 0) * (r.stitchesPerRound || 0);
        totalMirrors += (r.rounds || 0) * (r.mirrorsPerHead || 0) * machine.heads;
    });

    const stEl = document.getElementById('machine-subtotal-stitches');
    const mirEl = document.getElementById('machine-subtotal-mirrors');
    const runsEl = document.getElementById('machine-subtotal-runs');

    if (stEl) stEl.textContent = `${totalStitches.toLocaleString()} st`;
    if (mirEl) mirEl.textContent = `${totalMirrors.toLocaleString()} Mirrors`;
    if (runsEl) runsEl.textContent = `${state.runs.length} Item${state.runs.length === 1 ? '' : 's'}`;
}

// Update Tab Badge status
function updateTabBadge(machineNumber) {
    const state = fleetProductionState[machineNumber];
    const badge = document.getElementById(`tab-status-${machineNumber}`);
    if (!badge) return;

    if (state.logged && state.runs.length > 0) {
        badge.className = 'fleet-tab-status logged';
        badge.innerHTML = `✓ ${state.runs.length} Item${state.runs.length === 1 ? '' : 's'}`;
    } else {
        badge.className = 'fleet-tab-status';
        badge.innerHTML = `● Pending`;
    }
}

// Update Shift Fleet Totals across all 6 Machines
function updateFleetTotals() {
    let grandStitches = 0;
    let grandMirrors = 0;
    let loggedCount = 0;

    FLEET_MACHINES.forEach(m => {
        const state = fleetProductionState[m.number];
        if (state.logged && state.runs.length > 0) {
            loggedCount++;
            state.runs.forEach(r => {
                grandStitches += (r.rounds || 0) * (r.stitchesPerRound || 0);
                grandMirrors += (r.rounds || 0) * (r.mirrorsPerHead || 0) * m.heads;
            });
        }
        updateTabBadge(m.number);
    });

    const stEl = document.getElementById('fleet-total-stitches');
    const mirEl = document.getElementById('fleet-total-mirrors');
    const countEl = document.getElementById('fleet-logged-count');

    if (stEl) stEl.textContent = `${grandStitches.toLocaleString()} st`;
    if (mirEl) mirEl.textContent = `${grandMirrors.toLocaleString()}`;
    if (countEl) countEl.textContent = `${loggedCount} of 6 Logged`;
}

// Save active machine and move forward to next machine (One-by-one flow)
function saveCurrentMachineLogAndNext() {
    const state = fleetProductionState[activeMachineNumber];
    const opInput = document.getElementById('machine-operator-input');
    const notesInput = document.getElementById('machine-notes-input');
    if (opInput) state.operator = opInput.value;
    if (notesInput) state.notes = notesInput.value;

    if (state.runs.length === 0) {
        showNotification(`Machine 0${activeMachineNumber} has no runs added yet. You can add items or skip.`, 'warning');
    } else {
        state.logged = true;
        showNotification(`Machine 0${activeMachineNumber} Production Saved (${state.runs.length} Items)`, 'success');
    }

    updateTabBadge(activeMachineNumber);
    updateFleetTotals();

    // Advance to next machine (1 -> 2 -> ... -> 6)
    const nextMachine = activeMachineNumber < 6 ? activeMachineNumber + 1 : 1;
    selectMachineTab(nextMachine);
}

// Commit complete 12-hour shift log across all 6 machines
async function commitFullShiftToDatabase() {
    const shiftDate = document.getElementById('shift-global-date').value;
    const shiftType = document.getElementById('shift-global-type').value;
    const supervisor = document.getElementById('shift-supervisor-name').value;

    let totalRuns = 0;
    FLEET_MACHINES.forEach(m => {
        totalRuns += fleetProductionState[m.number].runs.length;
    });

    if (totalRuns === 0) {
        showNotification('Please log at least one item run before committing the shift.', 'warning');
        return;
    }

    // Prepare complete payload for SQL Server / Django APIs
    const payload = {
        shiftDate: shiftDate,
        shiftType: shiftType,
        supervisor: supervisor,
        machines: fleetProductionState
    };

    console.log("Committing Complete 12-Hour Shift Payload:", payload);

    // Save to localStorage so Reports and Dashboard immediately reflect the new shift logs
    try {
        localStorage.setItem('latest_shift_production', JSON.stringify(payload));
    } catch (e) {
        console.error(e);
    }

    showNotification(`12-Hour ${shiftType} Shift successfully committed to Production Ledger!`, 'success');

    setTimeout(() => {
        window.location.href = 'reports.html';
    }, 1200);
}
