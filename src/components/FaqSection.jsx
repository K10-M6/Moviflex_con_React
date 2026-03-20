import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const FaqSection = () => {
    const brandColor = "#56bca7";
    const secondaryColor = "#2d5a52";

    const questions = [
        { q: "¿Es seguro viajar con MoviFlex?", a: "Absolutamente. Todos nuestros conductores pasan por un proceso de verificación de identidad, documentos del vehículo y antecedentes. Además, contamos con un sistema de calificación por estrellas." },
        { q: "¿Cómo se dividen los gastos?", a: "MoviFlex calcula una tarifa sugerida justa basada en la distancia y el consumo de combustible, dividiéndola equitativamente entre los pasajeros." },
        { q: "¿Puedo cancelar un viaje?", a: "Sí, puedes cancelar desde la app. Te recomendamos hacerlo con al menos 30 minutos de antelación para que el conductor o los pasajeros puedan reorganizar su ruta." },
        { q: "¿Qué pasa si tengo un objeto perdido?", a: "Nuestra app permite contactar directamente al conductor después del viaje. También puedes escribirnos a soporte para ayudarte a recuperarlo." },
        { q: "¿Qué métodos de pago aceptan?", a: "Actualmente manejamos pagos en efectivo directamente al conductor, pero estamos trabajando para integrar billeteras digitales muy pronto." }
    ];

    return (
        <section className="py-5 bg-white">
            <Container style={{ maxWidth: '800px' }}>
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: brandColor, fontSize: '2.5rem' }}>Preguntas Frecuentes</h2>
                    <p className="text-muted">Todo lo que necesitas saber para empezar a moverte con confianza.</p>
                </div>

                <Accordion className="border-0 shadow-sm rounded-4 overflow-hidden">
                    {questions.map((item, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index} className="border-0 border-bottom">
                            <Accordion.Header className="py-2">
                                <span className="fw-bold" style={{ color: secondaryColor }}>{item.q}</span>
                            </Accordion.Header>
                            <Accordion.Body className="text-muted" style={{ lineHeight: '1.7' }}>
                                {item.a}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Container>
            <style jsx>{`
                .accordion-button:not(.collapsed) {
                    background-color: #e8f6f3;
                    color: #56bca7;
                    box-shadow: none;
                }
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(86,188,167,0.1);
                }
            `}</style>
        </section>
    );
};

export default FaqSection;
