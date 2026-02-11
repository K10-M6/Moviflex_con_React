import React from "react";
import { BsPersonCircle, BsJustify } from "react-icons/bs";

function Header({ OpenSidebar }) {
  return (
    <header className="py-3" style={{
      backgroundColor: '#124c83',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-white me-3 d-md-none p-0"
              onClick={OpenSidebar}
            >
              <BsJustify className="fs-3" />
            </button>
            <div>
              <h4 className="fw-bold mb-0 text-white">
                <BsPersonCircle className="me-2" />
                MOVIFLEX
              </h4>
              <small className="text-white opacity-75">Panel Administrativo</small>
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