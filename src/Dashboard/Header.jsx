import React from "react";
import { 
  BsFillBellFill, 
  BsPersonCircle, 
  BsJustify 
} from "react-icons/bs";

function Header({ OpenSidebar }) {
  return (
    <header className="bg-white border-bottom py-2">
      <div className="container-fluid px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-dark me-2 d-md-none p-1"
              onClick={OpenSidebar}
            >
              <BsJustify className="fs-4" />
            </button>
            <h6 className="mb-0 text-dark d-none d-md-block">Administración</h6>
          </div>

          <div className="d-flex align-items-center">
            <button className="btn btn-link text-dark position-relative p-1">
              <BsFillBellFill className="fs-5" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" 
                    style={{ fontSize: "0.5rem", width: "8px", height: "8px" }}>
              </span>
            </button>
            
            <div className="dropdown ms-2">
              <button 
                className="btn btn-link text-dark p-1 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <BsPersonCircle className="fs-5" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item">Cerrar sesión</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;