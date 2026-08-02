import { PlayCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App as AntdApp, Button, Card, Checkbox, Col, Form, Input, List, Row, Space, Tabs, Tag, Typography } from 'antd';
import type { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';

type QuestionRegion = 'COSTA' | 'SIERRA' | 'AMAZONIA' | 'GALAPAGOS' | 'GENERAL';

interface QuestionOption {
  id: string;
  title: string;
  text: string;
  topic: string;
  region: QuestionRegion;
  audioTrack: number;
  status: boolean;
}

const players = [
  { name: 'bluePlayer', label: 'Jugador Azul', color: 'blue' },
  { name: 'redPlayer', label: 'Jugador Rojo', color: 'red' },
  { name: 'greenPlayer', label: 'Jugador Verde', color: 'green' },
  { name: 'yellowPlayer', label: 'Jugador Amarillo', color: 'gold' },
];

const regions: Array<{ key: QuestionRegion; label: string }> = [
  { key: 'COSTA', label: 'Costa' },
  { key: 'SIERRA', label: 'Sierra' },
  { key: 'AMAZONIA', label: 'Amazonía' },
  { key: 'GALAPAGOS', label: 'Galápagos' },
  { key: 'GENERAL', label: 'General' },
];

export function NewGamePage() {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const { refresh, systemConfig } = useRealtime();
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const { data: questionData, loading: questionsLoading } = useResource<QuestionOption[]>(
    async () => (await api.get('/questions')).data,
    [],
  );
  const activeQuestions = useMemo(
    () => (questionData || []).filter((question) => question.status),
    [questionData],
  );
  const allowedPlayers = players.slice(0, Math.min(Math.max(systemConfig?.playerCount || 4, 2), 4));

  function toggleQuestion(id: string, checked: boolean) {
    if (checked && selectedQuestionIds.length >= 10) {
      message.warning('Puedes seleccionar hasta diez preguntas por partida');
      return;
    }
    setSelectedQuestionIds((current) => checked
      ? [...current, id]
      : current.filter((questionId) => questionId !== id));
  }

  async function createGame(values: Record<string, string>) {
    if (selectedQuestionIds.length === 0) {
      message.warning('Selecciona al menos una pregunta');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/games', {
        ...values,
        questionIds: selectedQuestionIds,
      });
      await refresh();
      message.success(`Partida preparada: ${data.publicId}. Enciende el tablero para iniciar.`);
      navigate('/monitoreo');
    } catch (error) {
      const response = error as AxiosError<{ message?: string | string[] }>;
      const detail = response.response?.data?.message;
      message.error(Array.isArray(detail) ? detail[0] : detail || 'No se pudo preparar la partida.');
    } finally {
      setSubmitting(false);
    }
  }

  const questionTabs = regions.map((region) => ({
    key: region.key,
    label: `${region.label} (${activeQuestions.filter((question) => question.region === region.key).length})`,
    children: (
      <List
        className="question-selection-list"
        dataSource={activeQuestions.filter((question) => question.region === region.key)}
        locale={{ emptyText: `No hay preguntas activas de ${region.label}` }}
        renderItem={(question) => {
          const checked = selectedQuestionIds.includes(question.id);
          return (
            <List.Item
              className={checked ? 'question-selection-row is-selected' : 'question-selection-row'}
              onClick={() => toggleQuestion(question.id, !checked)}
            >
              <Checkbox
                checked={checked}
                onChange={(event) => toggleQuestion(question.id, event.target.checked)}
                onClick={(event) => event.stopPropagation()}
              >
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>{question.text}</Typography.Text>
                  <Typography.Text type="secondary">
                    {question.topic} · Pista {String(question.audioTrack).padStart(4, '0')}.mp3
                  </Typography.Text>
                </Space>
              </Checkbox>
            </List.Item>
          );
        }}
      />
    ),
  }));

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Nueva partida" subtitle="Registra los jugadores y prepara las preguntas que descargará el ESP32." />
      <Form layout="vertical" onFinish={createGame} disabled={submitting}>
        <Card className="action-card" title="Jugadores de la partida">
          <Row gutter={[16, 8]}>
            {allowedPlayers.map((player) => (
              <Col xs={24} md={12} key={player.name}>
                <Form.Item
                  label={<Tag color={player.color}>{player.label.replace('Jugador ', '')}</Tag>}
                  name={player.name}
                  rules={[
                    ...(player.name === 'bluePlayer' || player.name === 'redPlayer'
                      ? [{ required: true, message: `Ingresa el nombre del ${player.label.toLowerCase()}` }]
                      : []),
                    { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={player.name === 'bluePlayer' || player.name === 'redPlayer'
                      ? player.label
                      : `${player.label} (opcional)`}
                    maxLength={40}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          className="data-card question-selector"
          title="Preguntas de la partida"
          extra={<Tag color={selectedQuestionIds.length === 10 ? 'green' : 'blue'}>{selectedQuestionIds.length} de 10</Tag>}
        >
          <Typography.Paragraph type="secondary">
            Selecciona entre una y diez preguntas. El ESP32 descargará esta selección antes de iniciar el tablero.
          </Typography.Paragraph>
          <Tabs items={questionTabs} />
          {!questionsLoading && activeQuestions.length === 0 ? (
            <Alert type="warning" showIcon message="No hay preguntas activas disponibles." />
          ) : null}
        </Card>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<PlayCircleOutlined />}
          loading={submitting}
          disabled={submitting || questionsLoading || selectedQuestionIds.length === 0}
        >
          Iniciar partida
        </Button>
      </Form>
    </Space>
  );
}
