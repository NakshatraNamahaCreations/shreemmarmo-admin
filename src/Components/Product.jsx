import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PRODUCT_API = "https://api.shreemmarmo.com/api/product";
const BASE_URL = "https://api.shreemmarmo.com";

/** ✅ Amazon-competitor-ish theme (your colors, more premium) */
const THEME = {
    primary: "#8D5660",
    primary2: "#8D5662",
    dark: "#2F2E3B",
    black: "#0B0F14",
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E7E5EA",
    sub: "#6B7280",
    text: "#111827",
    chip: "#F2EEF0",
    shadow: "0 14px 30px rgba(16, 24, 40, 0.08)",
    shadow2: "0 20px 60px rgba(16, 24, 40, 0.12)",
};

const getImageUrl = (p) => {
    try {
        if (!p) return "";
        if (p.startsWith("http")) return p;
        return `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`;
    } catch {
        return "";
    }
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function useIsMobile(breakpoint = 980) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpoint]);
    return isMobile;
}

/** ---------- UI atoms ---------- */
const Spinner = ({ size = 18 }) => (
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
                    borderRadius: 18,
                    boxShadow: THEME.shadow2,
                    padding: "14px 16px",
                    minWidth: 260,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "Poppins",
                }}
            >
                <Spinner size={18} />
                <div style={{ fontSize: 13, fontWeight: 900, color: THEME.dark }}>{label}</div>
            </div>
        </div>
    );
};

const Pill = ({ children }) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 999,
            background: THEME.chip,
            border: `1px solid ${THEME.border}`,
            fontSize: 12,
            fontWeight: 800,
            color: THEME.dark,
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </span>
);

const btn = (type = "secondary") => {
    const base = {
        fontFamily: "Poppins",
        fontSize: "13px",
        padding: "10px 14px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 900,
        border: "1px solid transparent",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
    };
    if (type === "primary") return { ...base, background: THEME.primary, color: "#fff", borderColor: THEME.primary };
    if (type === "danger") return { ...base, background: THEME.black, color: "#fff", borderColor: THEME.black };
    return { ...base, background: "#F3F1F4", color: THEME.dark, borderColor: THEME.border };
};

const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "13px",
    padding: "10px 12px",
    border: `1px solid ${THEME.border}`,
    borderRadius: 12,
    outline: "none",
    width: "100%",
    background: THEME.card,
    color: THEME.text,
};

function Product() {
    const navigate = useNavigate();
    const isMobile = useIsMobile(980);

    const [products, setProducts] = useState([]);

    // ui
    const [bootLoading, setBootLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [err, setErr] = useState("");
    const [q, setQ] = useState("");

    // drawer
    const [openForm, setOpenForm] = useState(false);
    const [editId, setEditId] = useState(null);

    // ✅ MODEL FIELDS ONLY
    const [MarbleName, setMarbleName] = useState("");
    const [lenthincm, setLenthincm] = useState("");
    const [widthincm, setWidthincm] = useState("");
    const [noofslabs, setNoofslabs] = useState("");
    const [description, setDescription] = useState("");

    /**
     * ✅ IMPORTANT CHANGE:
     * You can pick images multiple times:
     * - first pick 2
     * - later pick 3 more
     * => total 5 (append)
     *
     * previews = [{ id, url, file, key }]
     * images = derived from previews (files)
     */
    const [previews, setPreviews] = useState([]); // array of objects
    const [images, setImages] = useState([]); // File[]
    const [oldImages, setOldImages] = useState([]);

    const fileInputRef = useRef(null);

    const [imgLoaded, setImgLoaded] = useState({});

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return products;
        return products.filter((p) => {
            const name = (p.MarbleName || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            return name.includes(s) || desc.includes(s);
        });
    }, [q, products]);

    const cleanupPreviewBlobs = useCallback((list) => {
        try {
            (list || []).forEach((p) => {
                if (p?.url?.startsWith("blob:")) URL.revokeObjectURL(p.url);
            });
        } catch { }
    }, []);

    const syncImagesFromPreviews = useCallback((list) => {
        try {
            setImages((list || []).map((p) => p.file).filter(Boolean));
        } catch {
            setImages([]);
        }
    }, []);

    const resetForm = useCallback(() => {
        setEditId(null);
        setMarbleName("");
        setLenthincm("");
        setWidthincm("");
        setNoofslabs("");
        setDescription("");
        setOldImages([]);

        // clear new image previews
        cleanupPreviewBlobs(previews);
        setPreviews([]);
        setImages([]);

        // reset input so selecting same files again triggers onChange
        try {
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch { }
    }, [cleanupPreviewBlobs, previews]);

    const openAdd = () => {
        resetForm();
        setOpenForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openEdit = (item) => {
        try {
            setEditId(item._id);
            setMarbleName(item.MarbleName || "");
            setLenthincm(String(item.lenthincm ?? ""));
            setWidthincm(String(item.widthincm ?? ""));
            setNoofslabs(String(item.noofslabs ?? ""));
            setDescription(item.description || "");

            setOldImages(Array.isArray(item.productImages) ? item.productImages : []);

            // clear new images (you can add again)
            cleanupPreviewBlobs(previews);
            setPreviews([]);
            setImages([]);

            try {
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch { }

            setOpenForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setErr("Failed to open edit form");
        }
    };

    const closeForm = () => {
        setOpenForm(false);
        resetForm();
    };

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
                await fetchProducts();
            } catch (e) {
                setErr(e?.message || "Failed to load page data");
            } finally {
                setBootLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** ✅ APPEND IMAGES (multiple times) + single delete option */
    const onPickImages = (filesList) => {
        try {
            const incoming = Array.from(filesList || []);
            if (incoming.length === 0) return;

            // limit total images to 10
            const MAX = 10;

            setPreviews((prev) => {
                try {
                    const prevList = Array.isArray(prev) ? prev : [];

                    // avoid duplicates (same name+size+lastModified)
                    const seen = new Set(prevList.map((p) => p.key));
                    const nextAdd = [];

                    for (const f of incoming) {
                        const key = `${f.name}-${f.size}-${f.lastModified}`;
                        if (seen.has(key)) continue;
                        seen.add(key);

                        nextAdd.push({
                            id: `${key}-${Math.random().toString(16).slice(2)}`,
                            key,
                            file: f,
                            url: URL.createObjectURL(f),
                        });
                    }

                    const merged = [...prevList, ...nextAdd].slice(0, MAX);

                    // sync images files
                    syncImagesFromPreviews(merged);

                    return merged;
                } catch (e) {
                    console.log(e);
                    return prev;
                }
            });

            // reset file input so user can pick the same file again
            try {
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch { }
        } catch {
            setErr("Failed to pick images");
        }
    };

    const removeOneImage = (id) => {
        try {
            setPreviews((prev) => {
                const prevList = Array.isArray(prev) ? prev : [];
                const target = prevList.find((p) => p.id === id);

                if (target?.url?.startsWith("blob:")) {
                    try {
                        URL.revokeObjectURL(target.url);
                    } catch { }
                }

                const next = prevList.filter((p) => p.id !== id);
                syncImagesFromPreviews(next);
                return next;
            });
        } catch (e) {
            console.log(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            if (!MarbleName.trim()) return setErr("MarbleName is required");
            if (lenthincm === "" || lenthincm === undefined) return setErr("lenthincm is required");
            if (widthincm === "" || widthincm === undefined) return setErr("widthincm is required");
            if (noofslabs === "" || noofslabs === undefined) return setErr("noofslabs is required");

            // create requires images
            if (!editId && images.length === 0) return setErr("productImages are required");

            setSaving(true);

            const fd = new FormData();
            fd.append("MarbleName", MarbleName.trim());
            fd.append("lenthincm", lenthincm);
            fd.append("widthincm", widthincm);
            fd.append("noofslabs", noofslabs);
            fd.append("description", description || "");

            // ✅ send ALL selected images (merged from multiple picks)
            images.forEach((f) => fd.append("productImages", f)); // multer should be upload.array("productImages")

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
        } finally {
            setRefreshing(false);
        }
    };

    const cols = useMemo(() => {
        if (isMobile) return "1fr";
        return "repeat(4, minmax(0, 1fr))";
    }, [isMobile]);

    return (
        <div style={{ fontFamily: "Poppins", background: THEME.bg, minHeight: "100vh" }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -450px 0; } 100% { background-position: 450px 0; } }
        .cardHover:hover { transform: translateY(-2px); box-shadow: ${THEME.shadow2}; }
        .cardHover { transition: all .18s ease; }
      `}</style>

            <LoaderOverlay
                show={bootLoading || saving}
                label={saving ? (editId ? "Updating marble..." : "Saving marble...") : "Loading inventory..."}
            />

            {/* Header */}
            <div
                style={{
                    background: `linear-gradient(90deg, ${THEME.dark}, #22212b)`,
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        maxWidth: 1300,
                        margin: "0 auto",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 14,
                                background: THEME.primary,
                                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
                            }}
                        />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 0.2 }}>
                                Add Product
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 700 }}>
                                Manage slabs, sizes, and images
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ minWidth: isMobile ? 160 : 380 }}>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search marble name / description..."
                                style={{
                                    ...inputStyle,
                                    background: "rgba(255,255,255,0.10)",
                                    borderColor: "rgba(255,255,255,0.18)",
                                    color: "#fff",
                                }}
                                disabled={bootLoading || saving}
                            />
                        </div>

                        <button
                            onClick={handleRefresh}
                            style={{
                                ...btn("secondary"),
                                background: "rgba(255,255,255,0.10)",
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.18)",
                            }}
                            disabled={refreshing || bootLoading || saving}
                            title={refreshing ? "Refreshing..." : "Refresh"}
                        >
                            {refreshing ? <Spinner size={14} /> : null}
                            Refresh
                        </button>

                        <button
                            onClick={openAdd}
                            style={btn("primary")}
                            onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                            disabled={bootLoading || saving}
                        >
                            + Add Product
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1300, margin: "0 auto", padding: 16 }}>
                {/* Error */}
                {err ? (
                    <div
                        style={{
                            background: "#fff",
                            border: `1px solid ${THEME.border}`,
                            borderLeft: `5px solid ${THEME.primary}`,
                            padding: "10px 12px",
                            borderRadius: 14,
                            fontSize: 13,
                            color: THEME.text,
                            boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
                            marginBottom: 12,
                        }}
                    >
                        <b style={{ color: THEME.primary }}>Error:</b> {err}
                    </div>
                ) : null}

                {/* Add/Edit Drawer */}
                {openForm ? (
                    <div
                        style={{
                            background: THEME.card,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: 18,
                            boxShadow: THEME.shadow,
                            padding: 16,
                            marginBottom: 14,
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: THEME.text }}>
                                {editId ? "Edit Marble" : "Add Marble"}
                            </div>
                            <button onClick={closeForm} style={btn("secondary")} disabled={saving}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr 1fr 1fr",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>Marble Name</div>
                                    <input value={MarbleName} onChange={(e) => setMarbleName(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>Length (cm)</div>
                                    <input type="number" value={lenthincm} onChange={(e) => setLenthincm(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>Width (cm)</div>
                                    <input type="number" value={widthincm} onChange={(e) => setWidthincm(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>No. of slabs</div>
                                    <input type="number" value={noofslabs} onChange={(e) => setNoofslabs(e.target.value)} style={inputStyle} disabled={saving} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>Description</div>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: THEME.dark }}>
                                        {editId ? "Add More Images (optional)" : "Product Images (required)"}
                                    </div>

                                    {/* ✅ pick multiple times (append) */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => onPickImages(e.target.files)}
                                        style={{ ...inputStyle, padding: "8px 10px" }}
                                        disabled={saving}
                                    />

                                    <div style={{ marginTop: 8, fontSize: 12, color: THEME.sub, fontWeight: 800 }}>
                                        Selected new images: <span style={{ color: THEME.text }}>{previews.length}</span> / 10
                                    </div>

                                    {/* old images (view only) */}
                                    {editId ? (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 12, color: THEME.sub, marginBottom: 6, fontWeight: 800 }}>Old Images</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                {oldImages.slice(0, 10).map((p, i) => (
                                                    <img
                                                        key={p + i}
                                                        src={getImageUrl(p)}
                                                        alt="old"
                                                        style={{
                                                            width: 54,
                                                            height: 54,
                                                            borderRadius: 14,
                                                            objectFit: "cover",
                                                            border: `1px solid ${THEME.border}`,
                                                        }}
                                                        onError={(e) => {
                                                            try {
                                                                e.currentTarget.style.display = "none";
                                                            } catch { }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* ✅ new previews with single delete */}
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ fontSize: 12, color: THEME.sub, marginBottom: 6, fontWeight: 800 }}>New Images</div>

                                        {previews.length === 0 ? (
                                            <div style={{ fontSize: 12, color: THEME.sub }}>No new images selected</div>
                                        ) : (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                                {previews.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        style={{
                                                            width: 78,
                                                            borderRadius: 14,
                                                            border: `1px solid ${THEME.border}`,
                                                            overflow: "hidden",
                                                            background: "#fff",
                                                        }}
                                                    >
                                                        <div style={{ width: "100%", height: 60, background: "#faf9fb" }}>
                                                            <img
                                                                src={p.url}
                                                                alt="new"
                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                onError={(e) => {
                                                                    try {
                                                                        e.currentTarget.style.display = "none";
                                                                    } catch { }
                                                                }}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            style={{
                                                                ...btn("danger"),
                                                                width: "100%",
                                                                padding: "7px 8px",
                                                                borderRadius: 0,
                                                                fontSize: 11,
                                                            }}
                                                            onClick={() => removeOneImage(p.id)}
                                                            disabled={saving}
                                                            title="Remove this image"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                                <button type="submit" style={btn("primary")} disabled={saving}>
                                    {saving ? <Spinner size={14} /> : null}
                                    {editId ? "Update Marble" : "Save Marble"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}

                {/* Grid */}
                <div
                    style={{
                        background: THEME.card,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 18,
                        boxShadow: THEME.shadow,
                        padding: 14,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: THEME.text }}>All Marbles</div>
                        <div style={{ fontSize: 12, color: THEME.sub, fontWeight: 800 }}>
                            Total: <span style={{ color: THEME.text }}>{filtered.length}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: 10, fontSize: 13, color: THEME.sub, display: "flex", alignItems: "center", gap: 10 }}>
                            <Spinner size={16} />
                            Loading products...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 10, fontSize: 13, color: THEME.sub }}>No products found.</div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12 }}>
                            {filtered.map((p) => {
                                const cover =
                                    Array.isArray(p.productImages) && p.productImages.length > 0
                                        ? getImageUrl(p.productImages[0])
                                        : "";
                                const isDeleting = deletingId === p._id;
                                const isLoaded = !!imgLoaded[p._id];

                                const L = Number(p.lenthincm || 0);
                                const W = Number(p.widthincm || 0);
                                const slabs = Number(p.noofslabs || 0);

                                const tag =
                                    slabs >= 80 ? "High Stock" : slabs >= 30 ? "Available" : slabs > 0 ? "Low Stock" : "Out of stock";

                                return (
                                    <div
                                        key={p._id}
                                        className="cardHover"
                                        style={{
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: 18,
                                            overflow: "hidden",
                                            background: "#fff",
                                            boxShadow: THEME.shadow,
                                            opacity: isDeleting ? 0.72 : 1,
                                            transform: "translateY(0)",
                                        }}
                                    >
                                        {/* image */}
                                        <div style={{ height: 190, background: "#faf9fb", position: "relative" }}>
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

                                            {/* badges */}
                                            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, flexWrap: "wrap", zIndex: 2 }}>
                                                <Pill>{tag}</Pill>
                                                <Pill>Slabs: {slabs}</Pill>
                                            </div>

                                            <img
                                                src={cover}
                                                alt="cover"
                                                onLoad={() => setImgLoaded((prev) => ({ ...prev, [p._id]: true }))}
                                                onError={(e) => {
                                                    try {
                                                        e.currentTarget.style.display = "none";
                                                        setImgLoaded((prev) => ({ ...prev, [p._id]: true }));
                                                    } catch { }
                                                }}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: cover ? "block" : "none" }}
                                            />

                                            {isDeleting ? (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: 12,
                                                        right: 12,
                                                        background: "rgba(255,255,255,0.92)",
                                                        border: `1px solid ${THEME.border}`,
                                                        padding: "6px 10px",
                                                        borderRadius: 999,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        fontSize: 12,
                                                        fontWeight: 900,
                                                        zIndex: 3,
                                                    }}
                                                >
                                                    <Spinner size={12} />
                                                    Deleting...
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* body */}
                                        <div style={{ padding: 12 }}>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: THEME.text, lineHeight: 1.25 }}>
                                                {p.MarbleName || "-"}
                                            </div>

                                            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                <Pill>{L.toLocaleString("en-IN")} cm</Pill>
                                                <Pill>{W.toLocaleString("en-IN")} cm</Pill>
                                                <Pill>Area: {clamp((L * W) / 10000, 0, 999999999).toLocaleString("en-IN")} m²</Pill>
                                            </div>

                                            {p.description ? (
                                                <div style={{ fontSize: 12, color: THEME.sub, marginTop: 10, lineHeight: 1.45 }}>
                                                    {String(p.description).slice(0, 95)}
                                                    {String(p.description).length > 95 ? "..." : ""}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: 12, color: THEME.sub, marginTop: 10 }}>No description</div>
                                            )}

                                            {/* actions */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                                                <button type="button" style={btn("secondary")} onClick={() => openEdit(p)} disabled={isDeleting || saving}>
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    style={btn("primary")}
                                                    onClick={() => navigate(`/Productdetails/${p._id}`)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                                                    disabled={isDeleting || saving}
                                                >
                                                    View
                                                </button>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                                                <button
                                                    type="button"
                                                    style={btn("danger")}
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
                </div>
            </div>
        </div>
    );
}

export default Product;
