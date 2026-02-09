import React from "react";
import {BsCart3} from "react-icons/bs";
import "./Header.css";

function Sidebar() {
  return (
    <aside className="sidebar">
        <div className="sidebar-title">
            <div className="sidebar-brand">
                <BsCart3 className="icon_header" /> MOVIFLEX
                <span className="icon close_icon">X</span>
            </div>
        </div>
        <ul className="sidebar-list">
            <li className="Sidebar-item">
                <a href="">
                    <BsCart3 className="icon"/>Dashboard
                </a>
            </li>
            <li className="Sidebar-item">
                <a href="">
                    <BsCart3 className="icon"/>Clientes
                </a>
            </li>
            <li className="Sidebar-item">
                <a href="">
                    <BsCart3 className="icon"/>Conductores
                </a>
            </li>
            <li className="Sidebar-item">
                <a href="">
                    <BsCart3 className="icon"/>Usuarios
                </a>
            </li>
            <li className="Sidebar-item">
                <a href="">
                    <BsCart3 className="icon"/>Vehículos
                </a>
            </li>
        </ul>
    </aside>
  );
}

export default Sidebar; 