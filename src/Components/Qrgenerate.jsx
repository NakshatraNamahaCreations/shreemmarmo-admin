import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrReader } from "react-qr-reader";

const PRODUCT_API = "https://api.shreemmarmo.com/api/product/all"; // change if different
const FRONT_BASE = "https://gleaming-meringue-40f261.netlify.app"; // your frontend base

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

const inputStyle = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    outline: "none",
    fontFamily: "Poppins",
    fontSize: 13,
    color: THEME.text,
    background: "#fff",
};

const labelStyle = {
    fontSize: 13,
    fontWeight: 800,
    color: THEME.dark,
    marginBottom: 6,
};

const btn = (type = "primary") => {
    const base = {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid transparent",
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        transition: "all .18s ease",
    };
    if (type === "primary")
        return { ...base, background: THEME.primary, color: "#fff", borderColor: THEME.primary };
    if (type === "secondary")
        return { ...base, background: "#fff", color: THEME.dark, borderColor: THEME.border };
    return { ...base, background: THEME.black, color: "#fff", borderColor: THEME.black };
};

function getProductLabel(p) {
    const name = p?.productName || p?.MarbleName || "Product";
    const cat = p?.categoryName ? ` • ${p.categoryName}` : "";
    return `${name}${cat}`;
}

export default function GenerateQR() {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [mode, setMode] = useState("product"); // "product" | "custom"
    const [selectedId, setSelectedId] = useState("");
    const [extraText, setExtraText] = useState("");
    const [customText, setCustomText] = useState("");

    const [qrUrl, setQrUrl] = useState("");
    const [scanWebCam, setScanWebCam] = useState("");

    const fileRef = useRef(null);

    const selectedProduct = useMemo(
        () => products.find((p) => p._id === selectedId),
        [products, selectedId]
    );

    const productLink = useMemo(() => {
        if (!selectedId) return "";
        return `${FRONT_BASE}/Productdetails/${selectedId}`;
    }, [selectedId]);

    const finalQrText = useMemo(() => {
        if (mode === "product") {
            if (!productLink) return "";
            const note = extraText.trim();
            if (!note) return productLink;

            try {
                const url = new URL(productLink);
                url.searchParams.set("note", note);
                return url.toString();
            } catch {
                return productLink;
            }
        }

        const t = customText.trim();
        if (!t) return "";
        const note = extraText.trim();
        if (!note) return t;
        return `${t}\n\nNote: ${note}`;
    }, [mode, productLink, customText, extraText]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch(PRODUCT_API);
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || "Failed to fetch products");

            const arr = Array.isArray(json?.data) ? json.data : [];
            setProducts(arr);
            if (arr.length && !selectedId) setSelectedId(arr[0]._id);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateQr = async () => {
        try {
            if (!finalQrText) {
                alert("Please select a product or enter custom text.");
                return;
            }
            const url = await QRCode.toDataURL(finalQrText, {
                margin: 2,
                width: 900,
                errorCorrectionLevel: "H",
            });
            setQrUrl(url);
        } catch (e) {
            console.log(e);
            alert("QR generate failed");
        }
    };

    const downloadQr = () => {
        if (!qrUrl) return;
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = `qr-${Date.now()}.png`;
        a.click();
    };

    return (
        <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "Poppins" }}>
            {/* Header */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    background: `linear-gradient(90deg, ${THEME.dark}, #2f2e3b)`,
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
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
                                borderRadius: 12,
                                background: THEME.primary,
                                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
                            }}
                        />
                        <div style={{ color: "#fff" }}>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>QR Generator</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                                Product link QR • Custom text QR
                            </div>
                        </div>
                    </div>

                    <button
                        style={{
                            ...btn("secondary"),
                            width: "auto",
                            background: "rgba(255,255,255,0.12)",
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.18)",
                        }}
                        onClick={fetchProducts}
                    >
                        {loadingProducts ? "Refreshing..." : "Refresh Products"}
                    </button>
                </div>
            </div>

            {/* ✅ Center Card Wrapper */}
            <div
                style={{
                    minHeight: "calc(100vh - 70px)",
                    display: "grid",
                    placeItems: "center",
                    padding: 16,
                }}
            >
                {/* ✅ Center Card */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: 860,
                        background: THEME.card,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 18,
                        boxShadow: THEME.shadow,
                        padding: 16,
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 900, color: THEME.text }}>
                        Generate QR
                    </div>
                    <div style={{ fontSize: 13, color: THEME.sub, marginTop: 4 }}>
                        Select product → QR will contain product details URL with ID.
                    </div>

                    {/* mode switch */}
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={() => setMode("product")}
                            style={{
                                ...btn(mode === "product" ? "primary" : "secondary"),
                                width: "auto",
                            }}
                        >
                            Product QR
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("custom")}
                            style={{
                                ...btn(mode === "custom" ? "primary" : "secondary"),
                                width: "auto",
                            }}
                        >
                            Custom Text QR
                        </button>
                    </div>

                    <div style={{ marginTop: 14 }}>
                        {mode === "product" ? (
                            <>
                                <div style={labelStyle}>Select Product</div>
                                <select
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Select...</option>
                                    {products.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {getProductLabel(p)}
                                        </option>
                                    ))}
                                </select>

                                <div style={{ marginTop: 10, fontSize: 12, color: THEME.sub, fontWeight: 700 }}>
                                    URL Preview:
                                    <div
                                        style={{
                                            marginTop: 6,
                                            padding: 10,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: 12,
                                            background: "#faf9fb",
                                            color: THEME.text,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {productLink || "Select a product to generate link"}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={labelStyle}>Enter Text / URL</div>
                                <textarea
                                    rows={4}
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Example: https://yourwebsite.com or Any text..."
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </>
                        )}
                    </div>

                    {/* extra option */}
                    <div style={{ marginTop: 12 }}>
                        <div style={labelStyle}>Extra Note (Optional)</div>
                        <input
                            value={extraText}
                            onChange={(e) => setExtraText(e.target.value)}
                            placeholder="Example: Offer valid till Sunday"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            style={{ ...btn("primary"), flex: 1, minWidth: 160 }}
                            onClick={generateQr}
                            onMouseEnter={(e) => (e.currentTarget.style.background = THEME.primary2)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = THEME.primary)}
                        >
                            Generate QR
                        </button>

                        <button
                            type="button"
                            style={{ ...btn("secondary"), flex: 1, minWidth: 160 }}
                            onClick={downloadQr}
                            disabled={!qrUrl}
                        >
                            Download PNG
                        </button>
                    </div>

                    {/* QR preview */}
                    <div
                        style={{
                            marginTop: 14,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            alignItems: "start",
                        }}
                    >
                        <div
                            style={{
                                border: `1px solid ${THEME.border}`,
                                borderRadius: 16,
                                padding: 12,
                                background: "#fff",
                                minHeight: 220,
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 900, color: THEME.dark, marginBottom: 8 }}>
                                QR Preview
                            </div>
                            {qrUrl ? (
                                <img
                                    src={qrUrl}
                                    alt="qr"
                                    style={{ width: "100%", maxWidth: 240, borderRadius: 12 }}
                                />
                            ) : (
                                <div style={{ fontSize: 13, color: THEME.sub }}>Generate QR to preview here</div>
                            )}
                        </div>

                        <div
                            style={{
                                border: `1px solid ${THEME.border}`,
                                borderRadius: 16,
                                padding: 12,
                                background: "#faf9fb",
                                minHeight: 220,
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 900, color: THEME.dark, marginBottom: 8 }}>
                                QR Text (Final)
                            </div>
                            <div style={{ fontSize: 13, color: THEME.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                {finalQrText || "-"}
                            </div>

                            {mode === "product" && selectedProduct ? (
                                <div style={{ marginTop: 10, fontSize: 12, color: THEME.sub, fontWeight: 700 }}>
                                    Selected:{" "}
                                    <span style={{ color: THEME.dark }}>
                                        {selectedProduct.productName || selectedProduct.MarbleName || "-"}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive */}
            <style>{`
        @media (max-width: 860px){
          .qrGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
