import { Container, Form, Button, Col, Card, Row } from 'react-bootstrap'
import { useState } from 'react'

function Register() {
    const [userType, setUserType] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [idDocument, setIdDocument] = useState(null)
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [driverLicense, setDriverLicense] = useState(null)
    const [soatDocument, setSoatDocument] = useState(null)
    const [vehiclePhoto, setVehiclePhoto] = useState(null)
    const [termsCheck, setTermsCheck] = useState(false)

    async function guardar(e) {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden')
            return false
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/
        if (!passwordRegex.test(password)) {
            alert('La contraseña debe tener al menos 10 caracteres, incluyendo mayúsculas, números y símbolos')
            return false
        }
        
        if (!termsCheck) {
            alert('Debes aceptar los términos y condiciones')
            return false
        }

        console.log({
            userType,
            firstName,
            lastName,
            idDocument,
            email,
            phone,
            password
        })
        
        alert('Registro completado')
    }

    return (


       <Container style={{position: 'absolute',top: '50%', left: '50%', height:'100vh', transform: 'translate(-50%, -50%)', marginTop: '2rem', marginBottom: '2rem', alignItems: 'center', flexDirection: 'column'}}>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                            <h4 style={{ textAlign: 'center' }}>Registro</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={guardar}>
                                <Row style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                                    <Col>
                                        <h5>Tipo de usuario</h5>
                                        <Form.Select 
                                            value={userType} 
                                            onChange={(e) => setUserType(e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="cliente">Cliente</option>
                                            <option value="conductor">Conductor</option>
                                        </Form.Select>
                                    </Col>
                                </Row>

                                <Row style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                                    <Col>
                                        <h5>Información personal</h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group style={{ marginBottom: '1rem' }}>
                                                    <Form.Label>Nombres</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        required 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group style={{ marginBottom: '1rem' }}>
                                                    <Form.Label>Apellidos</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        required 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Group style={{ marginBottom: '1rem' }}>
                                            <Form.Label>Cédula de Ciudadanía</Form.Label>
                                            <Form.Control 
                                                type="file" 
                                                accept=".pdf"
                                                onChange={(e) => setIdDocument(e.target.files[0])}
                                                required 
                                            />
                                            <Form.Text style={{ color: '#6c757d' }}>
                                                Sube tu cédula escaneada en formato PDF (máx. 5MB)
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group style={{ marginBottom: '1rem' }}>
                                            <Form.Label>Correo electrónico</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required 
                                            />
                                        </Form.Group>

                                        <Form.Group style={{ marginBottom: '1rem' }}>
                                            <Form.Label>Teléfono</Form.Label>
                                            <Form.Control 
                                                type="tel" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                                    <Col>
                                        <h5>Seguridad</h5>
                                        <Form.Group style={{ marginBottom: '1rem' }}>
                                            <Form.Label>Contraseña</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                minLength="10"
                                                required 
                                            />
                                            <Form.Text style={{ color: '#6c757d' }}>
                                                Mínimo 10 caracteres, incluyendo mayúsculas, números y símbolos.
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group style={{ marginBottom: '1rem' }}>
                                            <Form.Label>Confirmar contraseña</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {userType === 'conductor' && (
                                    <Row style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                                        <Col>
                                            <h5>Documentación para conductores</h5>
                                            <div style={{ 
                                                padding: '0.75rem', 
                                                backgroundColor: '#d1ecf1', 
                                                border: '1px solid #bee5eb',
                                                borderRadius: '0.25rem',
                                                color: '#0c5460',
                                                marginBottom: '1rem'
                                            }}>
                                                Los conductores deben subir los siguientes documentos para verificación.
                                            </div>
                                            
                                            <Form.Group style={{ marginBottom: '1rem' }}>
                                                <Form.Label>Licencia de conducir</Form.Label>
                                                <Form.Control 
                                                    type="file" 
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={(e) => setDriverLicense(e.target.files[0])}
                                                    required 
                                                />
                                            </Form.Group>

                                            <Form.Group style={{ marginBottom: '1rem' }}>
                                                <Form.Label>SOAT vigente</Form.Label>
                                                <Form.Control 
                                                    type="file" 
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={(e) => setSoatDocument(e.target.files[0])}
                                                    required 
                                                />
                                            </Form.Group>

                                            <Form.Group style={{ marginBottom: '1rem' }}>
                                                <Form.Label>Foto del vehículo (frontal)</Form.Label>
                                                <Form.Control 
                                                    type="file" 
                                                    accept=".jpg,.png"
                                                    onChange={(e) => setVehiclePhoto(e.target.files[0])}
                                                    required 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                <Form.Group style={{ marginBottom: '1.5rem' }}>
                                    <Form.Check 
                                        type="checkbox"
                                        label="Acepto los términos y condiciones"
                                        checked={termsCheck}
                                        onChange={(e) => setTermsCheck(e.target.checked)}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                                    Registrarse
                                </Button>
                            </Form>
                            
                            <Row style={{ marginTop: '1rem' }}>
                                <Col style={{ textAlign: 'center' }}>
                                    <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Register