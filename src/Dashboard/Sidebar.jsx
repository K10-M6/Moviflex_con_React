import React from "react";
import {BsCart3, BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill,
    BsListCheck, BsMenuButtonWideFill
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";


function Sidebar({openSidebarToggle, OpenSidebar}) {
  const navigate = useNavigate();
  
  const handleDashboardClick = () => {
    navigate('/admin/dashboard');
  };
  
  const handleClientesClick = () => {
    navigate('/admin/usuarios'); 
  };
  
  const handleConductoresClick = () => {
    navigate('/admin/conductores');
  };
  
  const handleUsuariosClick = () => {
    navigate('/admin/usuarios');
  };
  
  const handleVehiculosClick = () => {
    navigate('/admin/vehiculos');
  };
  
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
                <a href="" onClick={(e) => {
                    e.preventDefault();
                    handleDashboardClick();
                }}>
                    <BsGrid1X2Fill className="icon"/>Dashboard
                </a>
            </li>
            <li className="sidebar-item">
                <a href="" onClick={(e) => {
                    e.preventDefault();
                    handleClientesClick();
                }}>
                    <BsPeopleFill className="icon"/>Clientes
                </a>
            </li>
            <li className="sidebar-item">
                <a href="" onClick={(e) => {
                    e.preventDefault();
                    handleConductoresClick();
                }}>
                    <BsFillGrid3X3GapFill className="icon"/>Conductores
                </a>
            </li>
            <li className="sidebar-item">
                <a href="" onClick={(e) => {
                    e.preventDefault();
                    handleUsuariosClick();
                }}>
                    <BsListCheck className="icon"/>Usuarios
                </a>
            </li>
            <li className="sidebar-item">
                <a href="" onClick={(e) => {
                    e.preventDefault();
                    handleVehiculosClick();
                }}>
                    <BsMenuButtonWideFill className="icon"/>Vehículos
                </a>
            </li>
        </ul>
    </aside>
  );
}

export default Sidebar;