import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useAppKitAccount,
  useAppKitState,
} from "@reown/appkit/react";
import { executeSocialLogin } from "@reown/appkit-controllers/utils";

import { appKit } from "../config/wagmi";

const CustomerAuthContext = createContext(null);
const GUEST_STORAGE_KEY = "gabaloo_guest_session";

function createGuestId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readGuestSession() {
  try {
    const storedSession = localStorage.getItem(GUEST_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedSession = JSON.parse(storedSession);

    if (!parsedSession?.id) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      return null;
    }

    return parsedSession;
  } catch {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    return null;
  }
}

function shortenAddress(address) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function CustomerAuthProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [guestSession, setGuestSession] = useState(readGuestSession);
  const [busyAction, setBusyAction] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const { address, embeddedWalletInfo, isConnected } = useAppKitAccount();
  const { initialized, socials } = useAppKitState();

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    if (guestSession) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setGuestSession(null);
    }

    setErrorCode("");
    setIsAuthModalOpen(false);
  }, [guestSession, isConnected]);

  const socialUser = embeddedWalletInfo?.user;
  const authType = isConnected
    ? embeddedWalletInfo?.authProvider || "wallet"
    : guestSession
      ? "guest"
      : null;

  const displayName = isConnected
    ? socialUser?.username ||
      socialUser?.email ||
      shortenAddress(address) ||
      "Gabaloo"
    : guestSession
      ? "Guest"
      : "";

  function openAuthModal() {
    setErrorCode("");
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    if (busyAction) {
      return;
    }

    setErrorCode("");
    setIsAuthModalOpen(false);
  }

  async function startSocialLogin(provider) {
    if (busyAction) {
      return;
    }

    if (
      initialized &&
      (!Array.isArray(socials) || !socials.includes(provider))
    ) {
      setErrorCode("socialUnavailable");
      return;
    }

    setBusyAction(provider);
    setErrorCode("");
    setIsAuthModalOpen(false);

    try {
      await appKit.open({ view: "Connect" });
      await executeSocialLogin(provider);
    } catch {
      setErrorCode("genericError");
      setIsAuthModalOpen(true);
    } finally {
      setBusyAction("");
    }
  }

  async function startWalletLogin() {
    if (busyAction) {
      return;
    }

    setBusyAction("wallet");
    setErrorCode("");
    setIsAuthModalOpen(false);

    try {
      await appKit.open({ view: "Connect" });
    } catch {
      setErrorCode("genericError");
      setIsAuthModalOpen(true);
    } finally {
      setBusyAction("");
    }
  }

  function continueAsGuest() {
    const nextGuestSession = {
      id: createGuestId(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextGuestSession));
    setGuestSession(nextGuestSession);
    setErrorCode("");
    setIsAuthModalOpen(false);
  }

  function upgradeGuestAccount() {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setGuestSession(null);
    setErrorCode("");
  }

  async function manageWallet() {
    setErrorCode("");
    setIsAuthModalOpen(false);

    try {
      await appKit.open({ view: "Account" });
    } catch {
      setErrorCode("genericError");
      setIsAuthModalOpen(true);
    }
  }

  async function signOut() {
    if (busyAction) {
      return;
    }

    setBusyAction("signOut");
    setErrorCode("");

    try {
      if (isConnected) {
        await appKit.disconnect();
      }

      localStorage.removeItem(GUEST_STORAGE_KEY);
      setGuestSession(null);
      setIsAuthModalOpen(false);
    } catch {
      setErrorCode("genericError");
    } finally {
      setBusyAction("");
    }
  }

  const value = {
    address,
    authType,
    busyAction,
    closeAuthModal,
    continueAsGuest,
    displayName,
    errorCode,
    isAuthModalOpen,
    isAuthenticated: isConnected || Boolean(guestSession),
    isConnected,
    isGuest: Boolean(guestSession) && !isConnected,
    manageWallet,
    openAuthModal,
    profileEmail: socialUser?.email || "",
    signOut,
    startSocialLogin,
    startWalletLogin,
    upgradeGuestAccount,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  }

  return context;
}
