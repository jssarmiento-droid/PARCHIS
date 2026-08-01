import {
  ApiOutlined,
  ArrowRightOutlined,
  ControlOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  EyeOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const steps = [
  { icon: <PlayCircleOutlined />, title: 'Inicia la partida', text: 'El tablero verifica el sistema y prepara a los jugadores.' },
  { icon: <ControlOutlined />, title: 'Lanza el dado', text: 'El ESP32 anuncia el turno y genera el siguiente movimiento.' },
  { icon: <ExperimentOutlined />, title: 'Mueve la ficha', text: 'Los sensores Hall validan la casilla alcanzada.' },
  { icon: <SoundOutlined />, title: 'Escucha y responde', text: 'Las preguntas y contenidos guian el aprendizaje.' },
];

const technology = [
  ['ESP32', 'Coordina la partida y la conexion con la plataforma.'],
  ['Arduino UNO', 'Lee los sensores Hall del recorrido inicial.'],
  ['Sensores Hall', 'Validan el movimiento de cada ficha.'],
  ['DFPlayer Mini', 'Reproduce las instrucciones y preguntas.'],
  ['Botones fisicos', 'Permiten responder sin depender de una pantalla.'],
  ['Plataforma web', 'Supervisa, registra y reporta cada partida.'],
];

const regions = [
  ['Costa', 'Agricultura tropical y biodiversidad del litoral.', 'region-costa'],
  ['Sierra', 'Cultivos andinos, volcanes y saberes ancestrales.', 'region-sierra'],
  ['Amazonia', 'Rios, provincias y riqueza natural de la selva.', 'region-amazonia'],
  ['Region Insular', 'Especies y conservacion de Galapagos.', 'region-insular'],
];

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <button className="welcome-brand" type="button" onClick={() => navigate('/')} aria-label="Inicio de Parchis Inclusivo">
          <span className="welcome-brand-mark"><ExperimentOutlined /></span>
          <span><strong>Parchis</strong><small>Educativo</small></span>
        </button>
        <nav className="welcome-nav" aria-label="Navegacion principal">
          <a href="#funciona">Como funciona</a>
          <a href="#tecnologia">Tecnologia</a>
          <a href="#accesibilidad">Accesibilidad</a>
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>Acceder al panel</Button>
        </nav>
      </header>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <Typography.Text className="welcome-eyebrow">Juego educativo inclusivo</Typography.Text>
          <Typography.Title id="welcome-title">Aprender jugando,<br /><span>incluir ense&ntilde;ando.</span></Typography.Title>
          <Typography.Paragraph>
            Una experiencia multisensorial que une agricultura, aprendizaje, accesibilidad y tecnologia para descubrir el Ecuador jugando.
          </Typography.Paragraph>
          <div className="welcome-actions">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}>Explorar el panel</Button>
            <Button size="large" onClick={() => document.getElementById('funciona')?.scrollIntoView({ behavior: 'smooth' })}>Conocer el proyecto</Button>
          </div>
        </div>

        <div className="welcome-board-visual" aria-label="Resumen visual del tablero inclusivo">
          <div className="welcome-board-meta"><span><ApiOutlined /> 28 casillas sensorizadas</span><span><SoundOutlined /> Guia por audio</span></div>
          <div className="welcome-board-surface">
            <div className="welcome-route route-top">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
            <div className="welcome-route route-right">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
            <div className="welcome-route route-bottom">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
            <div className="welcome-route route-left">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
            <div className="welcome-board-core"><ExperimentOutlined /><strong>Parchis<br />inclusivo</strong></div>
            <span className="route-piece piece-blue" /><span className="route-piece piece-red" /><span className="route-piece piece-green" /><span className="route-piece piece-yellow" />
          </div>
          <div className="welcome-board-controls"><span>Encendido</span><span>Dado</span><span>A</span><span>B</span><span>Repetir</span><span>Confirmar</span></div>
        </div>
      </section>

      <section className="welcome-benefits" aria-label="Principios del proyecto">
        <article><EyeOutlined /><div><strong>Inclusivo</strong><span>El juego comunica cada accion a traves de audio y controles fisicos.</span></div></article>
        <article><ExperimentOutlined /><div><strong>Educativo</strong><span>Las preguntas convierten el recorrido en una experiencia de aprendizaje.</span></div></article>
        <article><SoundOutlined /><div><strong>Multisensorial</strong><span>Sonido, tacto, sensores y retroalimentacion en una misma partida.</span></div></article>
        <article><SafetyCertificateOutlined /><div><strong>Tecnologia accesible</strong><span>El tablero valida movimientos y mantiene el juego acompanado.</span></div></article>
      </section>

      <section className="welcome-section welcome-process" id="funciona">
        <div className="welcome-section-heading">
          <Typography.Text>Una partida acompa&ntilde;ada</Typography.Text>
          <Typography.Title level={2}>Como funciona el juego</Typography.Title>
          <Typography.Paragraph>Una secuencia clara para que el tablero fisico y la plataforma trabajen juntos.</Typography.Paragraph>
        </div>
        <div className="welcome-steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span className="welcome-step-number">0{index + 1}</span>
              <span className="welcome-step-icon">{step.icon}</span>
              <Typography.Title level={4}>{step.title}</Typography.Title>
              <Typography.Paragraph>{step.text}</Typography.Paragraph>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-section welcome-tech" id="tecnologia">
        <div className="welcome-section-heading">
          <Typography.Text>Tablero + software</Typography.Text>
          <Typography.Title level={2}>Tecnologia que acompa&ntilde;a</Typography.Title>
        </div>
        <div className="welcome-tech-grid">
          {technology.map(([name, text]) => (
            <article key={name}>
              <DatabaseOutlined />
              <div><strong>{name}</strong><span>{text}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-accessibility" id="accesibilidad">
        <div><Typography.Text>Accesibilidad desde el origen</Typography.Text><Typography.Title level={2}>El tablero no depende de la vista para jugar.</Typography.Title></div>
        <ul>
          <li>Instrucciones y preguntas reproducidas por audio.</li>
          <li>Botones fisicos para dado, opciones y confirmacion.</li>
          <li>Sensores que validan cada movimiento sobre el tablero.</li>
          <li>Monitoreo web para el docente o supervisor.</li>
        </ul>
      </section>

      <section className="welcome-section welcome-regions" aria-labelledby="regions-title">
        <div className="welcome-section-heading"><Typography.Text>Aprender desde el territorio</Typography.Text><Typography.Title id="regions-title" level={2}>Ecuador en cada pregunta</Typography.Title></div>
        <div className="welcome-region-grid">
          {regions.map(([name, text, color]) => <article className={color} key={name}><strong>{name}</strong><span>{text}</span></article>)}
        </div>
      </section>
    </main>
  );
}
