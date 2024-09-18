import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./../../Assets/Images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCalendar,
  faEnvelope,
  faGear,
  faHome,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signing");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-1/4 lg:w-1/12 pt-16 lg:pt-10 py-10 bg-primary flex flex-col justify-around items-center overflow-hidden z-50">
      <Link to="/">
        <img src={Logo} alt="Logo" className="mb-16" />
      </Link>

      <Link
        to="/"
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faHome} />
      </Link>
      <Link
        to="/"
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faCalendar} />
      </Link>
      <Link
        to="/"
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faEnvelope} />
      </Link>
      <Link
        to="/"
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faUser} />
      </Link>
      <Link
        to="/settings"
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faGear} />
      </Link>
      <button
        onClick={handleLogout}
        className="p-3 mb-3 rounded-2xl text-white flex justify-center items-center text-xl bg-[#8588F0] hover:bg-white hover:text-[#8588F0]"
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </button>
    </div>
  );
}
