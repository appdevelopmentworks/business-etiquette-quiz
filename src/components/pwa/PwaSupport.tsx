"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_STORAGE_KEY = "beq.pwaPromptDismissed";

export const PwaSupport = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const isIosDevice =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
      !("MSStream" in window);

    const syncInstalledState = () => {
      const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
      setIsStandalone(mediaQuery.matches || navigatorWithStandalone.standalone === true);
    };

    setIsDismissed(dismissed);
    setIsIos(isIosDevice);
    syncInstalledState();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsDismissed(dismissed);
    };

    const handleAppInstalled = () => {
      window.localStorage.removeItem(DISMISS_STORAGE_KEY);
      setDeferredPrompt(null);
      setIsDismissed(false);
      syncInstalledState();
    };

    mediaQuery.addEventListener("change", syncInstalledState);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", syncInstalledState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const canShowPrompt = !isStandalone && !isDismissed && (isIos || deferredPrompt);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "dismissed") {
      handleDismiss();
      return;
    }

    setDeferredPrompt(null);
  };

  if (!canShowPrompt) {
    return null;
  }

  return (
    <aside className="install-banner" aria-label="アプリのインストール案内">
      <div className="install-banner__content">
        <strong>ホーム画面に追加すると、アプリのように使えます</strong>
        <p className="muted">
          {deferredPrompt
            ? "研修中にすぐ開けるよう、ホーム画面に追加しておくのがおすすめです。"
            : "iPhoneでは Safari の共有メニューから「ホーム画面に追加」を選ぶとインストールできます。"}
        </p>
      </div>
      <div className="install-banner__actions">
        {deferredPrompt ? (
          <button type="button" className="button button--primary" onClick={handleInstall}>
            ホーム画面に追加
          </button>
        ) : null}
        <button type="button" className="button button--ghost" onClick={handleDismiss}>
          閉じる
        </button>
      </div>
    </aside>
  );
};
