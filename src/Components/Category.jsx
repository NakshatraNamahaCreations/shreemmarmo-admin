import React, { useEffect, useMemo, useState } from "react";

const API = "https://shreemarmo-backend.onrender.com/api/category";
const BASE_URL = "https://shreemarmo-backend.onrender.com";

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
const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

function Category() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // create
    const [name, setName] = useState("");
    const [img, setImg] = useState(null);
    const [createPreview, setCreatePreview] = useState("");

    // edit
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editImg, setEditImg] = useState(null);
    const [editOldImage, setEditOldImage] = useState(""); // existing image path
    const [editPreview, setEditPreview] = useState("");   // new selected image preview

    // search
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return list;
        return list.filter((x) => (x.categoryName || "").toLowerCase().includes(s));
    }, [q, list]);

    const fetchAll = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch categories");
            setList(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ cleanup object urls (previews)
    useEffect(() => {
        return () => {
            try {
                if (createPreview?.startsWith("blob:")) URL.revokeObjectURL(createPreview);
                if (editPreview?.startsWith("blob:")) URL.revokeObjectURL(editPreview);
            } catch (e) { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!name.trim()) return setErr("Category name is required");
            if (!img) return setErr("Category image is required");

            const fd = new FormData();
            fd.append("categoryName", name.trim());
            fd.append("categoryImage", img);

            const res = await fetch(`${API}/create`, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Create failed");

            setName("");
            setImg(null);
            setCreatePreview("");
            await fetchAll();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setEditName(item.categoryName || "");
        setEditImg(null);
        setEditPreview("");
        setEditOldImage(item.categoryImage || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
        setEditImg(null);
        setEditOldImage("");
        setEditPreview("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!editId) return;
            if (!editName.trim()) return setErr("Category name is required");

            const fd = new FormData();
            fd.append("categoryName", editName.trim());
            if (editImg) fd.append("categoryImage", editImg);

            const res = await fetch(`${API}/edit/${editId}`, { method: "PUT", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");

            cancelEdit();
            await fetchAll();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Delete this category?");
        if (!ok) return;

        setErr("");
        try {
            const res = await fetch(`${API}/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Delete failed");
            await fetchAll();
        } catch (e) {
            setErr(e.message);
        }
    };

    const ImageThumb = ({ src, alt }) => {
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
    };

    return (
        <div style={{ fontFamily: "Poppins", background: THEME.bg, minHeight: "100vh" }}>
            {/* Header */}
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
                                Category Management
                            </div>
                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                                Add, edit, delete categories
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={fetchAll}
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
                {/* Error */}
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

                {/* Create / Edit Card */}
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
                            {editId ? "Edit Category" : "Add Category"}
                        </div>
                        {editId ? (
                            <button onClick={cancelEdit} style={btnStyle("secondary")}>
                                Cancel
                            </button>
                        ) : null}
                    </div>

                    <form
                        onSubmit={editId ? handleUpdate : handleCreate}
                        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 0.8fr auto", gap: 12 }}
                    >
                        {/* Name */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                Category Name
                            </div>
                            <input
                                value={editId ? editName : name}
                                onChange={(e) => (editId ? setEditName(e.target.value) : setName(e.target.value))}
                                placeholder="Eg: Marbles"
                                style={inputStyle}
                            />
                        </div>

                        {/* File */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6, color: THEME.dark }}>
                                {editId ? "New Image (optional)" : "Category Image"}
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

                            {/* create preview */}
                            {!editId ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <ImageThumb src={createPreview || ""} alt="preview" />
                                    <div style={{ fontSize: "12px", color: THEME.sub }}>Selected image</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    {/* old image */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <ImageThumb src={getImageUrl(editOldImage)} alt="old" />
                                        <div style={{ fontSize: "12px", color: THEME.sub, textAlign: "center" }}>Old</div>
                                    </div>

                                    {/* new image */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <ImageThumb src={editPreview || ""} alt="new" />
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
                        Tip: Image required only for create. While editing, image optional.
                    </div>
                </div>

                {/* List Card */}
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
                        <div style={{ fontSize: "14px", fontWeight: 700, color: THEME.black }}>All Categories</div>

                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search category..."
                            style={{ ...inputStyle, maxWidth: 280 }}
                        />
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#faf9fb" }}>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>S.No</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Image</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Category Name</th>
                                    <th style={{ textAlign: "left", padding: 12, fontSize: "13px", color: THEME.dark }}>Created</th>
                                    <th style={{ textAlign: "right", padding: 12, fontSize: "13px", color: THEME.dark }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 16, fontSize: "13px", color: THEME.sub }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 16, fontSize: "13px", color: THEME.sub }}>
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item, idx) => (
                                        <tr key={item._id} style={{ borderTop: `1px solid ${THEME.border}` }}>
                                            <td style={{ padding: 12, fontSize: "13px", color: THEME.sub }}>{idx + 1}</td>

                                            <td style={{ padding: 12 }}>
                                                <ImageThumb src={getImageUrl(item.categoryImage)} alt="category" />
                                            </td>

                                            <td style={{ padding: 12, fontSize: "14px", fontWeight: 700, color: THEME.black }}>
                                                {item.categoryName}
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

export default Category;
