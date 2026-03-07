import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL, API_URL } from '../config';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token, usuario } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (token) {
            const newSocket = io(API_BASE_URL, {
                auth: { token }
            });

            newSocket.on("connect", () => {
                console.log("Conectado al servidor de notificaciones");
            });

            // Si es administrador, escuchar eventos especiales
            if (usuario?.rol?.nombre === 'ADMIN' || usuario?.idRol === 1) {
                newSocket.on("new_user_registration", (data) => {
                    toast.success(`¡Nuevo registro! ${data.nombre} (${data.rol})`, {
                        duration: 5000,
                        position: 'top-right',
                        icon: '🆕'
                    });
                });

                newSocket.on("new_document_uploaded", (data) => {
                    toast.success(`📄 ${data.nombre} ha subido documentación`, {
                        duration: 4000,
                        position: 'top-right',
                        icon: '📄'
                    });
                });

                newSocket.on("user_connected", (data) => {
                    toast.success(`${data.nombre} se ha conectado`, {
                        duration: 3000,
                        position: 'top-right'
                    });
                    // Actualizar lista de usuarios online si es necesario
                    fetchOnlineUsers();
                });

                newSocket.on("user_disconnected", (data) => {
                    toast.error(`${data.nombre} se ha desconectado`, {
                        duration: 3000,
                        position: 'top-right'
                    });
                    fetchOnlineUsers();
                });
            }

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token, usuario]);

    const fetchOnlineUsers = async () => {
        if (!token || (usuario?.rol?.nombre !== 'ADMIN' && usuario?.idRol !== 1)) return;
        try {
            const response = await fetch(`${API_URL}/auth/online-users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setOnlineUsers(data);
            }
        } catch (error) {
            console.error("Error al obtener usuarios online:", error);
        }
    };

    useEffect(() => {
        fetchOnlineUsers();
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, fetchOnlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
