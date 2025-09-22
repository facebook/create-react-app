import React, { useState, useEffect, useMemo } from "react";
// Single-file React component for an expense manager app
// TailwindCSS is used for styling (assumes Tailwind is configured in the project).
// Recharts is used for a small category pie chart. Install: `npm install recharts`


import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
Tooltip as ReTooltip,
} from "recharts";


const DEFAULT_CATEGORIES = [
"Ăn uống",
"Di chuyển",
"Nhà ở",
"Giải trí",
"Sức khỏe",
"Thu nhập",
"Khác",
];


const COLORS = [
"#4f46e5",
"#06b6d4",
"#f59e0b",
"#ef4444",
"#10b981",
"#8b5cf6",
"#374151",
];


const STORAGE_KEY = "expense_manager_data_v1";


export default function ExpenseManager() {
const [transactions, setTransactions] = useState([]);
const [categories, setCategories] = useState(DEFAULT_CATEGORIES);


const [form, setForm] = useState({
type: "expense", // expense or income
amount: "",
category: DEFAULT_CATEGORIES[0],
note: "",
date: new Date().toISOString().slice(0, 10),
});


const [filterMonth, setFilterMonth] = useState(
new Date().toISOString().slice(0, 7)
);
const [searchText, setSearchText] = useState("");


// load from localStorage
useEffect(() => {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (raw) {
const parsed = JSON.parse(raw);
if (Array.isArray(parsed.transactions)) {
setTransactions(parsed.transactions);
}
if (Array.isArray(parsed.categories)) {
setCategories(parsed.categories);
}
}
} catch (e) {
console.error("Failed to load data", e);
}
}, []);


// save to localStorage when transactions or categories change
useEffect(() => {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify({ transactions, categories })
);
}, [transactions, categories]);


function handleFormChange(e) {
const { name, value } = e.target;
setForm((f) => ({ ...f, [name]: value }));
}
}
