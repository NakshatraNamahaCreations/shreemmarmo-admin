import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const PRODUCT_API = "https://shreemarmo-backend.onrender.com/api/product";
const CATEGORY_API = "https://shreemarmo-backend.onrender.com/api/category";
const SUB_API = "https://shreemarmo-backend.onrender.com/api/subcategory";
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
        fontWeight: 700,
        border: "1px solid transparent",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
    };
    if (type === "primary")
        return {
            ...base,
            background: THEME.primary,
            color: "#fff",
            borderColor: THEME.primary,
        };
    if (type === "danger")
        return { ...base, background: THEME.black, color: "#fff", borderColor: THEME.black };
    return { ...base, background: "#f3f1f4", color: THEME.dark, borderColor: THEME.border };
};

const getImageUrl = (p) => {
    try {
        if (!p) return "";
        if (p.startsWith("http")) return p;
        return `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`;
    } catch (e) {
        return "";
    }
};

// ---------- Loader UI ----------
const Spinner = ({ size = 18 }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: "2px solid rgba(0,0,0,0.15)",
                borderTopColor: THEME.primary,
                animation: "spin 0.8s linear infinite",
            }}
        />
    );
};

const LoaderOverlay = ({ show, label = "Loading..." }) => {
    if (!show) return null;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.18)",
                backdropFilter: "blur(2px)",
                zIndex: 9999,
                display: "grid",
                placeItems: "center",
                padding: 16,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 16,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                    padding: "14px 16px",
                    minWidth: 220,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "Poppins",
                }}
            >
                <Spinner size={18} />
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.dark }}>{label}</div>
            </div>
        </div>
    );
};

const InlineLoader = ({ text = "Loading..." }) => (
    <div style={{ padding: 10, fontSize: 13, color: THEME.sub, display: "flex", alignItems: "center", gap: 10 }}>
        <Spinner size={16} />
        <span style={{ fontFamily: "Poppins", fontWeight: 700 }}>{text}</span>
    </div>
);

function Product() {
    const navigate = useNavigate();

    // lists
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    // ui
    const [bootLoading, setBootLoading] = useState(false); // initial page loader
    const [loading, setLoading] = useState(false); // product list loader
    const [saving, setSaving] = useState(false); // submit loader
    const [deletingId, setDeletingId] = useState(null); // row/card loader
    const [refreshing, setRefreshing] = useState(false); // refresh button loader

    const [err, setErr] = useState("");
    const [q, setQ] = useState("");

    // ✅ modal-like form open/close
    const [openForm, setOpenForm] = useState(false);

    // ✅ edit
    const [editId, setEditId] = useState(null);

    // form fields (used for both add/edit)
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

    const [images, setImages] = useState([]); // new upload images
    const [previews, setPreviews] = useState([]); // blob urls

    // old images (only for edit view)
    const [oldImages, setOldImages] = useState([]);

    // per-card image loading (skeleton)
    const [imgLoaded, setImgLoaded] = useState({}); // { [productId]: true }

    const card = (extra = {}) => ({
        background: THEME.card,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
        ...extra,
    });

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return products;
        return products.filter((p) => {
            return (
                (p.productName || "").toLowerCase().includes(s) ||
                (p.categoryName || "").toLowerCase().includes(s) ||
                (p.subCategoryName || "").toLowerCase().includes(s)
            );
        });
    }, [q, products]);

    const subOptions = useMemo(() => {
        if (!categoryName) return subcategories;
        return subcategories.filter((s) => s.categoryName === categoryName);
    }, [subcategories, categoryName]);

    const cleanupPreviewBlobs = useCallback(() => {
        try {
            previews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
        } catch (e) {
            // ignore
        }
    }, [previews]);

    const resetForm = useCallback(() => {
        setEditId(null);
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
        setOldImages([]);
        cleanupPreviewBlobs();
        setPreviews([]);
    }, [cleanupPreviewBlobs]);

    const openAdd = () => {
        resetForm();
        setOpenForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openEdit = (item) => {
        try {
            setEditId(item._id);
            setCategoryName(item.categoryName || "");
            setSubCategoryName(item.subCategoryName || "");
            setProductName(item.productName || "");
            setPrice(String(item.price ?? ""));
            setDescription(item.description || "");
            setMarbleType(item.marbleType || "");
            setColor(item.color || "");
            setFinish(item.finish || "");
            setThicknessMM(String(item.thicknessMM ?? ""));
            setSize(item.size || "");
            setOrigin(item.origin || "");
            setApplication(item.application || "");

            setOldImages(Array.isArray(item.productImages) ? item.productImages : []);

            setImages([]);
            cleanupPreviewBlobs();
            setPreviews([]);

            setOpenForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            setErr("Failed to open edit form");
        }
    };

    const closeForm = () => {
        setOpenForm(false);
        resetForm();
    };

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${CATEGORY_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch categories");
            setCategories(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            throw e;
        }
    }, []);

    const fetchSubCategories = useCallback(async () => {
        try {
            const res = await fetch(`${SUB_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch subcategories");
            setSubcategories(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            throw e;
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${PRODUCT_API}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch products");
            setProducts(Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
            setErr(e?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            setBootLoading(true);
            setErr("");
            try {
                await fetchCategories();
                await fetchSubCategories();
                await fetchProducts();
            } catch (e) {
                setErr(e?.message || "Failed to load page data");
            } finally {
                setBootLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPickImages = (filesList) => {
        try {
            const arr = Array.from(filesList || []).slice(0, 10);
            setImages(arr);

            cleanupPreviewBlobs();
            setPreviews(arr.map((f) => URL.createObjectURL(f)));
        } catch (e) {
            setErr("Failed to pick images");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!categoryName) return setErr("categoryName is required");
            if (!subCategoryName) return setErr("subCategoryName is required");
            if (!productName.trim()) return setErr("productName is required");
            if (!price) return setErr("price is required");

            // ✅ create requires images
            if (!editId && images.length === 0) return setErr("productImages are required");

            setSaving(true);

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

            const url = editId ? `${PRODUCT_API}/edit/${editId}` : `${PRODUCT_API}/create`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, { method, body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Save failed");

            await fetchProducts();
            closeForm();
        } catch (e2) {
            setErr(e2?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Delete this product?");
        if (!ok) return;

        setErr("");
        setDeletingId(id);
        try {
            const res = await fetch(`${PRODUCT_API}/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Delete failed");
            await fetchProducts();
        } catch (e) {
            setErr(e?.message || "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchProducts();
        } catch (e) {
            // fetchProducts already sets error
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div style={{ fontFamily: "Poppins", background: THEME.bg, minHeight: "100vh" }}>
            {/* keyframes */}
            <style>
                {`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer {
            0% { background-position: -450px 0; }
            100% { background-position: 450px 0; }
          }
        `}
            </style>

            {/* ✅ Dynamic full-screen loader */}
            <LoaderOverlay
                show={bootLoading || saving}
                label={saving ? (editId ? "Updating product..." : "Saving product...") : "Loading data..."}
            />

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
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: THEME.primary }} />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Products</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Card UI + Details Page</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={openAdd}
                            style={btnStyle("primary")}
                            onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                            disabled={bootLoading || saving}
                            title={bootLoading || saving ? "Please wait..." : "Add Product"}
                        >
                            + Add Product
                        </button>

                        <button
                            onClick={handleRefresh}
                            style={{
                                ...btnStyle("secondary"),
                                background: "rgba(255,255,255,0.10)",
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.18)",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                            disabled={refreshing || bootLoading || saving}
                            title={refreshing ? "Refreshing..." : "Refresh"}
                        >
                            {refreshing ? <Spinner size={14} /> : null}
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 18 }}>
                {/* Error */}
                {err ? (
                    <div
                        style={{
                            background: "#fff",
                            border: `1px solid ${THEME.border}`,
                            borderLeft: `5px solid ${THEME.primary}`,
                            padding: "10px 12px",
                            borderRadius: 12,
                            fontSize: 13,
                            color: THEME.black,
                            marginBottom: 12,
                        }}
                    >
                        <b style={{ color: THEME.primary }}>Error:</b> {err}
                    </div>
                ) : null}

                {/* ✅ Add/Edit Form Drawer */}
                {openForm ? (
                    <div style={card({ padding: 16, marginBottom: 14 })}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.black }}>
                                {editId ? "Edit Product" : "Add Product"}
                            </div>
                            <button onClick={closeForm} style={btnStyle("secondary")} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 0.7fr", gap: 12, marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>Category</div>
                                    <select
                                        value={categoryName}
                                        onChange={(e) => {
                                            setCategoryName(e.target.value);
                                            setSubCategoryName("");
                                        }}
                                        style={inputStyle}
                                        disabled={saving}
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
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>SubCategory</div>
                                    <select value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} style={inputStyle} disabled={saving}>
                                        <option value="">Select SubCategory</option>
                                        {subOptions.map((s) => (
                                            <option key={s._id} value={s.subCategoryName}>
                                                {s.subCategoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>Product Name</div>
                                    <input value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>Price</div>
                                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                                <input placeholder="Marble Type" value={marbleType} onChange={(e) => setMarbleType(e.target.value)} style={inputStyle} disabled={saving} />
                                <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={inputStyle} disabled={saving} />
                                <input placeholder="Finish" value={finish} onChange={(e) => setFinish(e.target.value)} style={inputStyle} disabled={saving} />
                                <input placeholder="Thickness (mm)" type="number" value={thicknessMM} onChange={(e) => setThicknessMM(e.target.value)} style={inputStyle} disabled={saving} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 12, marginBottom: 12 }}>
                                <input placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle} disabled={saving} />
                                <input placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} style={inputStyle} disabled={saving} />
                                <input placeholder="Application" value={application} onChange={(e) => setApplication(e.target.value)} style={inputStyle} disabled={saving} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>Description</div>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: THEME.dark }}>
                                        {editId ? "New Images (optional)" : "Product Images (required)"}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => onPickImages(e.target.files)}
                                        style={{ ...inputStyle, padding: "8px 10px" }}
                                        disabled={saving}
                                    />

                                    {/* old images */}
                                    {editId ? (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 12, color: THEME.sub, marginBottom: 6 }}>Old Images</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                {oldImages.slice(0, 6).map((p, i) => (
                                                    <img
                                                        key={p + i}
                                                        src={getImageUrl(p)}
                                                        alt="old"
                                                        style={{
                                                            width: 54,
                                                            height: 54,
                                                            borderRadius: 12,
                                                            objectFit: "cover",
                                                            border: `1px solid ${THEME.border}`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* new previews */}
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ fontSize: 12, color: THEME.sub, marginBottom: 6 }}>New Images</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {previews.map((u, i) => (
                                                <img
                                                    key={u + i}
                                                    src={u}
                                                    alt="new"
                                                    style={{
                                                        width: 54,
                                                        height: 54,
                                                        borderRadius: 12,
                                                        objectFit: "cover",
                                                        border: `1px solid ${THEME.border}`,
                                                    }}
                                                />
                                            ))}
                                            {previews.length === 0 ? <div style={{ fontSize: 12, color: THEME.sub }}>No new images selected</div> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                                <button type="submit" style={{ ...btnStyle("primary"), display: "flex", alignItems: "center", gap: 10 }} disabled={saving}>
                                    {saving ? <Spinner size={14} /> : null}
                                    {editId ? "Update Product" : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}

                {/* Search + Cards */}
                <div style={card({ padding: 16 })}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: THEME.black }}>All Products</div>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search product / category / subcategory..."
                            style={{ ...inputStyle, maxWidth: 360 }}
                            disabled={bootLoading || saving}
                        />
                    </div>

                    {loading ? (
                        <InlineLoader text="Loading products..." />
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 10, fontSize: 13, color: THEME.sub }}>No products found.</div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                            {filtered.map((p) => {
                                const cover = Array.isArray(p.productImages) && p.productImages.length > 0 ? getImageUrl(p.productImages[0]) : "";
                                const isDeleting = deletingId === p._id;
                                const isLoaded = !!imgLoaded[p._id];

                                return (
                                    <div
                                        key={p._id}
                                        style={{
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: 16,
                                            overflow: "hidden",
                                            background: "#fff",
                                            boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
                                            opacity: isDeleting ? 0.65 : 1,
                                        }}
                                    >
                                        <div style={{ height: 160, background: "#faf9fb", position: "relative" }}>
                                            {/* skeleton */}
                                            {!isLoaded ? (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        background: "linear-gradient(90deg, #f1eef2 25%, #f7f5f8 37%, #f1eef2 63%)",
                                                        backgroundSize: "900px 100%",
                                                        animation: "shimmer 1.2s ease-in-out infinite",
                                                    }}
                                                />
                                            ) : null}

                                            <img
                                                src={cover}
                                                alt="cover"
                                                onLoad={() => setImgLoaded((prev) => ({ ...prev, [p._id]: true }))}
                                                onError={(e) => {
                                                    try {
                                                        e.currentTarget.style.display = "none";
                                                        setImgLoaded((prev) => ({ ...prev, [p._id]: true }));
                                                    } catch (err) { }
                                                }}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: cover ? "block" : "none" }}
                                            />

                                            {/* deleting badge */}
                                            {isDeleting ? (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        background: "rgba(255,255,255,0.9)",
                                                        border: `1px solid ${THEME.border}`,
                                                        padding: "6px 10px",
                                                        borderRadius: 999,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        fontSize: 12,
                                                        fontWeight: 900,
                                                    }}
                                                >
                                                    <Spinner size={12} />
                                                    Deleting...
                                                </div>
                                            ) : null}
                                        </div>

                                        <div style={{ padding: 12 }}>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: THEME.black, lineHeight: 1.25 }}>{p.productName}</div>
                                            <div style={{ fontSize: 13, color: THEME.sub, marginTop: 6 }}>
                                                {p.categoryName} • {p.subCategoryName}
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                                                <div style={{ fontSize: 14, fontWeight: 900, color: THEME.dark }}>
                                                    ₹{Number(p.price || 0).toLocaleString("en-IN")}
                                                </div>
                                                <button type="button" style={btnStyle("secondary")} onClick={() => openEdit(p)} disabled={isDeleting || saving}>
                                                    Edit
                                                </button>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
                                                <button
                                                    type="button"
                                                    style={btnStyle("primary")}
                                                    onClick={() => navigate(`/Productdetails/${p._id}`)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                    disabled={isDeleting || saving}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    style={{ ...btnStyle("danger"), display: "flex", alignItems: "center", gap: 10 }}
                                                    onClick={() => handleDelete(p._id)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = THEME.black)}
                                                    disabled={isDeleting || saving}
                                                >
                                                    {isDeleting ? <Spinner size={14} /> : null}
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: 12, fontSize: 13, color: THEME.sub }}>
                        Total: <b style={{ color: THEME.black }}>{filtered.length}</b>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;
