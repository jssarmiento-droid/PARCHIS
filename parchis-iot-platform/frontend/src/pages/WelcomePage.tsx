import {
  ApiOutlined,
  ArrowRightOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  ControlOutlined,
  ExperimentOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { OfficialBoard } from '../components/OfficialBoard';

const previewPieces = [
  { color: 'BLUE' as const, tile: 4, label: 'Jugador azul' },
  { color: 'RED' as const, tile: 9, label: 'Jugador rojo' },
  { color: 'GREEN' as const, tile: 14, label: 'Jugador verde' },
  { color: 'YELLOW' as const, tile: 19, label: 'Jugador amarillo' },
];

const features = [
  { icon: <AudioOutlined />, title: 'Accesibilidad', text: 'Guía por voz, botones físicos y validación de cada movimiento.' },
  { icon: <ExperimentOutlined />, title: 'Educación', text: 'Preguntas sobre las regiones y la diversidad del Ecuador.' },
  { icon: <ApiOutlined />, title: 'Sensores', text: '28 sensores Hall mantienen el tablero físico sincronizado.' },
  { icon: <CloudServerOutlined />, title: 'Plataforma web', text: 'Supervisión, historial y reportes desde un solo panel.' },
];

const steps = [
  { icon: <PlayCircleOutlined />, title: 'Lanza el dado', text: 'El ESP32 genera y anuncia el resultado.' },
  { icon: <ControlOutlined />, title: 'Mueve la ficha', text: 'El jugador avanza sobre el recorrido físico.' },
  { icon: <CheckCircleOutlined />, title: 'El sistema valida', text: 'Los sensores confirman la posición correcta.' },
  { icon: <SoundOutlined />, title: 'Escucha y aprende', text: 'El tablero reproduce la pregunta o el contenido.' },
];

const technology = [
  ['ESP32', 'Control principal y conexión WiFi'],
  ['ESP32 sensores', 'Lectura de sensores 1 a 15'],
  ['28 sensores Hall', 'Detección de posiciones'],
  ['DFPlayer Mini', 'Retroalimentación auditiva'],
  ['WebSocket', 'Monitoreo en tiempo real'],
];

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <button className="welcome-brand" type="button" onClick={() => navigate('/')} aria-label="Inicio de Parchís Inclusivo">
          <span className="welcome-brand-mark"><ExperimentOutlined /></span>
          <span><strong>Parchís Inclusivo</strong><small>Plataforma educativa IoT</small></span>
        </button>
        <nav className="welcome-nav" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#funciona">Cómo funciona</a>
          <a href="#tecnologia">Tecnología</a>
          <a href="#accesibilidad">Accesibilidad</a>
          <a href="#proyecto">Proyecto</a>
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>Acceder</Button>
        </nav>
      </header>

      <section className="welcome-hero" id="inicio" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <Typography.Text className="welcome-eyebrow">Juego educativo inclusivo</Typography.Text>
          <Typography.Title id="welcome-title">Aprender jugando.<br />Incluir aprendiendo.</Typography.Title>
          <Typography.Paragraph>
            Una experiencia multisensorial que combina agricultura, accesibilidad y tecnología para aprender sobre las regiones del Ecuador.
          </Typography.Paragraph>
          <div className="welcome-actions">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}>Explorar el panel</Button>
            <Button size="large" onClick={() => document.getElementById('funciona')?.scrollIntoView({ behavior: 'smooth' })}>Conocer el proyecto</Button>
          </div>
        </div>

        <div className="product-preview" aria-label="Vista del sistema de monitoreo del tablero">
          <div className="product-preview-header">
            <div><span>Tablero en tiempo real</span><small>Vista del sistema físico</small></div>
            <span className="system-badge"><i /> Sistema listo</span>
          </div>
          <div className="product-preview-body">
            <OfficialBoard compact pieces={previewPieces} />
            <div className="physical-controls" aria-label="Controles físicos del tablero">
              {['Encendido', 'Dado', 'A', 'B', 'Repetir', 'Confirmar'].map((control) => <span key={control}>{control}</span>)}
            </div>
          </div>
          <div className="product-preview-footer">
            <span><i className="status-dot is-green" />28 sensores</span>
            <span><i className="status-dot is-green" />Audio disponible</span>
            <span><i className="status-dot is-green" />ESP32 conectado</span>
          </div>
        </div>
      </section>

      <section className="welcome-features" aria-label="Características del proyecto">
        {features.map((feature) => (
          <article key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <div><strong>{feature.title}</strong><p>{feature.text}</p></div>
          </article>
        ))}
      </section>

      <section className="welcome-section welcome-process" id="funciona">
        <div className="welcome-section-heading">
          <Typography.Text>Una secuencia clara</Typography.Text>
          <Typography.Title level={2}>Cómo funciona una partida</Typography.Title>
          <Typography.Paragraph>El tablero físico y la plataforma trabajan juntos sin depender de indicaciones visuales.</Typography.Paragraph>
        </div>
        <div className="welcome-steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span className="welcome-step-number">{index + 1}</span>
              <span className="welcome-step-icon">{step.icon}</span>
              <div><strong>{step.title}</strong><p>{step.text}</p></div>
              {index < steps.length - 1 ? <ArrowRightOutlined className="step-arrow" /> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-section welcome-tech" id="tecnologia">
        <div className="welcome-section-heading">
          <Typography.Text>Hardware y software</Typography.Text>
          <Typography.Title level={2}>Tecnología detrás del tablero</Typography.Title>
        </div>
        <div className="technology-list">
          {technology.map(([name, detail]) => (
            <article key={name}><span>{name}</span><p>{detail}</p><CheckCircleOutlined /></article>
          ))}
        </div>
      </section>

      <section className="welcome-accessibility" id="accesibilidad">
        <div>
          <Typography.Text>Accesibilidad desde el origen</Typography.Text>
          <Typography.Title level={2}>Jugar sin depender de la vista.</Typography.Title>
          <Typography.Paragraph>Las acciones importantes se comunican por audio y se validan directamente sobre el tablero.</Typography.Paragraph>
        </div>
        <ul>
          <li><SafetyCertificateOutlined /><span><strong>Interacción autónoma</strong>Botones físicos identificables y confirmación auditiva.</span></li>
          <li><SoundOutlined /><span><strong>Información constante</strong>Turnos, movimientos, preguntas y resultados por voz.</span></li>
          <li><ApiOutlined /><span><strong>Validación física</strong>Los sensores detectan posiciones y movimientos incorrectos.</span></li>
        </ul>
      </section>

      <section className="welcome-project" id="proyecto">
        <div><span>Proyecto universitario</span><strong>Parchís Inclusivo Multisensorial</strong></div>
        <p>Educación, agricultura y tecnología accesible desarrolladas en Ecuador.</p>
      </section>
    </main>
  );
}
