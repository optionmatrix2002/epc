"use client"

import { useEffect } from "react"

export default function BootstrapJs() {
  useEffect(() => {
    // Dynamically import bootstrap JS so bundler can code-split it
    import('bootstrap/dist/js/bootstrap.bundle.min.js').catch((err) => {
      // swallow import error in dev so it doesn't crash Fast Refresh
      console.error('Failed to load bootstrap JS', err);
    });
  }, []);
  return null
}