// Inventory & Stock Controller
document.addEventListener('DOMContentLoaded', () => {
    initInventory();

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn-clean');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Material search filter
    const searchInput = document.getElementById('search-materials');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#materials-tbody tr');
            rows.forEach(r => {
                const text = r.textContent.toLowerCase();
                r.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // Inward Receipt Modal Handlers
    const receiptModal = document.getElementById('receipt-modal');
    document.getElementById('btn-new-receipt').addEventListener('click', () => {
        document.getElementById('receipt-date').valueAsDate = new Date();
        receiptModal.classList.add('active');
    });
    document.getElementById('receipt-modal-close').addEventListener('click', () => {
        receiptModal.classList.remove('active');
    });
    document.getElementById('receipt-cancel-btn').addEventListener('click', () => {
        receiptModal.classList.remove('active');
    });

    // Submit Receipt Form
    document.getElementById('receipt-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const receiptData = {
            receiptdate: document.getElementById('receipt-date').value,
            receipttype: document.getElementById('receipt-type').value,
            supplierid: document.getElementById('receipt-supplier').value || null,
            billnumber: document.getElementById('receipt-bill').value.trim(),
            notes: document.getElementById('receipt-notes').value.trim()
        };

        try {
            const res = await fetch(`${API_BASE_URL}/inventory/receipts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receiptData)
            });

            if (res.ok) {
                showNotification('Material receipt recorded in ledger!', 'success');
                receiptModal.classList.remove('active');
                loadReceipts();
            } else {
                const err = await res.json();
                showNotification(JSON.stringify(err), 'error');
            }
        } catch (error) {
            console.error('Failed to save receipt:', error);
            showNotification('Error connecting to backend server', 'error');
        }
    });
});

async function initInventory() {
    await loadMaterials();
    await loadSuppliers();
    await loadReceipts();
    await loadIssues();
}

async function loadMaterials() {
    const tbody = document.getElementById('materials-tbody');
    try {
        const res = await fetch(`${API_BASE_URL}/inventory/materials/`);
        const data = await res.json();
        const materials = data.results || data;

        tbody.innerHTML = '';
        materials.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-blue);">#${m.materialid}</strong></td>
                <td style="font-weight: 700; color: var(--text-primary);">${m.materialname}</td>
                <td><span style="color: var(--accent-amber); font-weight: 600;">${m.variant}</span></td>
                <td><span class="badge-cat cat-${m.category}">${m.category}</span></td>
                <td><strong style="font-family: 'JetBrains Mono';">${m.baseunit}</strong></td>
                <td><span class="status-badge-pill badge-online">In Stock</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="color: var(--accent-rose); text-align: center;">Could not load materials</td></tr>';
    }
}

async function loadSuppliers() {
    const tbody = document.getElementById('suppliers-tbody');
    const select = document.getElementById('receipt-supplier');
    try {
        const res = await fetch(`${API_BASE_URL}/inventory/suppliers/`);
        const data = await res.json();
        const suppliers = data.results || data;

        tbody.innerHTML = '';
        select.innerHTML = '<option value="">-- Select Supplier --</option>';

        suppliers.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-blue);">#${s.supplierid}</strong></td>
                <td style="font-weight: 700; color: var(--text-primary);">${s.suppliername}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.address || '-'}</td>
                <td><span class="status-badge-pill badge-online">Verified</span></td>
            `;
            tbody.appendChild(tr);

            const opt = document.createElement('option');
            opt.value = s.supplierid;
            opt.textContent = s.suppliername;
            select.appendChild(opt);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="color: var(--accent-rose); text-align: center;">Could not load suppliers</td></tr>';
    }
}

async function loadReceipts() {
    const tbody = document.getElementById('receipts-tbody');
    try {
        const res = await fetch(`${API_BASE_URL}/inventory/receipts/`);
        const data = await res.json();
        const receipts = data.results || data;

        if (receipts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No receipts logged yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        receipts.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-blue);">#${r.receiptid}</strong></td>
                <td>${formatDate(r.receiptdate)}</td>
                <td><span class="status-badge-pill" style="background: rgba(37, 99, 235, 0.1); color: var(--accent-blue);">${r.receipttype}</span></td>
                <td><strong>${r.supplier_name || 'N/A (Opening Stock)'}</strong></td>
                <td>${r.billnumber || '-'}</td>
                <td>${r.notes || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="color: var(--text-muted); text-align: center;">No receipts recorded</td></tr>';
    }
}

async function loadIssues() {
    const tbody = document.getElementById('issues-tbody');
    try {
        const res = await fetch(`${API_BASE_URL}/inventory/issues/`);
        const data = await res.json();
        const issues = data.results || data;

        if (issues.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No material issuance records logged yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        issues.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-blue);">#${i.issueid}</strong></td>
                <td>${formatDate(i.issuedate)}</td>
                <td><strong>Machine #${i.machine_number || i.machineid}</strong></td>
                <td>${i.issuetype}</td>
                <td>${i.notes || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="color: var(--text-muted); text-align: center;">No issues recorded</td></tr>';
    }
}
