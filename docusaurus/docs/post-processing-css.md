import React, { useState, useMemo } from "react";

// MarketCar - Single-file React component
// Requirements: Tailwind CSS (already configured in your project)
// Usage: import MarketCar from './MarketCar.jsx' and render <MarketCar /> inside your app.

export default function MarketCar() {
  // Sample data
  const initialCars = [
    {
      id: 1,
      title: "Volkswagen Gol 2015",
      price: 25000,
      year: 2015,
      km: 78000,
      fuel: "Gasolina",
      city: "Belém",
      img: "https://via.placeholder.com/400x250?text=Gol+2015",
      description: "Carro bem conservado, único dono. Manutenção em dia.",
    },
    {
      id: 2,
      title: "Chevrolet Onix 2019",
      price: 45000,
      year: 2019,
      km: 42000,
      fuel: "Flex",
      city: "Manaus",
      img: "https://via.placeholder.com/400x250?text=Onix+2019",
      description: "Completo, direção elétrica, ar-condicionado.",
    },
    {
      id: 3,
      title: "Ford Ka 2017",
      price: 30000,
      year: 2017,
      km: 60000,
      fuel: "Flex",
      city: "Belém",
      img: "https://via.placeholder.com/400x250?text=Ka+2017",
      description: "Versátil e econômico para uso diário.",
    },
  ];

  const [cars, setCars] = useState(initialCars);
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Derived lists for filter dropdowns
  const cities = useMemo(() => {
    return [...new Set(cars.map((c) => c.city))];
  }, [cars]);
  const fuels = useMemo(() => {
    return [...new Set(cars.map((c) => c.fuel))];
  }, [cars]);

  const filtered = useMemo(() => {
    let list = cars.filter((car) => {
      const q = query.trim().toLowerCase();
      const matchQuery = !q || car.title.toLowerCase().includes(q) || car.description.toLowerCase().includes(q);
      const matchCity = !cityFilter || car.city === cityFilter;
      const matchFuel = !fuelFilter || car.fuel === fuelFilter;
      return matchQuery && matchCity && matchFuel;
    });

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "year_desc") list.sort((a, b) => b.year - a.year);
    if (sortBy === "km_asc") list.sort((a, b) => a.km - b.km);

    return list;
  }, [cars, query, cityFilter, fuelFilter, sortBy]);

  function handleAddListing(newCar) {
    setCars((prev) => [{ id: Date.now(), ...newCar }, ...prev]);
    setShowAddModal(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">MarketCar</h1>
          <p className="text-sm text-slate-600">Compra e venda de carros - protótipo</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-500"
          >
            + Anunciar veículo
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Filters */}
        <aside className="col-span-1 bg-white p-4 rounded-lg shadow">
          <SearchBox query={query} setQuery={setQuery} />

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Filtros</h3>
            <label className="block text-sm">Cidade</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full mt-1 border rounded px-2 py-1"
            >
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="block text-sm mt-3">Combustível</label>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="w-full mt-1 border rounded px-2 py-1"
            >
              <option value="">Qualquer</option>
              {fuels.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <label className="block text-sm mt-3">Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full mt-1 border rounded px-2 py-1">
              <option value="relevance">Relevância</option>
              <option value="price_asc">Preço: menor → maior</option>
              <option value="price_desc">Preço: maior → menor</option>
              <option value="year_desc">Ano: mais novo</option>
              <option value="km_asc">Km: menor</option>
            </select>

            <button
              onClick={() => {
                setCityFilter("");
                setFuelFilter("");
                setQuery("");
                setSortBy("relevance");
              }}
              className="mt-4 w-full text-sm px-3 py-2 border rounded"
            >
              Limpar filtros
            </button>
          </div>
        </aside>

        {/* Right: Listings */}
        <section className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Veículos encontrados ({filtered.length})</h2>
              <div className="text-sm text-slate-500">Protótipo - dados locais</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.length === 0 && <div className="p-6 text-center text-slate-500">Nenhum veículo encontrado.</div>}

              {filtered.map((car) => (
                <CarCard key={car.id} car={car} onOpen={() => setSelectedCar(car)} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Detail modal */}
      {selectedCar && (
        <Modal onClose={() => setSelectedCar(null)}>
          <div className="max-w-3xl">
            <div className="flex gap-6">
              <img src={selectedCar.img} alt={selectedCar.title} className="w-48 h-32 object-cover rounded" />
              <div>
                <h3 className="text-xl font-bold">{selectedCar.title}</h3>
                <p className="text-emerald-600 font-semibold">R$ {selectedCar.price.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{selectedCar.year} • {selectedCar.km.toLocaleString()} km • {selectedCar.fuel}</p>
                <p className="mt-3 text-slate-700">{selectedCar.description}</p>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 rounded border">Entrar em contato</button>
                  <button className="px-3 py-2 rounded bg-sky-600 text-white">Agendar visita</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Listing Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-3">Anunciar veículo</h3>
            <AddListingForm onCancel={() => setShowAddModal(false)} onSubmit={handleAddListing} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function SearchBox({ query, setQuery }) {
  return (
    <div>
      <label className="block text-sm">Pesquisar</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ex: Onix, Gol, 2018..."
        className="w-full mt-1 border rounded px-3 py-2"
      />
    </div>
  );
}

function CarCard({ car, onOpen }) {
  return (
    <article className="flex bg-white rounded-lg shadow overflow-hidden">
      <img src={car.img} alt={car.title} className="w-36 h-28 object-cover" />
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold">{car.title}</h4>
          <p className="text-sm text-slate-500">{car.year} • {car.km.toLocaleString()} km</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-600 font-bold">R$ {car.price.toLocaleString()}</div>
            <div className="text-xs text-slate-500">{car.city} • {car.fuel}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={onOpen} className="px-3 py-1 border rounded text-sm">Ver</button>
            <button className="px-3 py-1 bg-slate-100 rounded text-sm">Favoritar</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow p-4 w-full max-w-3xl z-10"> 
        <button onClick={onClose} className="absolute right-3 top-3 text-slate-500">✕</button>
        {children}
      </div>
    </div>
  );
}

function AddListingForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: "", price: "", year: "", km: "", fuel: "", city: "", img: "", description: "" });

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    // Basic validation
    if (!form.title || !form.price) return alert("Título e preço são obrigatórios");
    const normalized = { ...form, price: Number(form.price), year: Number(form.year || 0), km: Number(form.km || 0) };
    onSubmit(normalized);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm">Título</label>
        <input value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">Preço (R$)</label>
          <input value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Ano</label>
          <input value={form.year} onChange={(e) => update("year", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">Km</label>
          <input value={form.km} onChange={(e) => update("km", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Combustível</label>
          <input value={form.fuel} onChange={(e) => update("fuel", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
        </div>
      </div>

      <div>
        <label className="block text-sm">Cidade</label>
        <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" />
      </div>

      <div>
        <label className="block text-sm">Imagem (URL)</label>
        <input value={form.img} onChange={(e) => update("img", e.target.value)} placeholder="https://..." className="w-full mt-1 border rounded px-2 py-1" />
      </div>

      <div>
        <label className="block text-sm">Descrição</label>
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full mt-1 border rounded px-2 py-1" rows={3} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Publicar</button>
      </div>
    </form>
  );
}

