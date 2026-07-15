import { useEffect, useState } from "react";
import { UserRound, WalletCards } from "lucide-react";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import "./CustomerAvatar.css";

function CustomerAvatar({ className = "", size = "medium" }) {
  const {
    authType,
    initials,
    isGuest,
    profileImage,
  } = useCustomerAuth();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileImage]);

  const classes = [
    "customerAvatar",
    `customerAvatar--${size}`,
    isGuest ? "customerAvatar--guest" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {profileImage && !imageFailed ? (
        <img
          src={profileImage}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : authType === "wallet" ? (
        <WalletCards size={size === "large" ? 26 : 17} />
      ) : isGuest ? (
        <UserRound size={size === "large" ? 26 : 17} />
      ) : (
        <strong>{initials}</strong>
      )}
    </span>
  );
}

export default CustomerAvatar;
