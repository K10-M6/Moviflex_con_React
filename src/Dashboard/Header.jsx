import React from "react";
import { BsJustify } from "react-icons/bs";
import Logo from "../pages/Imagenes/TODO_MOVI.png"



function Header({ OpenSidebar }) {
  return (
    <header className="py-3" style={{
      backgroundColor: '#124c83',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="text-center mb-4">
              <img src={Logo} alt="Logo Moviflexx" 
                style={{
                  width: '150px',
                  height: 'auto',
                  marginLeft: '20px'
                }}
              />
            </div>
          </div>


          <div className="d-flex align-items-center">
            <div className="text-end me-3 d-none d-md-block">
              <p className="mb-0 text-white fw-medium">Administrador</p>
              <small className="text-white opacity-75">admin@moviflex.com</small>
            </div>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '45px',
                height: '45px',
                backgroundColor: '#ffffff',
                border: '1px solid black',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <span className="text-black fw-bold">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;