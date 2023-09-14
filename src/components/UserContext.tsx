"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { Wallet } from "ethers";

// Creating the context
export const UserContext = createContext<Wallet | null>(null);

// Custom hook for easy access
export const useUser = () => {
  return useContext(UserContext);
};

// The function to retrieve or create a wallet
export const getCurrentUser = async () => {
  const storedWallet = localStorage.getItem("wallet");
  if (storedWallet) {
    const parsedStoredWallet = JSON.parse(storedWallet);
    const newWallet = new Wallet(parsedStoredWallet.privateKey);
    return newWallet;
  } else {
    const newWallet = Wallet.createRandom();
    localStorage.setItem(
      "wallet",
      JSON.stringify({
        address: newWallet.address,
        privateKey: newWallet.privateKey,
      })
    );
    return newWallet;
  }
};

// The provider component
export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const userWallet = await getCurrentUser();
      setWallet(userWallet);
    };

    fetchWallet();
  }, []);

  return <UserContext.Provider value={wallet}>{children}</UserContext.Provider>;
};
