"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

// Authorized Admin UID
const ADMIN_UID = "l5A7js9KCkY8a7LYN4CZFlj24ut1";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Set login persistence
      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      // Firebase Login
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Verify Admin UID
      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);

        throw new Error("UNAUTHORIZED_ADMIN");
      }

      // Login successful
      setSuccess(true);

      // Redirect to Dashboard
      router.replace("/admin/dashboard");

    } catch (err) {
      console.error("Admin login error:", err.code || err.message);

      if (err.message === "UNAUTHORIZED_ADMIN") {
        setError(
          "Access denied. This account is not authorized as an administrator."
        );
      } else {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setError("Incorrect email or password.");
            break;

          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/too-many-requests":
            setError(
              "Too many login attempts. Please try again later."
            );
            break;

          case "auth/network-request-failed":
            setError(
              "Network error. Please check your internet connection."
            );
            break;

          default:
            setError(
              "Unable to login. Please check your credentials and try again."
            );
        }
      }

      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10 text-on-surface antialiased sm:px-6">

      <section className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-outline bg-surface-card p-6 shadow-sm sm:p-8">

        {/* BRAND */}

        <div className="flex flex-col items-center gap-2 text-center">

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-secondary">

            <span className="material-symbols-outlined text-headline-md">
              electric_rickshaw
            </span>

          </div>

          <h1 className="mt-1 font-headline text-headline-md text-primary">
            Welcome Back
          </h1>

          <p className="font-body text-body-md text-on-surface-variant">
            Sign in to manage AutoConnect
          </p>

        </div>

        {/* ADMIN NOTICE */}

        <div className="flex flex-col gap-1.5 rounded-md bg-primary-container p-3.5 text-on-primary-container">

          <div className="flex items-center gap-2">

            <span className="material-symbols-outlined text-title-md">
              admin_panel_settings
            </span>

            <span className="font-label text-label-md">
              Administrator Access Only
            </span>

          </div>

          <p className="font-body text-body-md">
            This dashboard is restricted to the authorized administrator.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div
            className="flex items-center gap-2 rounded-md bg-danger-container p-3.5 font-label text-label-md text-on-danger-container"
            role="alert"
          >

            <span className="material-symbols-outlined text-title-md">
              error
            </span>

            <span>{error}</span>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="flex items-center gap-2 rounded-md bg-success-container p-3.5 font-label text-label-md text-on-success-container"
            role="status"
          >

            <span className="material-symbols-outlined text-title-md">
              check_circle
            </span>

            <span>Login successful! Opening dashboard...</span>

          </div>
        )}

        {/* LOGIN FORM */}

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <label className="flex flex-col gap-1.5" htmlFor="admin-email">

            <span className="font-label text-label-md text-on-surface">
              Email Address
            </span>

            <span className="relative flex items-center">

              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-title-md text-on-surface-variant">
                mail
              </span>

              <input
                className="w-full rounded-md border border-outline-strong bg-surface py-2.5 pl-10 pr-3.5 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-container"
                id="admin-email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="Enter admin email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

            </span>

          </label>

          {/* PASSWORD */}

          <label className="flex flex-col gap-1.5" htmlFor="admin-password">

            <span className="font-label text-label-md text-on-surface">
              Password
            </span>

            <span className="relative flex items-center">

              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-title-md text-on-surface-variant">
                lock
              </span>

              <input
                className="w-full rounded-md border border-outline-strong bg-surface py-2.5 pl-10 pr-11 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-container"
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                className="absolute right-2.5 rounded p-1 text-on-surface-variant transition-colors hover:text-on-surface"
                type="button"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowPassword((current) => !current)}
              >

                <span className="material-symbols-outlined text-title-md">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>

              </button>

            </span>

          </label>

          {/* REMEMBER ME */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <label className="inline-flex cursor-pointer items-center gap-2">

              <input
                className="h-4 w-4 rounded border-outline-strong text-primary"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <span className="font-body text-body-md text-on-surface-variant">
                Remember me
              </span>

            </label>

            <Link
              className="font-label text-label-md text-primary hover:underline"
              href="/"
            >
              Back to Website
            </Link>

          </div>

          {/* LOGIN BUTTON */}

          <button
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-label text-label-lg text-on-primary transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >

            <span>
              {isSubmitting
                ? "Signing In..."
                : "Login to Dashboard"}
            </span>

            <span className="material-symbols-outlined text-title-md">
              arrow_forward
            </span>

          </button>

        </form>

      </section>

    </main>
  );
}