import React, { useEffect, useMemo, useState } from "react";

const PRODUCT_API = "https://shreemarmo-backend.onrender.com/api/product";      // ✅ change if needed
const CATEGORY_API = "https://shreemarmo-backend.onrender.com/api/category";    // ✅ for category dropdown
const SUB_API = "https://shreemarmo-backend.onrender.com/api/subcategory";      // ✅ for subcategory dropdown
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

const labelStyle = {
    fontFamily: "Poppins",
    fontSize: "13px",
    fontWeight: 600,
    color: THEME.dark,
    marginBottom: 6,
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

const getImageUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`;
};

function Img({ src, alt, size = 54 }) {
    const [broken, setBroken] = useState(false);

    if (!src || broken) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: 14,
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
                width: size,
                height: size,
                borderRadius: 14,
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

function Product() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // ✅ Create form
    const [categoryName, setCategoryName] = useState("");
    const [subCategoryName, setSubCategoryName] = useState("");
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [marbleType, setMarbleType] = useState("");
    const [color, setColor] = useState("");
    const [finish, setFinish] = useState("");
    const [thicknessMM, setThicknessMM] = useState("");
    const [size, setSize] = useState("");
    const [origin, setOrigin] = useState("");
    const [application, setApplication] = useState("");
    const [images, setImages] = useState([]); // File[]
    const [createPreviews, setCreatePreviews] = useState([]); // string[]

    // ✅ Edit form
    const [editId, setEditId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editSubCategoryName, setEditSubCategoryName] = useState("");
    const [editProductName, setEditProductName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editMarbleType, setEditMarbleType] = useState("");
    const [editColor, setEditColor] = useState("");
    const [editFinish, setEditFinish] = useState("");
    const [editThicknessMM, setEditThicknessMM] = useState("");
    const [editSize, setEditSize] = useState("");
    const [editOrigin, setEditOrigin] = useState("");
    const [editApplication, setEditApplication] = useState("");
    const [editImages, setEditImages] = useState([]); // File[]
    const [editPreviews, setEditPreviews] = useState([]); // blob urls
    const [oldImages, setOldImages] = useState([]); // existing productImages paths

    // UI state
    const [q, setQ] = useState("");
    const [viewId, setViewId] = useState(null); // "website type UI" -> card view details

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return list;
        return list.filter((p) => {
            const a = (p.productName || "").toLowerCase();
            const b = (p.categoryName || "").toLowerCase();
            const c = (p.subCategoryName || "").toLowerCase();
            return a.includes(s) || b.includes(s) || c.includes(s);
        });
    }, [q, list]);

    const viewed = useMemo(() => filtered.find((x) => x._id === viewId) || null, [filtered, viewId]);

    // ✅ Fetch categories + subcategories for dropdown
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${CATEGORY_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch categories");
            setCategories(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const res = await fetch(`${SUB_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch subcategories");
            setSubcategories(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        }
    };

    // ✅ Fetch products
    const fetchAll = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${PRODUCT_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch products");
            setList(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ filter subcategory dropdown by selected categoryName
    const subOptions = useMemo(() => {
        const cat = editId ? editCategoryName : categoryName;
        if (!cat) return subcategories;
        return subcategories.filter((s) => (s.categoryName || "") === cat);
    }, [subcategories, categoryName, editCategoryName, editId]);

    // ✅ cleanup preview URLs
    useEffect(() => {
        return () => {
            try {
                createPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
                editPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
            } catch (e) { }
        };
    }, [createPreviews, editPreviews]);

    const pickFiles = (fileList) => {
        const arr = Array.from(fileList || []);
        return arr.slice(0, 10); // max 10
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!categoryName) return setErr("categoryName is required");
            if (!subCategoryName) return setErr("subCategoryName is required");
            if (!productName.trim()) return setErr("productName is required");
            if (!price) return setErr("price is required");
            if (!images || images.length === 0) return setErr("productImages are required");

            const fd = new FormData();
            fd.append("categoryName", categoryName);
            fd.append("subCategoryName", subCategoryName);
            fd.append("productName", productName.trim());
            fd.append("price", price);

            fd.append("description", description || "");
            fd.append("marbleType", marbleType || "");
            fd.append("color", color || "");
            fd.append("finish", finish || "");
            fd.append("thicknessMM", thicknessMM || "");
            fd.append("size", size || "");
            fd.append("origin", origin || "");
            fd.append("application", application || "");

            images.forEach((f) => fd.append("productImages", f));

            const res = await fetch(`${PRODUCT_API}/create`, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Create failed");

            // reset
            setCategoryName("");
            setSubCategoryName("");
            setProductName("");
            setPrice("");
            setDescription("");
            setMarbleType("");
            setColor("");
            setFinish("");
            setThicknessMM("");
            setSize("");
            setOrigin("");
            setApplication("");
            setImages([]);
            setCreatePreviews([]);

            await fetchAll();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setEditCategoryName(item.categoryName || "");
        setEditSubCategoryName(item.subCategoryName || "");
        setEditProductName(item.productName || "");
        setEditPrice(String(item.price ?? ""));
        setEditDescription(item.description || "");
        setEditMarbleType(item.marbleType || "");
        setEditColor(item.color || "");
        setEditFinish(item.finish || "");
        setEditThicknessMM(String(item.thicknessMM ?? ""));
        setEditSize(item.size || "");
        setEditOrigin(item.origin || "");
        setEditApplication(item.application || "");
        setOldImages(Array.isArray(item.productImages) ? item.productImages : []);
        setEditImages([]);
        setEditPreviews([]);
        setViewId(item._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditCategoryName("");
        setEditSubCategoryName("");
        setEditProductName("");
        setEditPrice("");
        setEditDescription("");
        setEditMarbleType("");
        setEditColor("");
        setEditFinish("");
        setEditThicknessMM("");
        setEditSize("");
        setEditOrigin("");
        setEditApplication("");
        setOldImages([]);
        setEditImages([]);
        setEditPreviews([]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!editId) return;
            if (!editCategoryName) return setErr("categoryName is required");
            if (!editSubCategoryName) return setErr("subCategoryName is required");
            if (!editProductName.trim()) return setErr("productName is required");
            if (!editPrice) return setErr("price is required");

            const fd = new FormData();
            fd.append("categoryName", editCategoryName);
            fd.append("subCategoryName", editSubCategoryName);
            fd.append("productName", editProductName.trim());
            fd.append("price", editPrice);

            fd.append("description", editDescription || "");
            fd.append("marbleType", editMarbleType || "");
            fd.append("color", editColor || "");
            fd.append("finish", editFinish || "");
            fd.append("thicknessMM", editThicknessMM || "");
            fd.append("size", editSize || "");
            fd.append("origin", editOrigin || "");
            fd.append("application", editApplication || "");

            // ✅ If user selects new images, backend will replace images
            editImages.forEach((f) => fd.append("productImages", f));

            const res = await fetch(`${PRODUCT_API}/edit/${editId}`, { method: "PUT", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");

            cancelEdit();
            await fetchAll();
        } catch (e2) {
            setErr(e2.message);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Delete this product?");
        if (!ok) return;

        setErr("");
        try {
            const res = await fetch(`${PRODUCT_API}/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Delete failed");
            if (viewId === id) setViewId(null);
            await fetchAll();
        } catch (e) {
            setErr(e.message);
        }
    };

    const card = (children) => ({
        background: THEME.card,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
        padding: 16,
        ...children,
    });

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
                        maxWidth: 1200,
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
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Product Management</div>
                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                                Website-style cards • add/edit/delete products
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            fetchCategories();
                            fetchSubCategories();
                            fetchAll();
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

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 18 }}>
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

                {/* ✅ Create/Edit Form */}
                <div style={card({ marginBottom: 14 })}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: THEME.black }}>
                            {editId ? "Edit Product" : "Add Product"}
                        </div>

                        {editId ? (
                            <button onClick={cancelEdit} style={btnStyle("secondary")}>
                                Cancel
                            </button>
                        ) : null}
                    </div>

                    <form onSubmit={editId ? handleUpdate : handleCreate}>
                        {/* Row 1: Category + Subcategory + Product + Price */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1.2fr 0.7fr",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <div>
                                <div style={labelStyle}>Category</div>
                                <select
                                    value={editId ? editCategoryName : categoryName}
                                    onChange={(e) => {
                                        if (editId) {
                                            setEditCategoryName(e.target.value);
                                            setEditSubCategoryName("");
                                        } else {
                                            setCategoryName(e.target.value);
                                            setSubCategoryName("");
                                        }
                                    }}
                                    style={inputStyle}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c.categoryName}>
                                            {c.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div style={labelStyle}>SubCategory</div>
                                <select
                                    value={editId ? editSubCategoryName : subCategoryName}
                                    onChange={(e) => (editId ? setEditSubCategoryName(e.target.value) : setSubCategoryName(e.target.value))}
                                    style={inputStyle}
                                >
                                    <option value="">Select SubCategory</option>
                                    {subOptions.map((s) => (
                                        <option key={s._id} value={s.subCategoryName}>
                                            {s.subCategoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div style={labelStyle}>Product Name</div>
                                <input
                                    value={editId ? editProductName : productName}
                                    onChange={(e) => (editId ? setEditProductName(e.target.value) : setProductName(e.target.value))}
                                    placeholder="Eg: Statuario White Marble"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Price</div>
                                <input
                                    type="number"
                                    value={editId ? editPrice : price}
                                    onChange={(e) => (editId ? setEditPrice(e.target.value) : setPrice(e.target.value))}
                                    placeholder="Eg: 320"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Row 2: Marble fields */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <div>
                                <div style={labelStyle}>Marble Type</div>
                                <input
                                    value={editId ? editMarbleType : marbleType}
                                    onChange={(e) => (editId ? setEditMarbleType(e.target.value) : setMarbleType(e.target.value))}
                                    placeholder="Italian / Indian / Onyx"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Color</div>
                                <input
                                    value={editId ? editColor : color}
                                    onChange={(e) => (editId ? setEditColor(e.target.value) : setColor(e.target.value))}
                                    placeholder="White / Black / Green"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Finish</div>
                                <input
                                    value={editId ? editFinish : finish}
                                    onChange={(e) => (editId ? setEditFinish(e.target.value) : setFinish(e.target.value))}
                                    placeholder="Polished / Honed"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Thickness (mm)</div>
                                <input
                                    type="number"
                                    value={editId ? editThicknessMM : thicknessMM}
                                    onChange={(e) => (editId ? setEditThicknessMM(e.target.value) : setThicknessMM(e.target.value))}
                                    placeholder="18"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Row 3: size/origin/application */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1.4fr",
                                gap: 12,
                                marginBottom: 12,
                            }}
                        >
                            <div>
                                <div style={labelStyle}>Size</div>
                                <input
                                    value={editId ? editSize : size}
                                    onChange={(e) => (editId ? setEditSize(e.target.value) : setSize(e.target.value))}
                                    placeholder="8x4"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Origin</div>
                                <input
                                    value={editId ? editOrigin : origin}
                                    onChange={(e) => (editId ? setEditOrigin(e.target.value) : setOrigin(e.target.value))}
                                    placeholder="Italy / Rajasthan"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>Application</div>
                                <input
                                    value={editId ? editApplication : application}
                                    onChange={(e) => (editId ? setEditApplication(e.target.value) : setApplication(e.target.value))}
                                    placeholder="Flooring, Wall Cladding"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Row 4: description + images */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 8 }}>
                            <div>
                                <div style={labelStyle}>Description</div>
                                <textarea
                                    value={editId ? editDescription : description}
                                    onChange={(e) => (editId ? setEditDescription(e.target.value) : setDescription(e.target.value))}
                                    placeholder="Write product details..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>

                            <div>
                                <div style={labelStyle}>
                                    {editId ? "New Images (optional, replaces old)" : "Product Images (multiple)"}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = pickFiles(e.target.files);

                                        if (editId) {
                                            // cleanup old previews
                                            editPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
                                            setEditImages(files);
                                            setEditPreviews(files.map((f) => URL.createObjectURL(f)));
                                        } else {
                                            createPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
                                            setImages(files);
                                            setCreatePreviews(files.map((f) => URL.createObjectURL(f)));
                                        }
                                    }}
                                    style={{ ...inputStyle, padding: "8px 10px" }}
                                />

                                {/* Preview */}
                                <div style={{ marginTop: 10 }}>
                                    {!editId ? (
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {createPreviews.map((u, i) => (
                                                <Img key={u + i} src={u} alt="new" size={54} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            <div>
                                                <div style={{ fontSize: "12px", color: THEME.sub, marginBottom: 6 }}>Old Images</div>
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                    {oldImages.slice(0, 6).map((p, i) => (
                                                        <Img key={p + i} src={getImageUrl(p)} alt="old" size={54} />
                                                    ))}
                                                    {oldImages.length > 6 ? (
                                                        <div style={{ fontSize: "12px", color: THEME.sub, alignSelf: "center" }}>
                                                            +{oldImages.length - 6} more
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: "12px", color: THEME.sub, marginBottom: 6 }}>New Images</div>
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                    {editPreviews.map((u, i) => (
                                                        <Img key={u + i} src={u} alt="new" size={54} />
                                                    ))}
                                                    {editPreviews.length === 0 ? (
                                                        <div style={{ fontSize: "12px", color: THEME.sub }}>No new images selected</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                            <button
                                type="submit"
                                style={btnStyle("primary")}
                                onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                            >
                                {editId ? "Update Product" : "Add Product"}
                            </button>
                        </div>

                        <div style={{ marginTop: 10, fontSize: "13px", color: THEME.sub }}>
                            Tip: This is a website-style UI (cards). No table. Click “View” to open product details.
                        </div>
                    </form>
                </div>

                {/* ✅ Website-style layout (Cards + Details Panel) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
                    {/* Left: Product cards */}
                    <div style={card({})}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: THEME.black }}>Products</div>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search product / category / subcategory..."
                                style={{ ...inputStyle, maxWidth: 360 }}
                            />
                        </div>

                        {loading ? (
                            <div style={{ padding: 14, fontSize: "13px", color: THEME.sub }}>Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: 14, fontSize: "13px", color: THEME.sub }}>No products found.</div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                                {filtered.map((p) => {
                                    const cover = Array.isArray(p.productImages) && p.productImages.length > 0 ? getImageUrl(p.productImages[0]) : "";
                                    const active = viewId === p._id;

                                    return (
                                        <div
                                            key={p._id}
                                            style={{
                                                border: `1px solid ${active ? THEME.primary : THEME.border}`,
                                                borderRadius: 16,
                                                overflow: "hidden",
                                                background: "#fff",
                                                boxShadow: active ? "0 12px 26px rgba(141,86,96,0.16)" : "0 10px 20px rgba(0,0,0,0.03)",
                                                transition: "all 0.18s ease",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setViewId(p._id)}
                                        >
                                            <div style={{ height: 150, background: "#faf9fb" }}>
                                                <img
                                                    src={cover}
                                                    alt="cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </div>

                                            <div style={{ padding: 12 }}>
                                                <div style={{ fontSize: "14px", fontWeight: 800, color: THEME.black, lineHeight: 1.25 }}>
                                                    {p.productName}
                                                </div>
                                                <div style={{ fontSize: "13px", color: THEME.sub, marginTop: 6 }}>
                                                    {p.categoryName} • {p.subCategoryName}
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                                                    <div style={{ fontSize: "14px", fontWeight: 800, color: THEME.dark }}>
                                                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        style={btnStyle("secondary")}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEdit(p);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                                                    <button
                                                        type="button"
                                                        style={btnStyle("primary")}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewId(p._id);
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        style={btnStyle("danger")}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(p._id);
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = THEME.black)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ marginTop: 12, fontSize: "13px", color: THEME.sub }}>
                            Total: <b style={{ color: THEME.black }}>{filtered.length}</b>
                        </div>
                    </div>

                    {/* Right: Details panel */}
                    <div style={card({ position: "sticky", top: 86, height: "fit-content" })}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: THEME.black, marginBottom: 10 }}>
                            Product Details
                        </div>

                        {!viewed ? (
                            <div style={{ fontSize: "13px", color: THEME.sub }}>
                                Select any product card to view details.
                            </div>
                        ) : (
                            <>
                                {/* Gallery */}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                                    {(viewed.productImages || []).slice(0, 8).map((p, i) => (
                                        <Img key={p + i} src={getImageUrl(p)} alt="img" size={64} />
                                    ))}
                                </div>

                                <div style={{ fontSize: "14px", fontWeight: 900, color: THEME.black }}>
                                    {viewed.productName}
                                </div>
                                <div style={{ fontSize: "13px", color: THEME.sub, marginTop: 6 }}>
                                    {viewed.categoryName} • {viewed.subCategoryName}
                                </div>

                                <div style={{ marginTop: 10, fontSize: "14px", fontWeight: 900, color: THEME.dark }}>
                                    ₹{Number(viewed.price || 0).toLocaleString("en-IN")}
                                </div>

                                {/* Specs */}
                                <div
                                    style={{
                                        marginTop: 12,
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: 14,
                                        padding: 12,
                                        background: "#faf9fb",
                                    }}
                                >
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: THEME.dark, marginBottom: 8 }}>
                                        Specifications
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "13px", color: THEME.black }}>
                                        <div><span style={{ color: THEME.sub }}>Marble Type:</span> {viewed.marbleType || "-"}</div>
                                        <div><span style={{ color: THEME.sub }}>Color:</span> {viewed.color || "-"}</div>
                                        <div><span style={{ color: THEME.sub }}>Finish:</span> {viewed.finish || "-"}</div>
                                        <div><span style={{ color: THEME.sub }}>Thickness:</span> {viewed.thicknessMM || 0} mm</div>
                                        <div><span style={{ color: THEME.sub }}>Size:</span> {viewed.size || "-"}</div>
                                        <div><span style={{ color: THEME.sub }}>Origin:</span> {viewed.origin || "-"}</div>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <span style={{ color: THEME.sub }}>Application:</span> {viewed.application || "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: THEME.dark, marginBottom: 6 }}>
                                        Description
                                    </div>
                                    <div style={{ fontSize: "13px", color: THEME.black, lineHeight: 1.6 }}>
                                        {viewed.description || "-"}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                                    <button type="button" style={btnStyle("secondary")} onClick={() => startEdit(viewed)}>
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        style={btnStyle("danger")}
                                        onClick={() => handleDelete(viewed._id)}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary)}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = THEME.black)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                {editId ? (
                                    <div style={{ marginTop: 12, fontSize: "12px", color: THEME.sub }}>
                                        Editing mode is active. Update from the form above.
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;
