import React, { useEffect, useMemo, useState } from "react";

const SUB_API = "https://shreemarmo-backend.onrender.com/api/subcategory";   // ✅ change if needed
const CAT_API = "https://shreemarmo-backend.onrender.com/api/category";      // ✅ category list
const BASE_URL = "https://shreemarmo-backend.onrender.com";

// ✅ Your color combo
const THEME = {
    primary: "#8D5660",
    primary2: "#8D5662",
    dark: "#434252",
    black: "#000000",
    bg: "#f7f6f8",
    card: "#ffffff",
    border: "#e6e3e8",
    sub: "#6b7280",
};

const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "13px",
    padding: "10px 12px",
    border: `1px solid ${THEME.border}`,
    borderRadius: "10px",
    outline: "none",
    width: "100%",
    background: THEME.card,
    color: THEME.black,
};

const btnStyle = (type) => {
    const base = {
        fontFamily: "Poppins",
        fontSize: "13px",
        padding: "10px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
        border: "1px solid transparent",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
    };

    if (type === "primary")
        return { ...base, background: THEME.primary, color: "#fff", borderColor: THEME.primary };

    if (type === "danger")
        return { ...base, background: THEME.black, color: "#fff", borderColor: THEME.black };

    return {
        ...base,
        background: "#f3f1f4",
        color: THEME.dark,
        borderColor: THEME.border,
    };
};

// ✅ safe join BASE_URL + "/uploads/..."
const getImageUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`;
};

function ImageThumb({ src, alt }) {
    const [broken, setBroken] = useState(false);

    if (!src || broken) {
        return (
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: `1px dashed ${THEME.border}`,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: THEME.sub,
                }}
            >
                N/A
            </div>
        );
    }

    return (
        <div
            style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: `1px solid ${THEME.border}`,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 8px 18px rgba(0,0,0,0.04)",
            }}
        >
            <img
                src={src}
                alt={alt}
                onError={() => setBroken(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
        </div>
    );
}

function Subcategory() {
    const [categories, setCategories] = useState([]); // dropdown
    const [list, setList] = useState([]); // subcategory list
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // ✅ Create fields
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryName, setSubCategoryName] = useState("");
    const [img, setImg] = useState(null);
    const [createPreview, setCreatePreview] = useState("");

    // ✅ Edit fields
    const [editId, setEditId] = useState(null);
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editSubCategoryName, setEditSubCategoryName] = useState("");
    const [editImg, setEditImg] = useState(null);
    const [editOldImage, setEditOldImage] = useState("");
    const [editPreview, setEditPreview] = useState("");

    // search
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return list;

        return list.filter((x) => {
            const a = (x.subCategoryName || "").toLowerCase();
            const b = (x.categoryName || "").toLowerCase();
            return a.includes(s) || b.includes(s);
        });
    }, [q, list]);

    // ✅ fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${CAT_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch categories");
            setCategories(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        }
    };

    // ✅ fetch subcategories
    const fetchAllSub = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${SUB_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch subcategories");
            setList(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchAllSub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ cleanup previews
    useEffect(() => {
        return () => {
            try {
                if (createPreview?.startsWith("blob:")) URL.revokeObjectURL(createPreview);
                if (editPreview?.startsWith("blob:")) URL.revokeObjectURL(editPreview);
            } catch (e) { }
        };
    }, [createPreview, editPreview]);

    const selectedCategoryName = useMemo(() => {
        const found = categories.find((c) => c._id === categoryId);
        return found?.categoryName || "";
    }, [categories, categoryId]);

    const selectedEditCategoryName = useMemo(() => {
        const found = categories.find((c) => c._id === editCategoryId);
        return found?.categoryName || "";
    }, [categories, editCategoryId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!categoryId) return setErr("categoryId is required");
            if (!subCategoryName.trim()) return setErr("subCategoryName is required");
            if (!img) return setErr("subCategoryImage is required");

            const fd = new FormData();
            fd.append("categoryId", categoryId);
            fd.append("categoryName", selectedCategoryName);
            fd.append("subCategoryName", subCategoryName.trim());
            fd.append("subCategoryImage", img);

            const res = await fetch(`${SUB_API}/create`, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Create failed");

            setCategoryId("");
            setSubCategoryName("");
            setImg(null);
            setCreatePreview("");
            await fetchAllSub();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setEditCategoryId(item.categoryId || "");
        setEditSubCategoryName(item.subCategoryName || "");
        setEditImg(null);
        setEditPreview("");
        setEditOldImage(item.subCategoryImage || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditCategoryId("");
        setEditSubCategoryName("");
        setEditImg(null);
        setEditOldImage("");
        setEditPreview("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!editId) return;
            if (!editCategoryId) return setErr("categoryId is required");
            if (!editSubCategoryName.trim()) return setErr("subCategoryName is required");

            const fd = new FormData();
            fd.append("categoryId", editCategoryId);
            fd.append("categoryName", selectedEditCategoryName);
            fd.append("subCategoryName", editSubCategoryName.trim());
            if (editImg) fd.append("subCategoryImage", editImg);

            const res = await fetch(`${SUB_API}/edit/${editId}`, { method: "PUT", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");

            cancelEdit();
            await fetchAllSub();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Delete this subcategory?");
        if (!ok) return;

        setErr("");
        try {
            const res = await fetch(`${SUB_API}/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Delete failed");
            await fetchAllSub();
        } catch (e) {
            setErr(e.message);
        }
    };

    return (
        <div style={{ fontFamily: "Poppins", background: THEME.bg, minHeight: "100vh" }}>
            {/* ✅ Header */}
            <div
                style={{
                    background: THEME.dark,
                    borderBottom: `1px solid rgba(255,255,255,0.12)`,
                    padding: "14px 18px",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        maxWidth: 1100,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: THEME.primary,
                                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
                            }}
                        />
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                                SubCategory Management
                            </div>
                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                                Category dropdown + add/edit/delete subcategories
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            fetchCategories();
                            fetchAllSub();
                        }}
                        style={{
                            ...btnStyle("secondary"),
                            background: "rgba(255,255,255,0.10)",
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.18)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px" }}>
                {/* ✅ Error */}
                {err ? (
                    <div
                        style={{
                            background: "#fff",
                            border: `1px solid ${THEME.border}`,
                            borderLeft: `5px solid ${THEME.primary}`,
                            padding: "10px 12px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            color: THEME.black,
                            marginBottom: 12,
                        }}
                    >
                        <b style={{ color: THEME.primary }}>Error:</b> {err}
                    </div>
                ) : null}

                {/* ✅ Create / Edit Card */}
                <div
                    style={{
                        background: THEME.card,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 16,
                        padding: 16,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                        marginBottom: 14,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: THEME.black }}>
                            {editId ? "Edit SubCategory" : "Add SubCategory"}
                        </div>

                        {editId ? (
                            <button onClick={cancelEdit} style={btnStyle("secondary")}>
                                Cancel
                            </button>
                        ) : null}
                    </div>

                    <form
                        onSubmit={editId ? handleUpdate : handleCreate}
                        style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1fr 0.8fr auto", gap: 12 }}
                    >
                        {/* Category Dropdown */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                Category
                            </div>
                            <select
                                value={editId ? editCategoryId : categoryId}
                                onChange={(e) => (editId ? setEditCategoryId(e.target.value) : setCategoryId(e.target.value))}
                                style={inputStyle}
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory Name */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                SubCategory Name
                            </div>
                            <input
                                value={editId ? editSubCategoryName : subCategoryName}
                                onChange={(e) => (editId ? setEditSubCategoryName(e.target.value) : setSubCategoryName(e.target.value))}
                                placeholder="Eg: Italian Marble"
                                style={inputStyle}
                            />
                        </div>

                        {/* File */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                {editId ? "New Image (optional)" : "SubCategory Image"}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    if (editId) {
                                        setEditImg(f);
                                        setEditPreview(f ? URL.createObjectURL(f) : "");
                                    } else {
                                        setImg(f);
                                        setCreatePreview(f ? URL.createObjectURL(f) : "");
                                    }
                                }}
                                style={{ ...inputStyle, padding: "8px 10px" }}
                            />
                        </div>

                        {/* Preview */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                Preview
                            </div>

                            {!editId ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <ImageThumb src={createPreview} alt="preview" />
                                    <div style={{ fontSize: "12px", color: THEME.sub }}>Selected image</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <ImageThumb src={getImageUrl(editOldImage)} alt="old" />
                                        <div style={{ fontSize: "12px", color: THEME.sub, textAlign: "center" }}>Old</div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <ImageThumb src={editPreview} alt="new" />
                                        <div style={{ fontSize: "12px", color: THEME.sub, textAlign: "center" }}>New</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div style={{ display: "flex", alignItems: "end" }}>
                            <button
                                type="submit"
                                style={btnStyle("primary")}
                                onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                            >
                                {editId ? "Update" : "Add"}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: 10, fontSize: "13px", color: THEME.sub }}>
                        Tip: SubCategory image required for create. In edit, image is optional.
                    </div>
                </div>

                {/* ✅ List Card */}
                <div
                    style={{
                        background: THEME.card,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                    }}
                >
                    <div
                        style={{
                            padding: 14,
                            borderBottom: `1px solid ${THEME.border}`,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            alignItems: "center",
                        }}
                    >
                        <div style={{ fontSize: "14px", fontWeight: 700, color: THEME.black }}>
                            All SubCategories
                        </div>

                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by category or subcategory..."
                            style={{ ...inputStyle, maxWidth: 340 }}
                        />
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#faf9fb" }}>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>S.No</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Image</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Category</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>SubCategory</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Created</th>
                                    <th style={{ textAlign: "right", padding: 12, fontSize: "13px", color: THEME.dark }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 16, fontSize: "13px", color: THEME.sub }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 16, fontSize: "13px", color: THEME.sub }}>
                                            No subcategories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item, idx) => (
                                        <tr key={item._id} style={{ borderTop: `1px solid ${THEME.border}` }}>
                                            <td style={{ padding: 12, fontSize: "13px", color: THEME.sub }}>{idx + 1}</td>

                                            <td style={{ padding: 12 }}>
                                                <ImageThumb src={getImageUrl(item.subCategoryImage)} alt="subcategory" />
                                            </td>

                                            <td style={{ padding: 12, fontSize: "13px", color: THEME.dark, fontWeight: 700 }}>
                                                {item.categoryName || "-"}
                                            </td>

                                            <td style={{ padding: 12, fontSize: "14px", color: THEME.black, fontWeight: 700 }}>
                                                {item.subCategoryName || "-"}
                                            </td>

                                            <td style={{ padding: 12, fontSize: "13px", color: THEME.sub }}>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                                            </td>

                                            <td style={{ padding: 12, textAlign: "right" }}>
                                                <div style={{ display: "inline-flex", gap: 8 }}>
                                                    <button onClick={() => startEdit(item)} style={btnStyle("secondary")}>
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        style={btnStyle("danger")}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = THEME.black)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            padding: 12,
                            borderTop: `1px solid ${THEME.border}`,
                            fontSize: "13px",
                            color: THEME.sub,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div>
                            Total: <span style={{ color: THEME.black, fontWeight: 800 }}>{filtered.length}</span>
                        </div>
                        <div style={{ color: THEME.dark, fontWeight: 700 }}>
                            Theme: <span style={{ color: THEME.primary }}>Rose</span> +{" "}
                            <span style={{ color: THEME.dark }}>Slate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Subcategory;
