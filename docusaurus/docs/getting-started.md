import React, { useEffect, useState } from "react";

// Compatibility App - Single-file React component
// Usage:
// - Paste this component into a Create React App / Vite project.
// - Tailwind CSS classes are used for styling; if Tailwind is not available the UI will still work but look plain.
// - The app stores data in localStorage under keys: 'parts', 'rules'.

export default function CompatibilityApp() {
  // Parts: { id, name, type, attrs: { key: value } }
  const [parts, setParts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("parts") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [rules, setRules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rules") || "[]");
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("parts", JSON.stringify(parts));
  }, [parts]);
  useEffect(() => {
    localStorage.setItem("rules", JSON.stringify(rules));
  }, [rules]);

  // Form states for new part
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [attrsEditor, setAttrsEditor] = useState([]); // array of {k,v}

  // Rule builder state
  const [ruleAType, setRuleAType] = useState("");
  const [ruleAKey, setRuleAKey] = useState("");
  const [ruleOp, setRuleOp] = useState("=");
  const [ruleBType, setRuleBType] = useState("");
  const [ruleBKey, setRuleBKey] = useState("");

  // Compare selections
  const [selA, setSelA] = useState("");
  const [selB, setSelB] = useState("");
  const [compatResult, setCompatResult] = useState(null);

  // Helpers
  const uniqueTypes = Array.from(new Set(parts.map((p) => p.type))).filter(Boolean);

  function addAttrToEditor() {
    if (!attrKey) return;
    setAttrsEditor((s) => {
      const existing = s.filter((x) => x.k !== attrKey);
      return [...existing, { k: attrKey, v: attrValue }];
    });
    setAttrKey("");
    setAttrValue("");
  }

  function removeAttrFromEditor(k) {
    setAttrsEditor((s) => s.filter((x) => x.k !== k));
  }

  function addPart() {
    if (!name || !type) return alert("Preencha nome e tipo da peça.");
    const newPart = {
      id: Date.now().toString(),
      name,
      type,
      attrs: attrsEditor.reduce((acc, cur) => ({ ...acc, [cur.k]: cur.v }), {}),
    };
    setParts((p) => [newPart, ...p]);
    setName("");
    setType("");
    setAttrsEditor([]);
  }

  function deletePart(id) {
    if (!window.confirm("Excluir esta peça?")) return;
    setParts((p) => p.filter((x) => x.id !== id));
  }

  function addRule() {
    if (!ruleAType || !ruleAKey || !ruleBType || !ruleBKey) return alert("Preencha todos os campos da regra.");
    const newRule = {
      id: Date.now().toString(),
      a: { type: ruleAType, key: ruleAKey },
      op: ruleOp,
      b: { type: ruleBType, key: ruleBKey },
    };
    setRules((r) => [newRule, ...r]);
  }

  function deleteRule(id) {
    setRules((r) => r.filter((x) => x.id !== id));
  }

  function evaluateRule(rule, partA, partB) {
    // Return true if rule satisfied between given parts
    const va = partA?.attrs?.[rule.a.key];
    const vb = partB?.attrs?.[rule.b.key];
    switch (rule.op) {
      case "=":
        return va !== undefined && vb !== undefined && String(va) === String(vb);
      case "!=":
        return va !== undefined && vb !== undefined && String(va) !== String(vb);
      case "in":
        // check list membership (comma separated in vb)
        if (va === undefined || vb === undefined) return false;
        return String(vb).split(",").map(x=>x.trim()).includes(String(va));
      case "contains":
        if (va === undefined || vb === undefined) return false;
        return String(va).includes(String(vb)) || String(vb).includes(String(va));
      default:
        return false;
    }
  }

  function checkCompatibility(partAId, partBId) {
    const pA = parts.find((p) => p.id === partAId);
    const pB = parts.find((p) => p.id === partBId);
    if (!pA || !pB) {
      setCompatResult({ ok: false, message: "Selecione duas peças válidas." });
      return;
    }

    // Collect rules relevant between these two types (both directions)
    const relevant = rules.filter(
      (r) => (r.a.type === pA.type && r.b.type === pB.type) || (r.a.type === pB.type && r.b.type === pA.type)
    );

    // If no rules defined between these types, fallback: compare attributes with same key equality
    if (relevant.length === 0) {
      const sharedKeys = Object.keys(pA.attrs || {}).filter((k) => k in (pB.attrs || {}));
      if (sharedKeys.length === 0) {
        setCompatResult({ ok: true, message: "Nenhuma regra definida: nenhum atributo em comum detectado — compatibilidade assumida (verifique manualmente)." });
        return;
      }
      // require all shared keys to be equal
      const allEqual = sharedKeys.every((k) => String(pA.attrs[k]) === String(pB.attrs[k]));
      setCompatResult({ ok: allEqual, message: allEqual ? "Compatível por atributos coincidentes." : `Incompatível: atributo(s) divergente(s): ${sharedKeys.filter(k=>String(pA.attrs[k])!==String(pB.attrs[k])).join(", ")}` });
      return;
    }

    // Evaluate all relevant rules; for direction-specific, ensure mapping
    const results = relevant.map((r) => {
      if (r.a.type === pA.type && r.b.type === pB.type) {
        return evaluateRule(r, pA, pB);
      } else {
        // rule defined in opposite direction
        return evaluateRule(r, pB, pA);
      }
    });

    const ok = results.every(Boolean);
    setCompatResult({ ok, message: ok ? "Todas as regras satisfeitas." : "Uma ou mais regras não foram satisfeitas." });
  }

  // CSV import: expected columns: name,type,attr:key,attr:key ... or name,type,key1,key2... where header names become attr keys
  function importCSV(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const header = lines[0].split(",").map(h=>h.trim());
    const newParts = [];
    for (let i=1;i<lines.length;i++){
      const cols = lines[i].split(",").map(c=>c.trim());
      const row = {};
      header.forEach((h, idx) => row[h] = cols[idx] ?? "");
      // Build attrs: all headers except name,type become attrs
      const attrs = {};
      Object.keys(row).forEach(k => {
        if (k !== 'name' && k !== 'type') attrs[k] = row[k];
      });
      newParts.push({ id: Date.now().toString()+"_"+i, name: row['name'] || `part_${i}`, type: row['type'] || 'unknown', attrs });
    }
    setParts((p) => [...newParts, ...p]);
  }

  function handleCSVUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      importCSV(String(e.target.result || ''));
    };
    reader.readAsText(file);
  }

  function exportJSON() {
    const data = { parts, rules };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compatibility-db.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSONFile(ev) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const obj = JSON.parse(String(e.target.result || '{}'));
        if (Array.isArray(obj.parts)) setParts(obj.parts);
        if (Array.isArray(obj.rules)) setRules(obj.rules);
      } catch (err) { alert('JSON inválido'); }
    };
    r.readAsText(f);
  }

  function clearAll() {
    if (!window.confirm('Apagar tudo (peças + regras)?')) return;
    setParts([]);
    setRules([]);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Compatibility App — Protótipo</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Cadastrar peça</h2>
          <div className="mt-2">
            <label className="block text-sm">Nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 rounded" />
            <label className="block text-sm mt-2">Tipo (ex: placa-mãe, cpu, ram)</label>
            <input value={type} onChange={e=>setType(e.target.value)} className="w-full border p-2 rounded" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <input placeholder="chave" value={attrKey} onChange={e=>setAttrKey(e.target.value)} className="border p-2 rounded col-span-1" />
              <input placeholder="valor" value={attrValue} onChange={e=>setAttrValue(e.target.value)} className="border p-2 rounded col-span-1" />
              <button onClick={addAttrToEditor} className="col-span-1 p-2 rounded bg-blue-600 text-white">Adicionar</button>
            </div>
            <div className="mt-2">
              {attrsEditor.map(a=> (
                <div key={a.k} className="flex items-center gap-2 text-sm">
                  <strong>{a.k}:</strong> <span className="flex-1">{a.v}</span>
                  <button onClick={()=>removeAttrFromEditor(a.k)} className="text-red-600">x</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addPart} className="p-2 rounded bg-green-600 text-white">Salvar peça</button>
              <button onClick={()=>{setName(''); setType(''); setAttrsEditor([]);}} className="p-2 rounded border">Limpar</button>
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="font-semibold">Importar</h3>
          <p className="text-sm">CSV com cabeçalho: name,type,<i>attr1,attr2...</i></p>
          <input type="file" accept=".csv" onChange={handleCSVUpload} className="mt-2" />

          <p className="text-sm mt-3">Ou importar/exportar banco JSON</p>
          <div className="flex gap-2 mt-2">
            <button onClick={exportJSON} className="p-2 rounded bg-sky-600 text-white">Exportar JSON</button>
            <input type="file" accept=".json" onChange={importJSONFile} />
          </div>

          <div className="mt-4">
            <button onClick={clearAll} className="text-sm text-red-600">Apagar tudo</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Criar regra de compatibilidade</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-sm">Tipo A</label>
              <input value={ruleAType} onChange={e=>setRuleAType(e.target.value)} className="w-full border p-2 rounded" placeholder="ex: placa-mãe" />
              <label className="text-sm mt-1">Chave A</label>
              <input value={ruleAKey} onChange={e=>setRuleAKey(e.target.value)} className="w-full border p-2 rounded" placeholder="ex: socket" />
            </div>
            <div>
              <label className="text-sm">Tipo B</label>
              <input value={ruleBType} onChange={e=>setRuleBType(e.target.value)} className="w-full border p-2 rounded" placeholder="ex: cpu" />
              <label className="text-sm mt-1">Chave B</label>
              <input value={ruleBKey} onChange={e=>setRuleBKey(e.target.value)} className="w-full border p-2 rounded" placeholder="ex: socket" />
            </div>
          </div>
          <div className="mt-2">
            <label className="text-sm">Operador</label>
            <select value={ruleOp} onChange={e=>setRuleOp(e.target.value)} className="border p-2 rounded w-full mt-1">
              <option value="=">igual (=)</option>
              <option value="!=">diferente (!=)</option>
              <option value="in">membro em (in) — verifica se A está listado em B (csv)</option>
              <option value="contains">contém / contém (contains)</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={addRule} className="p-2 rounded bg-green-600 text-white">Salvar regra</button>
          </div>

          <hr className="my-4" />

          <h3 className="font-semibold">Regras existentes</h3>
          <div className="max-h-48 overflow-auto mt-2 text-sm">
            {rules.length === 0 && <p className="text-gray-500">Nenhuma regra criada.</p>}
            {rules.map(r=> (
              <div key={r.id} className="flex items-center justify-between gap-2 p-2 border rounded mb-1">
                <div>
                  <strong>{r.a.type}.{r.a.key}</strong> {r.op} <strong>{r.b.type}.{r.b.key}</strong>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>deleteRule(r.id)} className="text-red-600">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Banco de peças</h2>
        <div className="mt-2 grid md:grid-cols-3 gap-2">
          {parts.map(p => (
            <div key={p.id} className="border p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <strong>{p.name}</strong>
                  <div className="text-xs text-gray-500">{p.type}</div>
                </div>
                <div className="text-sm text-right">
                  <button onClick={()=>deletePart(p.id)} className="text-red-600">Excluir</button>
                </div>
              </div>
              <div className="mt-2 text-sm">
                {Object.keys(p.attrs || {}).length === 0 && <div className="text-gray-400">Sem atributos</div>}
                {Object.entries(p.attrs || {}).map(([k,v])=> (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="text-gray-600">{v}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Verificar compatibilidade</h2>
        <div className="mt-2 flex gap-2 flex-wrap">
          <select value={selA} onChange={e=>setSelA(e.target.value)} className="border p-2 rounded">
            <option value="">-- selecione peça A --</option>
            {parts.map(p=> <option key={p.id} value={p.id}>{p.name} — {p.type}</option>)}
          </select>
          <select value={selB} onChange={e=>setSelB(e.target.value)} className="border p-2 rounded">
            <option value="">-- selecione peça B --</option>
            {parts.map(p=> <option key={p.id} value={p.id}>{p.name} — {p.type}</option>)}
          </select>
          <button onClick={()=>checkCompatibility(selA, selB)} className="p-2 rounded bg-blue-600 text-white">Verificar</button>
        </div>
        {compatResult && (
          <div className={`mt-4 p-3 rounded ${compatResult.ok ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <div className="font-semibold">{compatResult.ok ? 'Compatível' : 'Incompatível'}</div>
            <div className="text-sm mt-1">{compatResult.message}</div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold">Notas sobre verificação</h4>
          <p className="text-sm text-gray-600">A verificação: procura regras explícitas entre tipos; se não houver regras, compara atributos com nomes iguais e exige igualdade. Este protótipo é pensada para ser facilmente estendida (ex.: operadores adicionais, avaliação heurística, UI de prioridade de regras).</p>
        </div>
      </div>

      <footer className="mt-6 text-sm text-gray-500 text-center">Protótipo gerado — personalize campos e regras conforme o seu domínio.</footer>
    </div>
  );
}
