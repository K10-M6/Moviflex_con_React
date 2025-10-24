import { useEffect, useState } from "react"

function UsersAdmin() {
    const [usuario,setUsuario]=useState([])
    useEffect(() => {
        traerUsuario()
    }, [])
    function traerUsuario() {
        fetch('https://',{
            headers:{
                apikey: '..',
                Authorization: 'Bearer'
            }
        }).then((respuesta)=>respuesta.json())
        .then((data)=>setUsuario(data))
    }
    
     async function Aprobar (event) {
        event.preventDefault()
        await fetch('https://', {
         method:'POST',
         
         headers:{
            'Content-Type': 'application/json',
            apikey: '',
            Authorization: ''
         },
        body:JSON.stringify({nombre:nombre, correo:correo, rol:rol})
        })
    }

    async function eliminar (id){
        const respuesta = await fetch(`${id}`, {
            method: "DELETE",
            headers: {
                apikey: '',
                Authorization: 'Bearer '
            }
        });
    }
    
    return (
    <div>
        <h2> Lista de usuarios</h2>
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol Actual</th>
                    <th>Opciones</th>
                </tr>
            </thead>
            <tbody>
                {
                    usuario.map((emp) => (
                        <tr>
                            <td>{emp.id_usuario}</td>
                            <td>{emp.nombre}</td>
                            <td>{emp.correo}</td>
                            <td>{emp.rol}</td>
                            <td>
                                <button onClick={() => Aprobar(emp.id_usuario, emp.nombre, emp.correo, emp.Rol)}>Aprobar</button>
                                <button onClick={()=>eliminar(emp.id_usuario)}>Eliminar</button>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
    )
}
export default UsersAdmin