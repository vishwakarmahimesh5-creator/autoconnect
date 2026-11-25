"use client";

import { useState } from "react";
import Link from "next/link";

const storyCards = [
  {
    icon: "flag",
    title: "Our Mission",
    description:
      "To make local last-mile transportation accessible to every passenger with a single QR scan—without requiring app downloads, logins, or surge pricing.",
    iconStyle: "bg-primary-container text-on-primary-container",
  },
  {
    icon: "wrong_location",
    title: "The Problem",
    description:
      "Outside major metros, ride-hailing apps rarely operate. Arriving at a station late at night or in an unfamiliar town leaves travelers struggling to find a reliable auto.",
    iconStyle: "bg-danger-container text-on-danger-container",
  },
  {
    icon: "qr_code_2",
    title: "Our Solution",
    description:
      "A lightweight, QR-powered local directory posted at stations and bus stands. Passengers scan, filter by area, and call or WhatsApp local drivers directly.",
    iconStyle: "bg-secondary-container text-on-secondary-container",
  },
];

const steps = [
  {
    icon: "qr_code_scanner",
    title: "1. Scan the QR Code",
    description:
      "Scan the AutoConnect poster at any railway station or bus stand.",
  },
  {
    icon: "person_search",
    title: "2. Find Your Driver",
    description:
      "Filter drivers by nearby area and check live availability.",
  },
  {
    icon: "call",
    title: "3. Call and Travel",
    description:
      "Tap Call Now or WhatsApp to coordinate your pickup directly.",
  },
];

const communityBenefits = [
  {
    title: "For Passengers",
    benefits: [
      "Instant browser access, zero downloads",
      "Direct phone & WhatsApp connection",
      "Clear vehicle & area details",
    ],
  },
  {
    title: "For Auto Drivers",
    benefits: [
      "More visibility at stations & markets",
      "Zero commission fees on rides",
      "Direct calls from nearby travelers",
    ],
  },
  {
    title: "For Local Communities",
    benefits: [
      "Supports local livelihoods",
      "Safer, organized station pickups",
      "Works in any town with a QR poster",
    ],
  },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  function handleContactSubmit(event) {
    event.preventDefault();
    event.currentTarget.reset();
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-outline bg-surface-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
          <Link
            className="flex items-center gap-2.5"
            href="/"
            aria-label="AutoConnect home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-secondary">
              <span aria-hidden="true" className="material-symbols-outlined text-title-lg">
                electric_rickshaw
              </span>
            </span>
            <span className="font-headline text-title-lg text-primary">
              AutoConnect
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-2 md:flex">
            <Link
              className="rounded-md px-3.5 py-2 font-label text-label-lg text-on-surface transition-colors hover:bg-surface-container-low"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-md bg-primary-container px-3.5 py-2 font-label text-label-lg text-on-primary-container"
              href="/about"
              aria-current="page"
            >
              About Us
            </Link>
            <a
              className="rounded-md px-3.5 py-2 font-label text-label-lg text-on-surface transition-colors hover:bg-surface-container-low"
              href="#contact"
            >
              Contact
            </a>
            <Link
              className="ml-2 rounded-md bg-primary px-4 py-2 font-label text-label-lg text-on-primary transition-opacity hover:opacity-95"
              href="/admin"
            >
              Admin Login
            </Link>
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-surface-container-low md:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1 border-t border-outline bg-surface-card px-6 py-3 md:hidden"
          >
            <Link className="rounded-md px-3 py-2 text-sm hover:bg-surface-container-low" href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link className="rounded-md bg-primary-container px-3 py-2 text-sm text-on-primary-container" href="/about" onClick={() => setMobileMenuOpen(false)}>
              About Us
            </Link>
            <a className="rounded-md px-3 py-2 text-sm hover:bg-surface-container-low" href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
            <Link className="rounded-md px-3 py-2 text-sm hover:bg-surface-container-low" href="/admin" onClick={() => setMobileMenuOpen(false)}>
              Admin Login
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1" id="top">
        {/* HERO */}
        <section className="border-b border-outline bg-surface-card">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex max-w-3xl flex-col gap-4">
              <span className="self-start rounded-full bg-secondary-container px-3.5 py-1.5 font-label text-label-md text-on-secondary-container">
                About AutoConnect
              </span>
              <h1 className="text-balance font-headline text-display-lg text-primary">
                Connecting Passengers with Local Auto Drivers
              </h1>
              <p className="max-w-prose font-body text-body-lg text-on-surface-variant">
                AutoConnect is a community-first directory built for small towns,
                railway stations, and bus stands where app-based ride-hailing
                simply isn&apos;t available.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION, PROBLEM, SOLUTION */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-12 md:grid-cols-3">
          {storyCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-3 rounded-lg border border-outline bg-surface-card p-6 shadow-sm"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-md ${card.iconStyle}`}>
                <span aria-hidden="true" className="material-symbols-outlined text-headline-sm">
                  {card.icon}
                </span>
              </div>
              <h2 className="font-headline text-headline-sm text-on-surface">
                {card.title}
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-outline bg-surface-card">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="mb-6 font-headline text-headline-lg text-on-surface">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="flex items-start gap-3.5 rounded-lg border border-outline bg-surface p-5"
                >
                  <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-headline-sm text-primary">
                    {step.icon}
                  </span>
                  <div>
                    <h3 className="font-title text-title-md text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mt-1 font-body text-body-md text-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMUNITY BENEFITS */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="mb-6 font-headline text-headline-lg text-on-surface">
            Built for Everyone in the Community
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {communityBenefits.map((group) => (
              <article
                key={group.title}
                className="flex flex-col gap-3 rounded-lg border border-outline bg-surface-card p-6"
              >
                <h3 className="font-title text-title-lg text-primary">
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-2 text-body-md text-on-surface-variant">
                  {group.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-title-md text-success">
                        check
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="mx-auto max-w-6xl px-6 pb-12" id="contact">
          <div className="grid grid-cols-1 items-center gap-8 rounded-xl border border-outline bg-surface-card p-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="font-headline text-headline-md text-primary">
                Get in Touch
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Want to bring AutoConnect QR posters to your town&apos;s railway
                station or bus stand? Send us a quick message.
              </p>
              <div className="mt-2 flex items-center gap-2 text-on-surface">
                <span aria-hidden="true" className="material-symbols-outlined text-title-md text-primary">
                  mail
                </span>
                <a className="font-mono text-mono-md hover:text-primary" href="mailto:hello@autoconnect.demo">
                  hello@autoconnect.demo
                </a>
              </div>
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleContactSubmit}>
              <label className="sr-only" htmlFor="contact-name">Your Name</label>
              <input
                className="rounded-md border border-outline-strong bg-surface px-3.5 py-2.5 text-body-md outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                id="contact-name"
                name="name"
                placeholder="Your Name"
                required
                type="text"
              />
              <label className="sr-only" htmlFor="contact-email">Email Address</label>
              <input
                className="rounded-md border border-outline-strong bg-surface px-3.5 py-2.5 text-body-md outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                id="contact-email"
                name="email"
                placeholder="Email Address"
                required
                type="email"
              />
              <label className="sr-only" htmlFor="contact-message">Town or station details</label>
              <textarea
                className="rounded-md border border-outline-strong bg-surface px-3.5 py-2.5 text-body-md outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                id="contact-message"
                name="message"
                placeholder="Town / Station details..."
                required
                rows={3}
              />
              <button
                className="self-start rounded-md bg-primary px-5 py-2.5 font-label text-label-lg text-on-primary transition-opacity hover:opacity-95"
                type="submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-outline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
          <div className="rounded-md border border-outline bg-surface-container-low p-4">
            <p className="font-label text-label-md text-on-surface-variant">
              AutoConnect is an independent local auto-rickshaw directory
              platform. We are not affiliated with any government authority or
              transportation company. Passengers should verify driver details
              before starting their journey.
            </p>
          </div>
          <p className="font-label text-label-md text-on-surface-variant">
            © 2026 AutoConnect. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* DEMO SUCCESS MESSAGE */}
      <div
        className={`fixed bottom-6 right-6 z-50 rounded-lg bg-primary px-5 py-3.5 font-body text-body-md text-on-primary shadow-md transition-opacity ${showToast ? "opacity-100" : "pointer-events-none opacity-0"}`}
        role="status"
        aria-live="polite"
      >
        Thank you! Your message has been recorded (demo).
      </div>
    </div>
  );
}
