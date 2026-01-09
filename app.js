// app.js
const { h, render } = window.App.VDOM;
const { useState, useEffect, useRef } = window.App.Hooks;
const { Link, Outlet, navigateTo } = window.App.Router;

// ====================
// Component Auth
// ====================
function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Kiểm tra session hiện tại khi mount
  useEffect(() => {
    const { data: authListener } = window.supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          navigateTo("/dashboard");
        }
      }
    );

    // Kiểm tra session ban đầu
    window.supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) navigateTo("/dashboard");
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await window.supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // onAuthStateChange sẽ tự redirect
      } else {
        const { error } = await window.supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await window.supabase.auth.signOut();
    setUser(null);
    navigateTo("/auth");
  };

const handleForgotPassword = async () => {
  if (!email) return alert("Nhập email trước");

  const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password"
  });

  if (error) alert(error.message);
  else alert("📩 Đã gửi email đặt lại mật khẩu");
};

  // Nếu đã đăng nhập → chuyển sang Dashboard
  if (user) {
    return h("div", { style: { padding: "2rem", textAlign: "center" } },
      h("h1", null, "Chào mừng bạn trở lại!"),
      h("p", null, `Email: ${user.email}`),
      h("button", { onClick: handleSignOut, style: { padding: "0.5rem 1rem", marginTop: "1rem" } },
        "Đăng xuất"
      ),
      h("br"),
      h(Link, { to: "/dashboard" }, "Đi đến Dashboard")
    );
  }

  return h("div", {
    style: {
      maxWidth: "400px",
      margin: "4rem auto",
      padding: "2rem",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }
  },
    h("h2", { style: { textAlign: "center" } }, isLogin ? "Đăng nhập" : "Đăng ký"),
    error && h("p", { style: { color: "red", textAlign: "center" } }, error),

    h("form", { onSubmit: handleSubmit },
      h("div", { style: { marginBottom: "1rem" } },
        h("label", { style: { display: "block", marginBottom: "0.5rem" } }, "Email"),
        h("input", {
          type: "email",
          value: email,
          required: true,
          disabled: loading,
          onInput: (e) => setEmail(e.target.value),
          style: { width: "100%", padding: "0.5rem", fontSize: "1rem" }
        })
      ),

      h("div", { style: { marginBottom: "1rem" } },
        h("label", { style: { display: "block", marginBottom: "0.5rem" } }, "Mật khẩu"),
        h("input", {
          type: "password",
          value: password,
          required: true,
          minLength: 6,
          disabled: loading,
          onInput: (e) => setPassword(e.target.value),
          style: { width: "100%", padding: "0.5rem", fontSize: "1rem" }
        })
      ),

      h("button", {
        type: "submit",
        disabled: loading,
        style: {
          width: "100%",
          padding: "0.75rem",
          background: "#0066ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer"
        }
      }, loading ? "Đang xử lý..." : (isLogin ? "Đăng nhập" : "Đăng ký")),

      h("p", { style: { textAlign: "center", marginTop: "1rem" } },
        isLogin
          ? "Chưa có tài khoản? "
          : "Đã có tài khoản? ",
        h("a", {
          href: "#",
          onClick: (e) => { e.preventDefault(); setIsLogin(!isLogin); }
        }, isLogin ? "Đăng ký ngay" : "Đăng nhập")
      ),

// Thêm quên mật khẩu
h("p", { style: { textAlign: "center" } },
  h("a", {
    href: "#",
    onClick: (e) => {
      e.preventDefault();
      handleForgotPassword();
    }
  }, "Quên mật khẩu?")
)

    )
  );
}


// ====================
// Change Password Component
// ====================
function ChangePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await window.supabase.auth.updateUser({
        password
      });
      if (error) throw error;

      setMessage("✅ Đổi mật khẩu thành công");
      setPassword("");
    } catch (err) {
      setError(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return h("div", {
    style: {
      maxWidth: "400px",
      margin: "2rem auto",
      padding: "1.5rem",
      border: "1px solid #ddd",
      borderRadius: "8px"
    }
  },
    h("h3", null, "Đổi mật khẩu"),
    error && h("p", { style: { color: "red" } }, error),
    message && h("p", { style: { color: "green" } }, message),

    h("form", { onSubmit: handleChangePassword },
      h("input", {
        type: "password",
        placeholder: "Mật khẩu mới (>= 6 ký tự)",
        required: true,
        minLength: 6,
        disabled: loading,
        value: password,
        onInput: (e) => setPassword(e.target.value),
        style: { width: "100%", padding: "0.5rem", marginBottom: "1rem" }
      }),
      h("button", {
        type: "submit",
        disabled: loading,
        style: {
          width: "100%",
          padding: "0.6rem",
          background: "#0066ff",
          color: "#fff",
          border: "none",
          borderRadius: "4px"
        }
      }, loading ? "Đang đổi..." : "Đổi mật khẩu")
    )
  );
}



// ====================
// Reset Password
// ====================
function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const { error } = await window.supabase.auth.updateUser({
        password
      });
      if (error) throw error;

      setMsg("✅ Đặt lại mật khẩu thành công");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return h("div", { style: { padding: "2rem", maxWidth: "400px", margin: "auto" } },
    h("h2", null, "Đặt lại mật khẩu"),
    error && h("p", { style: { color: "red" } }, error),
    msg && h("p", { style: { color: "green" } }, msg),
    h("form", { onSubmit: handleReset },
      h("input", {
        type: "password",
        required: true,
        minLength: 6,
        value: password,
        onInput: e => setPassword(e.target.value),
        placeholder: "Mật khẩu mới",
        style: { width: "100%", padding: "0.5rem", marginBottom: "1rem" }
      }),
      h("button", { disabled: loading }, loading ? "Đang xử lý..." : "Xác nhận")
    )
  );
}



// ====================
// Dashboard (sau khi login)
// ====================
function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    await window.supabase.auth.signOut();
    navigateTo("/auth");
  };

  return h("div", { style: { padding: "2rem", textAlign: "center" } },
    h("h1", null, "Dashboard"),
    h("p", null, user ? `Xin chào ${user.email}` : "Đang tải..."),

    h(ChangePassword), // 👈 gắn tại đây

    h("button", {
      onClick: handleSignOut,
      style: { padding: "0.5rem 1rem", marginTop: "1rem" }
    }, "Đăng xuất"),
    h("br"), h("br"),
    h(Link, { to: "/auth" }, "Về trang Auth")
  );
}

// ====================
// Home Page
// ====================
function Home() {
  return h("div", { style: { padding: "2rem", textAlign: "center" } },
    h("h1", null, "Welcome to My App"),
    h("p", null, "Đây là trang chủ"),
    h(Link, { to: "/auth" }, "Đi đến Đăng nhập / Đăng ký"),
    h("br"), h("br"),
    h(Link, { to: "/dashboard" }, "Dashboard (yêu cầu đăng nhập)")
  );
}

// ====================
// Routes
// ====================
window.App.Router.addRoute("/", Home);
window.App.Router.addRoute("/auth", AuthPage);
window.App.Router.addRoute("/dashboard", Dashboard);
window.App.Router.addRoute("/reset-password", ResetPasswordPage);

// Navbar đơn giản
window.App.Router.navbarDynamic({
  navbar: () => h("nav", {
    style: {
      background: "#333",
      color: "white",
      padding: "1rem",
      textAlign: "center"
    }
  },
    h(Link, { to: "/", style: { color: "white", margin: "0 1rem" }, children: "Home"}),
    h(Link, { to: "/auth", style: { color: "white", margin: "0 1rem" }, children: "Auth"}),
    h(Link, { to: "/dashboard", style: { color: "white", margin: "0 1rem" }, children: "Dashboard" })
  )
});

// ====================
// Khởi động App
// ====================
const mountEl = document.getElementById("app");
window.App.Router.init(mountEl, { hash: false }); // Dùng history mode (Vercel hỗ trợ tốt)

// Fallback 404
window.App.Router.setNotFound(() => h("div", { style: { padding: "2rem", textAlign: "center" } },
  h("h1", null, "404 - Không tìm thấy trang")
));