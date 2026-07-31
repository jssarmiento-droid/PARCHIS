import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { api } from '../services/api';

interface Question {
  id: string;
  title: string;
  text: string;
  optionA: string;
  optionB: string;
  correctOption: string;
  topic: string;
  status: boolean;
}

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [filters, setFilters] = useState({ search: '', topic: '' });
  const [form] = Form.useForm();

  async function loadQuestions() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/questions', { params: filters });
      setQuestions(data);
    } catch {
      setError('Revisa la conexión con el backend e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions().catch(() => undefined);
  }, [filters]);

  function openEditor(question?: Question) {
    setEditing(question || null);
    form.setFieldsValue(question || { correctOption: 'A', status: true });
    setOpen(true);
  }

  async function saveQuestion(values: Question) {
    if (editing) {
      await api.patch(`/questions/${editing.id}`, values);
      message.success('Pregunta actualizada');
    } else {
      await api.post('/questions', values);
      message.success('Pregunta creada');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    loadQuestions();
  }

  async function deleteQuestion(id: string) {
    await api.delete(`/questions/${id}`);
    message.success('Pregunta eliminada');
    loadQuestions();
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Gestión de preguntas" subtitle="Banco educativo utilizado por el ESP32 durante las casillas de pregunta." />
      <Card extra={<Button type="primary" onClick={() => openEditor()}>Crear pregunta</Button>}>
        <Space wrap className="toolbar">
          <Input.Search placeholder="Buscar pregunta" allowClear onSearch={(search) => setFilters((current) => ({ ...current, search }))} />
          <Input placeholder="Filtrar por tema" allowClear onChange={(event) => setFilters((current) => ({ ...current, topic: event.target.value }))} />
        </Space>
        <AsyncState loading={loading} error={error} empty={questions.length === 0} onRetry={loadQuestions}>
          <Table
            rowKey="id"
            dataSource={questions}
            columns={[
              { title: 'Título', dataIndex: 'title' },
              { title: 'Pregunta', dataIndex: 'text' },
              { title: 'Tema', dataIndex: 'topic' },
              { title: 'Respuesta', dataIndex: 'correctOption' },
              { title: 'Estado', dataIndex: 'status', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Activa' : 'Inactiva'}</Tag> },
              {
                title: 'Acciones',
                render: (_, row) => (
                  <Space>
                    <Button onClick={() => openEditor(row)}>Editar</Button>
                    <Popconfirm title="Eliminar pregunta" description="Esta acción no se puede deshacer." onConfirm={() => deleteQuestion(row.id)}>
                      <Button danger>Eliminar</Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </AsyncState>
      </Card>
      <Modal title={editing ? 'Editar pregunta' : 'Nueva pregunta'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Guardar">
        <Form form={form} layout="vertical" onFinish={saveQuestion} initialValues={{ correctOption: 'A', status: true }}>
          <Form.Item label="Título" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Pregunta" name="text" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
          <Form.Item label="Opción A" name="optionA" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Opción B" name="optionB" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Respuesta correcta" name="correctOption"><Select options={[{ value: 'A' }, { value: 'B' }]} /></Form.Item>
          <Form.Item label="Tema" name="topic" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Activa" name="status" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
