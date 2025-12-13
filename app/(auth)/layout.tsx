import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return <div className="flex justify-center pt-40">{children}</div>;
};

export default AuthLayout;
