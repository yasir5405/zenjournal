import type { NavItems } from "@/types";
import { ArrowRight } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const Navbar = () => {
  const navItems: NavItems[] = [
    { name: "Features", url: "/features" },
    { name: "About", url: "/about" },
    { name: "Contact", url: "/contact" },
  ];

  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  return (
    <nav className="w-full py-4 flex items-center justify-between shadow-lg z-50 bg-background rounded-full px-4">
      <Link
        to={"/"}
        className="scroll-m-20 text-xl font-semibold tracking-tight flex gap-1 items-center "
      >
        <img src="/logo (2).png" alt="" className="h-11 w-11" />
        <p>
          Zen<span className="text-primary">Journal</span>
        </p>
      </Link>

      <div className="flex items-center justify-center gap-8">
        {navItems.map((navItem, idx) => (
          <NavLink
            key={idx}
            className={({ isActive }) =>
              `text-sm leading-none font-medium hover:text-primary ${
                isActive ? "text-primary" : "text-black"
              }`
            }
            to={navItem.url}
          >
            {navItem.name}
          </NavLink>
        ))}
      </div>

      <div className="h-full flex gap-3">
        {token ? (
          <Button onClick={() => navigate("/dashboard")}>
            Dashboard
            <ArrowRight />
          </Button>
        ) : (
          <>
            <Button onClick={() => navigate("/login")} variant="outline">
              Sign in
            </Button>
            <Button onClick={() => navigate("/signup")}>Sign up</Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
