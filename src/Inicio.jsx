function Inicio() {
    return (
    <div className="inicio-container">
      {/* Cabecera */}
      <header className="cabecera">
        <div className="cabecera-content">
          {/* Título a la izquierda */}
          <div className="titulo-section">
            <h1 className="titulo">Mi Aplicación</h1>
          </div>
          
          {/* Espacio para imagen */}
          <div className="imagen-section">
            <img 
              src="/ruta/a/tu/imagen.jpg" // Reemplaza con la ruta de tu imagen
              alt="Logo o imagen descriptiva"
              className="imagen-logo"
            />
          </div>
          
          {/* Botón de inicio de sesión */}
          <div className="login-section">
            <button 
              className="login-btn"
              onClick={handleLogin}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal de la página */}
      <main className="main-content">
        <h2>Bienvenido a nuestra aplicación</h2>
        <p>Este es el contenido principal de tu página de inicio.</p>
      </main>
    </div>
  );
}
export default Inicio;