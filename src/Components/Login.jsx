import React, { useMemo, useState } from "react";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState("");

    const API_URL = "https://api.shreemmarmo.com/api/admin/login";

    const styles = useMemo(() => {
        const activeBg = isActive ? "#8D5660" : "rgba(255,255,255,0.10)";
        const activeBorder = isActive ? "#8D5660" : "rgba(255,255,255,0.16)";

        return {
            page: {
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                padding: "24px",
                fontFamily:
                    "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial",
                background:
                    "radial-gradient(1200px 600px at 20% 20%, rgba(141,86,96,0.25), transparent 60%), radial-gradient(900px 500px at 80% 30%, rgba(255,255,255,0.12), transparent 55%), linear-gradient(180deg, #0B0E14 0%, #0F1420 100%)",
                color: "#fff",
            },

            card: {
                width: "100%",
                maxWidth: 420,
                borderRadius: 22,
                padding: 26,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                position: "relative",
                overflow: "hidden",
            },

            glow: {
                position: "absolute",
                inset: -2,
                background:
                    "radial-gradient(600px 260px at 20% 10%, rgba(141,86,96,0.32), transparent 60%)",
                filter: "blur(2px)",
                pointerEvents: "none",
            },

            header: {
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 18,
            },

            headingWrap: { display: "grid", gap: 6 },

            title: {
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.2px",
            },
            subtitle: {
                margin: 0,
                fontSize: 12.5,
                color: "rgba(255,255,255,0.70)",
                lineHeight: 1.5,
            },

            pill: {
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                border: `1px solid ${activeBorder}`,
                background: activeBg,
                cursor: "pointer",
                userSelect: "none",
                transition: "all 180ms ease",
                height: "fit-content",
                marginTop: 2,
            },
            pillIcon: {
                width: 10,
                height: 10,
                borderRadius: 999,
                background: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                opacity: isActive ? 1 : 0.75,
            },
            pillText: {
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
            },

            field: { marginBottom: 14, position: "relative" },
            label: {
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                color: "rgba(255,255,255,0.78)",
                fontWeight: 500,
            },
            inputWrap: { position: "relative" },
            input: {
                width: "100%",
                padding: "12px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                outline: "none",
                color: "#fff",
                fontSize: 14,
                transition: "all 180ms ease",
            },
            inputRightBtn: {
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
                borderRadius: 12,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
            },

            row: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 10,
            },
            checkbox: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                userSelect: "none",
            },
            linkBtn: {
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                padding: 0,
            },

            error: {
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255, 77, 109, 0.35)",
                background: "rgba(255, 77, 109, 0.12)",
                color: "rgba(255,255,255,0.95)",
                fontSize: 12,
                lineHeight: 1.4,
            },

            submit: {
                marginTop: 16,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                    "linear-gradient(135deg, rgba(141,86,96,1) 0%, rgba(141,86,96,0.82) 55%, rgba(141,86,96,0.65) 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 14px 34px rgba(141,86,96,0.30)",
                transition: "transform 120ms ease, opacity 120ms ease",
                opacity: loading ? 0.85 : 1,
            },

            footer: {
                marginTop: 14,
                textAlign: "center",
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                position: "relative",
            },
        };
    }, [isActive, loading]);

    const onChange = (key, value) => {
        setForm((p) => ({ ...p, [key]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const email = form.email.trim();
        const password = form.password.trim();

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            // try to parse json even on error
            let data = {};
            try {
                data = await res.json();
            } catch (parseErr) {
                data = {};
            }

            if (!res.ok) {
                setError(
                    data?.message ||
                    data?.error ||
                    `Login failed (status ${res.status})`
                );
                return;
            }

            // ✅ store whatever backend returns (keep it flexible)
            // Example backend response might be: { success: true, user: {...}, token: "..." }
            localStorage.setItem("adminAuth", JSON.stringify(data));

            // ✅ redirect after login
            window.location.href = "/product";
        } catch (err) {
            setError(err?.message || "Network error. Please check backend server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.45); }
        input:focus {
          border-color: rgba(141,86,96,0.75) !important;
          box-shadow: 0 0 0 4px rgba(141,86,96,0.18);
        }
        button:active { transform: translateY(1px); }
      `}</style>

            <div style={styles.card}>
                <div style={styles.glow} />

                <div style={styles.header}>
                    <div style={styles.headingWrap}>
                        <h2 style={styles.title}>Admin Login</h2>
                        <p style={styles.subtitle}>
                            Sign in to continue to the dashboard.
                        </p>
                    </div>

                    <div
                        style={styles.pill}
                        onClick={() => setIsActive((p) => !p)}
                        title="Toggle active style"
                        role="button"
                        tabIndex={0}
                    >
                        <span style={styles.pillIcon} />
                        <span style={styles.pillText}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrap}>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="admin@example.com"
                                value={form.email}
                                onChange={(e) => onChange("email", e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrap}>
                            <input
                                style={{ ...styles.input, paddingRight: 90 }}
                                type={showPass ? "text" : "password"}
                                placeholder="Enter password"
                                value={form.password}
                                onChange={(e) => onChange("password", e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                style={styles.inputRightBtn}
                                onClick={() => setShowPass((p) => !p)}
                            >
                                {showPass ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <label style={styles.checkbox}>
                            <input type="checkbox" style={{ accentColor: "#8D5660" }} />
                            Remember me
                        </label>

                        <button
                            type="button"
                            style={styles.linkBtn}

                        >
                            Forgot password?
                        </button>
                    </div>

                    {error ? <div style={styles.error}>{error}</div> : null}

                    <button style={styles.submit} type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    <div style={styles.footer}>
                        © {new Date().getFullYear()} • Secure Admin Access
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
