import {
  ArrowRightOutlined,
  EyeOutlined,
  ExperimentOutlined,
  LoginOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const boardCells = Array.from({ length: 20 }, (_, index) => index + 1);

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
          <a href="#proposito">Proposito</a>
          <a href="#experiencia">Experiencia</a>
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>Acceder</Button>
        </nav>
      </header>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <Typography.Text className="welcome-eyebrow">Tablero multisensorial inclusivo</Typography.Text>
          <Typography.Title id="welcome-title">Aprender jugando,<br /><span>incluir ensenando</span></Typography.Title>
          <Typography.Paragraph>
            Una experiencia educativa sobre las regiones del Ecuador, disenada para que cada jugada se escuche, se sienta y se comparta.
          </Typography.Paragraph>
          <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}>
            Explorar el panel
          </Button>
        </div>

        <div className="welcome-board-wrap" aria-label="Representacion del tablero fisico de Parchis">
          <div className="welcome-board">
            {boardCells.map((cell) => <span className={`welcome-cell cell-${cell}`} key={cell}>{cell}</span>)}
            <div className="welcome-center"><ExperimentOutlined /><strong>Parchis<br />inclusivo</strong></div>
            <span className="welcome-token token-blue" />
            <span className="welcome-token token-red" />
            <span className="welcome-token token-green" />
            <span className="welcome-token token-yellow" />
          </div>
        </div>
      </section>

      <section className="welcome-benefits" id="proposito" aria-label="Principios del proyecto">
        <article><EyeOutlined /><div><strong>Inclusivo</strong><span>Accesible mediante sonido, tacto y acompanamiento visual.</span></div></article>
        <article><ExperimentOutlined /><div><strong>Educativo</strong><span>Preguntas y contenidos sobre la diversidad del Ecuador.</span></div></article>
        <article id="experiencia"><SoundOutlined /><div><strong>Multisensorial</strong><span>El tablero fisico guia cada momento de la partida.</span></div></article>
      </section>
    </main>
  );
}
