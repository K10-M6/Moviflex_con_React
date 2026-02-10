import React from "react";
import {BsCart3, BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill,
    BsListCheck, BsMenuButtonWideFill
} from "react-icons/bs";


function Sidebar({openSidebarToggle, OpenSidebar}) {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
        <div className="sidebar-title">
            <div className="sidebar-brand">
                <BsCart3 className="icon_header" /> MOVIFLEX
                <span className="icon close_icon" onClick={OpenSidebar}>X</span>
            </div>
        </div>
        <ul className="sidebar-list">
            <li className="sidebar-item">
                <a href="">
                    <BsGrid1X2Fill className="icon"/>Dashboard
                </a>
            </li>
            <li className="sidebar-item">
                <a href="">
                    <BsPeopleFill className="icon"/>Clientes
                </a>
            </li>
            <li className="sidebar-item">
                <a href="">
                    <BsFillGrid3X3GapFill className="icon"/>Conductores
                </a>
            </li>
            <li className="sidebar-item">
                <a href="">
                    <BsListCheck className="icon"/>Usuarios
                </a>
            </li>
            <li className="sidebar-item">
                <a href="">
                    <BsMenuButtonWideFill className="icon"/>Vehículos
                </a>
            </li>
        </ul>
    </aside>
  );
}

export default Sidebar; 