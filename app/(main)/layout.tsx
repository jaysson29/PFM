import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return <div className="container mx-auto my-32">{children}</div>;
};

export default MainLayout;
