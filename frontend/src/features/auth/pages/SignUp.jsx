import { useState } from "react";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
} from "react-icons/io5";
import "./SignUp.css";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !firstName || !lastName || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // marketplace-ALB-728332135.ap-south-1.elb.amazonaws.com
      const res = await fetch(
        "http://marketplace-ALB-728332135.ap-south-1.elb.amazonaws.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            fullName: { firstName, lastName },
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.errors?.[0]?.msg || "Registration failed";
        throw new Error(msg);
      }
      const data = await res.json();
      console.log("Registered:", data);
      // Optionally redirect to login
      window.location.hash = "#login";
    } catch (err) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <div className="login-form-wrapper">
          <div className="login-header">
            <div className="logo">
              <span className="logo-symbol">M</span>
            </div>
            <h2 className="logo-text">Market_Place</h2>
          </div>

          <h1 className="sign-in-title">Create account</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <IoPersonOutline className="input-icon" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <div className="input-wrapper">
                  <IoPersonOutline className="input-icon" />
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <div className="input-wrapper">
                  <IoPersonOutline className="input-icon" />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <IoMailOutline className="input-icon" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <IoLockClosedOutline className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={18} />
                    ) : (
                      <IoEyeOutline size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <div className="input-wrapper">
                  <IoLockClosedOutline className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="sign-in-button">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="signup-prompt">
            <p>
              Already have an account? <a href="#login">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <div className="welcome-content">
          <div className="decorative-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>

          <div className="welcome-logo">
            <span>M</span>
            <span className="logo-text-welcome">arket_place</span>
          </div>

          <div className="welcome-text">
            <h2 className="welcome-title">Welcome to Market_place</h2>
            <p className="welcome-description">
              Join Market_place to build beautiful dashboards and manage your
              marketplace experience.
            </p>
          </div>

          <div className="welcome-cta">
            <div className="cta-content">
              <h3 className="cta-title">Start building today</h3>
              <p className="cta-description">Create an account to continue.</p>
            </div>
            <div className="avatar-group">
              <div className="avatar avatar-1">👤</div>
              <div className="avatar avatar-2">👤</div>
              <div className="avatar avatar-3">👤</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
