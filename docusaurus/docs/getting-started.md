<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>GA General Trading — Stock Management (v2)</title>
  <style>
    :root{--primary:#0b69ff;--muted:#6c757d;--card:#fff;--bg:#f4f6f9}
    *{box-sizing:border-box}
    body{font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:var(--bg); margin:0; padding:20px; color:#222}
    header{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1200px;margin:0 auto 18px}
    h1{font-size:20px;margin:0}
    .container{max-width:1200px;margin:0 auto;display:grid;gap:18px}
    .card{background:var(--card);padding:16px;border-radius:12px;box-shadow:0 6px 18px rgba(20,20,40,0.06)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
    label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
    input,select{width:100%;padding:8px;border:1px solid #e6e9ee;border-radius:8px}
    .actions{display:flex;gap:8px;flex-wrap:wrap}
    button{background:var(--primary);color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
    button.ghost{background:transparent;color:var(--primary);border:1px solid rgba(11,105,255,0.12)}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:8px;border-bottom:1px solid #eef2f6;text-align:left;font-size:13px}
    th{background:linear-gradient(90deg,var(--primary),#176cff);color:#fff;position:sticky;top:0}
    .summary{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}
    .badge{background:#f1f5ff;padding:8px;border-radius:8px;font-weight:600}
    .right{margin-left:auto}
    @media (max-width:760px){header{flex-direction:column;align-items:flex-start}table,thead,tbody,tr,th,td{display:block}th{display:none}td{border:none;padding:10px 0}td:before{content:attr(data-label);display:block;font-weight:600;margin-bottom:6px}}
    .small{font-size:12px;color:var(--muted)}
    .icon-btn{background:transparent;border:0;color:var(--primary);cursor:pointer;padding:6px}
    .muted{color:var(--muted)}
    .modal{position:fixed;inset:0;background:rgba(10,10,20,0.4);display:none;align-items:center;justify-content:center;padding:20px}
    .modal .panel{background:#fff;padding:16px;border-radius:10px;max-width:600px;width:100%}
    .flex{display:flex;gap:8px;align-items:center}
  </style>
</head>
<body>
  <header>
    <h1>GA General Trading — Stock Management (HTCD 90 & HBC 260)</h1>
    <div class="small">.</div>
  </header>

  <main class="container">

    <!-- HTCD 90 Section -->
    <section class="card" id="section-htcd">
      <h2>HTCD 90 — Verified Records</h2>
      <form id="form-htcd" onsubmit="event.preventDefault();addRecord('HTCD')">
        <div class="grid">
          <div>
            <label>Date</label>
            <input type="date" id="date-HTCD">
          </div>
          <div>
            <label>Type</label>
            <select id="type-HTCD">
              <option value="Stored">Stored</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>
          <div>
            <label>Region</label>
            <select id="region-HTCD">
              <option>Addis Ababa</option>
              <option>Oromia</option>
              <option>Amhara</option>
              <option>Tigray</option>
              <option>Sidama</option>
              <option>Somali</option>
              <option>Gambella</option>
              <option>Benishangul-Gumuz</option>
              <option>Harari</option>
              <option>South West</option>
            </select>
          </div>
          <div>
            <label>Zone</label>
            <input id="zone-HTCD" placeholder="Zone">
          </div>
          <div>
            <label>Quantity</label>
            <input id="qty-HTCD" type="number" min="1" value="1">
          </div>
          <div>
            <label>Driver Name</label>
            <input id="driver-HTCD" placeholder="Driver name (for dispatch)">
          </div>
          <div>
            <label>Plate Number</label>
            <input id="plate-HTCD" placeholder="Plate number (for dispatch)">
          </div>
        </div>
        <div style="margin-top:10px" class="actions">
          <button type="submit">Add Record</button>
          <button type="button" class="ghost" onclick="clearForm('HTCD')">Clear</button>
          <div class="right">
            <button type="button" onclick="exportCSV('HTCD')">Export CSV</button>
            <button type="button" onclick="printSection('HTCD')">Export PDF</button>
          </div>
        </div>
      </form>

      <div style="margin-top:12px">
        <table id="table-HTCD">
          <thead>
            <tr><th>Date</th><th>Type</th><th>Region</th><th>Zone</th><th>Qty</th><th>Driver</th><th>Plate</th><th>Actions</th></tr>
          </thead>
          <tbody></tbody>
        </table>

        <div class="summary">
          <div class="badge">Total Stored: <span id="stored-HTCD">0</span></div>
          <div class="badge">Total Dispatched: <span id="out-HTCD">0</span></div>
          <div class="badge">Balance: <span id="bal-HTCD">0</span></div>
        </div>
      </div>
    </section>

    <!-- HBC 260 Section -->
    <section class="card" id="section-hbc">
      <h2>HBC 260 — Verified Records</h2>
      <form id="form-HBC" onsubmit="event.preventDefault();addRecord('HBC')">
        <div class="grid">
          <div>
            <label>Date</label>
            <input type="date" id="date-HBC">
          </div>
          <div>
            <label>Type</label>
            <select id="type-HBC">
              <option value="Stored">Stored</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>
          <div>
            <label>Region</label>
            <select id="region-HBC">
              <option>Addis Ababa</option>
              <option>Oromia</option>
              <option>Amhara</option>
              <option>Tigray</option>
              <option>Sidama</option>
              <option>Somali</option>
              <option>Gambella</option>
              <option>Benishangul-Gumuz</option>
              <option>Harari</option>
              <option>South West</option>
            </select>
          </div>
          <div>
            <label>Zone</label>
            <input id="zone-HBC" placeholder="Zone">
          </div>
          <div>
            <label>Quantity</label>
            <input id="qty-HBC" type="number" min="1" value="1">
          </div>
          <div>
            <label>Driver Name</label>
            <input id="driver-HBC" placeholder="Driver name (for dispatch)">
          </div>
          <div>
            <label>Plate Number</label>
            <input id="plate-HBC" placeholder="Plate number (for dispatch)">
          </div>
        </div>
        <div style="margin-top:10px" class="actions">
          <button type="submit">Add Record</button>
          <button type="button" class="ghost" onclick="clearForm('HBC')">Clear</button>
          <div class="right">
            <button type="button" onclick="exportCSV('HBC')">Export CSV</button>
            <button type="button" onclick="printSection('HBC')">Export PDF</button>
          </div>
        </div>
      </form>

      <div style="margin-top:12px">
        <table id="table-HBC">
          <thead>
            <tr><th>Date</th><th>Type</th><th>Region</th><th>Zone</th><th>Qty</th><th>Driver</th><th>Plate</th><th>Actions</th></tr>
          </thead>
          <tbody></tbody>
        </table>

        <div class="summary">
          <div class="badge">Total Stored: <span id="stored-HBC">0</span></div>
          <div class="badge">Total Dispatched: <span id="out-HBC">0</span></div>
          <div class="badge">Balance: <span id="bal-HBC">0</span></div>
        </div>
      </div>
    </section>

  </main>

  <!-- Edit Modal -->
  <div id="modal" class="modal">
    <div class="panel">
      <h3 id="modal-title">Edit Record</h3>
      <form id="modal-form" onsubmit="event.preventDefault();saveEdit()">
        <div class="grid">
          <div><label>Date</label><input id="m-date" type="date"></div>
          <div><label>Type</label><select id="m-type"><option>Stored</option><option>Dispatched</option></select></div>
          <div><label>Region</label><select id="m-region"><option>Addis Ababa</option><option>Oromia</option><option>Amhara</option><option>Tigray</option><option>Sidama</option><option>Somali</option><option>Gambella</option><option>Benishangul-Gumuz</option><option>Harari</option><option>South West</option></select></div>
          <div><label>Zone</label><input id="m-zone"></div>
          <div><label>Quantity</label><input id="m-qty" type="number" min="1"></div>
          <div><label>Driver</label><input id="m-driver"></div>
          <div><label>Plate</label><input id="m-plate"></div>
        </div>
        <div style="margin-top:10px" class="actions">
          <button type="submit">Save</button>
          <button type="button" class="ghost" onclick="closeModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // Utility
    const keyHTCD = 'stock_HTCD_90_v2';
    const keyHBC = 'stock_HBC_260_v2';

    function getData(key){return JSON.parse(localStorage.getItem(key)||'[]')}
    function setData(key,arr){localStorage.setItem(key,JSON.stringify(arr))}

    // Initial render
    renderAll();
    function addRecord(model){
      const isHTCD = model==='HTCD';
      const prefix = isHTCD? 'HTCD' : 'HBC';
      const date = document.getElementById('date-'+prefix).value;
      const type = document.getElementById('type-'+prefix).value;
      const region = document.getElementById('region-'+prefix).value;
      const zone = document.getElementById('zone-'+prefix).value.trim();
      const qty = parseInt(document.getElementById('qty-'+prefix).value || 0);
      const driver = document.getElementById('driver-'+prefix).value.trim();
      const plate = document.getElementById('plate-'+prefix).value.trim();
      if(!date || !zone || qty<=0) return alert('Please fill date, zone and quantity correctly.');
      const rec = {id:Date.now(),date,type,region,zone,qty,driver,plate};
      if(isHTCD){ const arr=getData(keyHTCD); arr.push(rec); setData(keyHTCD,arr)} else { const arr=getData(keyHBC); arr.push(rec); setData(keyHBC,arr)}
      renderAll(); clearForm(prefix);
    }

    function clearForm(prefix){['date','zone','qty','driver','plate'].forEach(f=>{const el=document.getElementById(f+'-'+prefix); if(el) el.value='';}); if(document.getElementById('qty-'+prefix)) document.getElementById('qty-'+prefix).value=1}

    function renderAll(){ renderTable('HTCD'); renderTable('HBC'); }

    function renderTable(prefix){
      const table = document.querySelector('#table-'+prefix+' tbody');
      const arr = getData(prefix==='HTCD'?keyHTCD:keyHBC);
      table.innerHTML='';
      let stored=0,out=0;
      arr.forEach(r=>{
        const tr=document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Date">${r.date}</td>
          <td data-label="Type">${r.type}</td>
          <td data-label="Region">${r.region}</td>
          <td data-label="Zone">${r.zone}</td>
          <td data-label="Qty">${r.qty}</td>
          <td data-label="Driver">${r.driver||'-'}</td>
          <td data-label="Plate">${r.plate||'-'}</td>
          <td data-label="Actions">
            <button class="icon-btn" title="Edit" onclick="openEdit('${prefix}',${r.id})">✏️</button>
            <button class="icon-btn" title="Delete" onclick="deleteRecord('${prefix}',${r.id})">🗑️</button>
          </td>`;
        table.appendChild(tr);
        if(r.type==='Stored') stored += Number(r.qty||0); else out += Number(r.qty||0);
      });
      document.getElementById('stored-'+prefix).textContent = stored;
      document.getElementById('out-'+prefix).textContent = out;
      document.getElementById('bal-'+prefix).textContent = stored - out;
    }

    // Edit/Delete
    let editContext = null;
    function openEdit(prefix,id){
      const arr = getData(prefix==='HTCD'?keyHTCD:keyHBC);
      const rec = arr.find(r=>r.id===id); if(!rec) return alert('Record not found');
      editContext = {prefix,id};
      document.getElementById('modal-title').textContent = `Edit ${prefix} Record`;
      document.getElementById('m-date').value = rec.date;
      document.getElementById('m-type').value = rec.type;
      document.getElementById('m-region').value = rec.region;
      document.getElementById('m-zone').value = rec.zone;
      document.getElementById('m-qty').value = rec.qty;
      document.getElementById('m-driver').value = rec.driver;
      document.getElementById('m-plate').value = rec.plate;
      document.getElementById('modal').style.display='flex';
    }
    function closeModal(){ editContext=null; document.getElementById('modal').style.display='none'; }
    function saveEdit(){ if(!editContext) return; const {prefix,id}=editContext; const key = prefix==='HTCD'?keyHTCD:keyHBC; const arr=getData(key); const idx=arr.findIndex(r=>r.id===id); if(idx===-1) return alert('Not found');
      arr[idx].date = document.getElementById('m-date').value;
      arr[idx].type = document.getElementById('m-type').value;
      arr[idx].region = document.getElementById('m-region').value;
      arr[idx].zone = document.getElementById('m-zone').value;
      arr[idx].qty = Number(document.getElementById('m-qty').value);
      arr[idx].driver = document.getElementById('m-driver').value;
      arr[idx].plate = document.getElementById('m-plate').value;
      setData(key,arr); closeModal(); renderTable(prefix);
    }
    function deleteRecord(prefix,id){ if(!confirm('Delete this record?')) return; const key = prefix==='HTCD'?keyHTCD:keyHBC; let arr=getData(key); arr = arr.filter(r=>r.id!==id); setData(key,arr); renderTable(prefix); }

    // Export CSV
    function exportCSV(prefix){ const key = prefix==='HTCD'?keyHTCD:keyHBC; const arr=getData(key); if(arr.length===0) return alert('No records to export');
      let csv='Date,Model,Type,Region,Zone,Quantity,Driver,Plate\n';
      arr.forEach(r=>{ csv += `${r.date},${prefix==='HTCD'?'HTCD 90':'HBC 260'},${r.type},${r.region},${r.zone},${r.qty},${(r.driver||'')},${(r.plate||'')}\n` });
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      const name = `GA_General_Trading_${prefix==='HTCD'?'HTCD_90':'HBC_260'}_Report.csv`;
      a.download = name; a.click();
    }

    // Print (PDF)
    function printSection(prefix){ const key = prefix==='HTCD'?keyHTCD:keyHBC; const arr=getData(key); if(arr.length===0) return alert('No records to print');
      let html = `<html><head><title>GA General Trading ${prefix==='HTCD'?'HTCD 90':'HBC 260'} Report</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>`;
      html += `<h2>GA General Trading — ${prefix==='HTCD'?'HTCD 90':'HBC 260'} Report</h2>`;
      html += `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%"><thead><tr><th>Date</th><th>Type</th><th>Region</th><th>Zone</th><th>Qty</th><th>Driver</th><th>Plate</th></tr></thead><tbody>`;
      arr.forEach(r=>{ html += `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.region}</td><td>${r.zone}</td><td>${r.qty}</td><td>${r.driver||''}</td><td>${r.plate||''}</td></tr>` });
      html += `</tbody></table>`;
      const stored = arr.filter(x=>x.type==='Stored').reduce((s,x)=>s+Number(x.qty||0),0);
      const out = arr.filter(x=>x.type==='Dispatched').reduce((s,x)=>s+Number(x.qty||0),0);
      html += `<p style="margin-top:12px">Total Stored: ${stored} — Total Dispatched: ${out} — Balance: ${stored-out}</p>`;
      html += `</body></html>`;
      const w = window.open('','_blank'); w.document.write(html); w.document.close(); w.focus(); w.print();
    }

    // Init sample: (if no data, keep empty) -- comment out in production
    //if(!localStorage.getItem(keyHTCD) && !localStorage.getItem(keyHBC)){
    //  setData(keyHTCD,[]); setData(keyHBC,[]);
    //}
  </script>
</body>
</html>
