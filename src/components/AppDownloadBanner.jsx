import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const AppDownloadBanner = () => {
    const brandColor = "#56bca7";
    
    return (
        <section className="py-5" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, #3a9382 100%)`, borderRadius: '40px', margin: '40px 20px', overflow: 'hidden' }}>
            <Container>
                <Row className="align-items-center text-center text-lg-start">
                    <Col lg={7} className="text-white ps-lg-5">
                        <h2 className="display-5 fw-bold mb-3">Lleva MoviFlex en tu bolsillo</h2>
                        <p className="lead mb-4 opacity-75">
                            Pronto disponible para iOS y Android. Únete a la lista de espera y sé el primero en probar la experiencia móvil definitiva.
                        </p>
                        <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                            <Button variant="light" size="lg" className="d-flex align-items-center py-2 px-4 shadow rounded-pill" style={{ fontWeight: '600' }}>
                                <FaApple className="me-2" size={24} /> App Store
                            </Button>
                            <Button variant="light" size="lg" className="d-flex align-items-center py-2 px-4 shadow rounded-pill" style={{ fontWeight: '600' }}>
                                <FaGooglePlay className="me-2" size={24} /> Google Play
                            </Button>
                        </div>
                    </Col>
                    <Col lg={5} className="mt-5 mt-lg-0 text-center">
                        <div className="animate__animated animate__pulse animate__infinite animate__slower">
                            <div style={{
                                width: '250px',
                                height: '500px',
                                background: '#333',
                                borderRadius: '40px',
                                border: '8px solid #444',
                                margin: '0 auto',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ color: '#555', fontSize: '1.2rem', fontWeight: 'bold' }}>MoviFlex App</span>
                                {/* Mock camera notch */}
                                <div style={{ position: 'absolute', top: '10px', width: '80px', height: '20px', background: '#222', borderRadius: '10px' }}></div>
                                {/* Inner glow */}
                                <div style={{ position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '5px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '35px' }}></div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AppDownloadBanner;
