import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PRODUCT_API = "https://shreemarmo-backend.onrender.com/api/product";
const BASE_URL = "https://shreemarmo-backend.onrender.com";

/** ✅ Amazon-competitor-ish theme (your colors + better typography) */
const THEME = {
    primary: "#8D5660",
    primary2: "#8D5662",
    dark: "#434252",
    black: "#0B0F14",
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E7E5EA",
    sub: "#6B7280",
    text: "#111827",
    chip: "#F2EEF0",
    shadow: "0 14px 30px rgba(16, 24, 40, 0.08)",
};

const btnBase = {
    fontFamily: "Poppins",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    border: `1px solid ${THEME.border}`,
    background: "#fff",
    color: THEME.dark,
    transition: "all 0.18s ease",
};

const getImageUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`;
};

function useIsMobile(breakpoint = 860) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpoint]);
    return isMobile;
}

function Stars({ value = 4.3 }) {
    const v = Math.max(0, Math.min(5, Number(value || 0)));
    const full = Math.floor(v);
    const half = v - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    const star = (fill) => (
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "block" }}>
            <path
                d="M12 17.3l-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.76 1.64 7.03z"
                fill={fill}
            />
        </svg>
    );

    return (
        <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: full }).map((_, i) => (
                <span key={`f-${i}`}>{star(THEME.primary)}</span>
            ))}
            {half ? <span>{star("#CFA9B0")}</span> : null}
            {Array.from({ length: empty }).map((_, i) => (
                <span key={`e-${i}`}>{star("#E5E7EB")}</span>
            ))}
            <span style={{ marginLeft: 6, fontSize: 13, color: THEME.sub, fontWeight: 700 }}>
                {v.toFixed(1)}
            </span>
        </div>
    );
}

function Chip({ children }) {
    return (
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
                fontWeight: 700,
                color: THEME.dark,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </span>
    );
}

function SpecRow({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${THEME.border}`,
                fontSize: 13,
            }}
        >
            <div style={{ color: THEME.sub, fontWeight: 700 }}>{label}</div>
            <div style={{ color: THEME.text, fontWeight: 800, textAlign: "right" }}>{value || "-"}</div>
        </div>
    );
}

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile(900);

    const [data, setData] = useState(null);
    const [activeImg, setActiveImg] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const fetchOne = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${PRODUCT_API}/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || "Failed to fetch product");
            const d = json?.data || null;
            setData(d);

            const first =
                d?.productImages?.length > 0 ? getImageUrl(d.productImages[0]) : "";
            setActiveImg(first);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOne();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const priceText = useMemo(() => {
        const p = Number(data?.price || 0);
        return `₹${p.toLocaleString("en-IN")}`;
    }, [data]);

    const images = useMemo(() => {
        const arr = Array.isArray(data?.productImages) ? data.productImages : [];
        return arr.map(getImageUrl);
    }, [data]);

    return (
        <div style={{ fontFamily: "Poppins", background: THEME.bg, minHeight: "100vh" }}>
            {/* ✅ Top Bar */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    background: `linear-gradient(90deg, ${THEME.dark}, #2f2e3b)`,
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
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
                                width: 34,
                                height: 34,
                                borderRadius: 12,
                                background: THEME.primary,
                                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
                            }}
                        />
                        <div style={{ color: "#fff" }}>
                            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.2 }}>
                                Product Details
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>Premium showroom view</div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            ...btnBase,
                            background: "rgba(255,255,255,0.12)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.18)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                    >
                        Back
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
                {/* ✅ Error */}
                {err ? (
                    <div
                        style={{
                            background: "#fff",
                            border: `1px solid ${THEME.border}`,
                            borderLeft: `5px solid ${THEME.primary}`,
                            padding: 12,
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

                {loading ? (
                    <div style={{ padding: 12, fontSize: 13, color: THEME.sub }}>Loading...</div>
                ) : !data ? (
                    <div style={{ padding: 12, fontSize: 13, color: THEME.sub }}>No data found.</div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
                            gap: 14,
                            alignItems: "start",
                        }}
                    >
                        {/* ✅ Left: Gallery */}
                        <div
                            style={{
                                background: THEME.card,
                                border: `1px solid ${THEME.border}`,
                                borderRadius: 18,
                                boxShadow: THEME.shadow,
                                overflow: "hidden",
                            }}
                        >
                            {/* hero image */}
                            <div
                                style={{
                                    background: "#faf9fb",
                                    padding: 12,
                                    borderBottom: `1px solid ${THEME.border}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "16/11",
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        border: `1px solid ${THEME.border}`,
                                        background: "#fff",
                                        position: "relative",
                                    }}
                                >
                                    {activeImg ? (
                                        <img
                                            src={activeImg}
                                            alt="active"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                        />
                                    ) : (
                                        <div style={{ padding: 20, color: THEME.sub, fontSize: 13 }}>
                                            No image
                                        </div>
                                    )}

                                    {/* top badges */}
                                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <Chip>Premium</Chip>
                                        <Chip>{data.finish || "Finish"}</Chip>
                                    </div>
                                </div>
                            </div>

                            {/* thumbnails */}
                            <div style={{ padding: 12 }}>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {images.length === 0 ? (
                                        <div style={{ fontSize: 13, color: THEME.sub }}>No images available</div>
                                    ) : (
                                        images.map((u, i) => {
                                            const active = u === activeImg;
                                            return (
                                                <button
                                                    key={u + i}
                                                    type="button"
                                                    onClick={() => setActiveImg(u)}
                                                    style={{
                                                        border: active ? `2px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                                                        borderRadius: 14,
                                                        padding: 0,
                                                        background: "#fff",
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        width: 78,
                                                        height: 78,
                                                        boxShadow: active ? "0 10px 18px rgba(141,86,96,0.18)" : "none",
                                                    }}
                                                >
                                                    <img
                                                        src={u}
                                                        alt="thumb"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ✅ Right: Purchase/info panel */}
                        <div
                            style={{
                                position: isMobile ? "static" : "sticky",
                                top: 86,
                                background: THEME.card,
                                border: `1px solid ${THEME.border}`,
                                borderRadius: 18,
                                boxShadow: THEME.shadow,
                                padding: 16,
                            }}
                        >
                            {/* title */}
                            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.text, lineHeight: 1.25 }}>
                                {data.productName}
                            </div>

                            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Chip>{data.categoryName}</Chip>
                                <Chip>{data.subCategoryName}</Chip>
                                <Chip>{data.origin || "Origin"}</Chip>
                            </div>

                            {/* rating row */}
                            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                <Stars value={4.4} />
                                <div style={{ fontSize: 12, color: THEME.sub, fontWeight: 800 }}>
                                    In stock • Fast dispatch
                                </div>
                            </div>

                            {/* price */}
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, color: THEME.sub, fontWeight: 800 }}>Price</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: THEME.dark, marginTop: 2 }}>
                                    {priceText}
                                </div>
                                <div style={{ fontSize: 12, color: THEME.sub, marginTop: 2 }}>
                                    Inclusive of standard quality checks
                                </div>
                            </div>



                            {/* specs (Amazon-like list) */}
                            <div style={{ marginTop: 16, border: `1px solid ${THEME.border}`, borderRadius: 16, overflow: "hidden" }}>
                                <div style={{ padding: 12, background: "#faf9fb", borderBottom: `1px solid ${THEME.border}` }}>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: THEME.dark }}>
                                        Key Specifications
                                    </div>
                                </div>

                                <div style={{ padding: "2px 12px" }}>
                                    <SpecRow label="Marble Type" value={data.marbleType} />
                                    <SpecRow label="Color" value={data.color} />
                                    <SpecRow label="Finish" value={data.finish} />
                                    <SpecRow label="Thickness" value={(data.thicknessMM || 0) + " mm"} />
                                    <SpecRow label="Size" value={data.size} />
                                    <SpecRow label="Application" value={data.application} />
                                </div>
                            </div>

                            {/* description */}
                            <div style={{ marginTop: 14 }}>
                                <div style={{ fontSize: 13, fontWeight: 900, color: THEME.dark, marginBottom: 6 }}>
                                    Product Description
                                </div>
                                <div style={{ fontSize: 13, color: THEME.text, lineHeight: 1.65 }}>
                                    {data.description || "-"}
                                </div>
                            </div>

                            {/* small footer note */}
                            <div style={{ marginTop: 14, fontSize: 12, color: THEME.sub, fontWeight: 700 }}>
                                Tip: Use “Enquire Now” to collect customer requirement (area, finish, delivery city).
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
