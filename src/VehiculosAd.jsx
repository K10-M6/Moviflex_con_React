import { useEffect, useState } from "react"

function VehiculosAd() {
    const [vehiculo,setVehiculo]=useState([])
    useEffect(() => {
        traerVehiculo()
    }, [])
    function traerVehiculo() {
        fetch('https://',{
            headers:{
                apikey: '..',
                Authorization: 'Bearer'
            }
        }).then((respuesta)=>respuesta.json())
        .then((data)=>setVehiculo(data))
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
        body:JSON.stringify({placa:placa, modelo:modelo, propietario:propietario, documentos:documentos})
        })
    }

    async function Rechazar (id){
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
        <h2> Lista de vehiculos</h2>
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Placa</th>
                    <th>modelo</th>
                    <th>Propietario</th>
                    <th>Documentos</th>
                    <th>Opciones</th>
                </tr>
            </thead>
            <tbody>
                {
                    vehiculo.map((emp) => (
                        <tr>
                            <td>{emp.id_vehiculo}</td>
                            <td>{emp.placa}</td>
                            <td>{emp.modelo}</td>
                            <td>{emp.propietario}</td>
                            <td>{emp.documentos}</td>
                            <td>
                                <button onClick={() => Aprobar(emp.id_vehiculo, emp.placa, emp.modelo, emp.propietario, emp.documentos)}>Aprobar</button>
                                <button onClick={()=>Rechazar(emp.id_vehiculo)}>Rechazar</button>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
    )
}
export default VehiculosAd