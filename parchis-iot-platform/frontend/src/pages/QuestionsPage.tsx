import { EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag, message } from 'antd';
import { useMemo, useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';

type QuestionRegion = 'COSTA' | 'SIERRA' | 'AMAZONIA' | 'GALAPAGOS' | 'GENERAL';

interface Question {
  id: string;
  title: string;
  text: string;
  optionA: string;
  optionB: string;
  correctOption: string;
  topic: string;
  region: QuestionRegion;
  audioTrack: number;
  status: boolean;
}

const regionOptions = [
  { value: 'COSTA', label: 'Costa' },
  { value: 'SIERRA', label: 'Sierra' },
  { value: 'AMAZONIA', label: 'Amazonía' },
  { value: 'GALAPAGOS', label: 'Galápagos' },
  { value: 'GENERAL', label: 'General' },
];

const regionLabel = Object.fromEntries(
  regionOptions.map((region) => [region.value, region.label]),
) as Record<QuestionRegion, string>;

export function QuestionsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [filters, setFilters] = useState({ search: '', topic: '', region: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data, loading, refreshing, error, reload, setData } = useResource<Question[]>(
    async () => (await api.get('/questions', { params: filters })).data,
    [filters.search, filters.topic, filters.region],
    25000,
  );
  const questions = data || [];
  const topicOptions = useMemo(
    () => Array.from(new Set(questions.map((question) => question.topic).filter(Boolean)))
      .map((topic) => ({ value: topic, label: topic })),
    [questions],
  );

  function openEditor(question?: Question) {
    setEditing(question || null);
    form.setFieldsValue(question || {
      correctOption: 'A',
      region: 'COSTA',
      status: true,
    });
    setOpen(true);
  }

  async function saveQuestion(values: Question) {
    setSaving(true);
    try {
      if (editing) {
        const { data: updated } = await api.patch(`/questions/${editing.id}`, values);
        setData((current) => current?.map((question) => question.id === editing.id ? updated : question) || [updated]);
        message.success('Pregunta actualizada');
      } else {
        const { data: created } = await api.post('/questions', values);
        setData((current) => [created, ...(current || [])]);
        message.success('Pregunta creada');
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    } catch {
      message.error('No se pudo guardar. Comprueba que la pista no esté asignada a otra pregunta.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/questions/${id}`);
      setData((current) => current?.filter((question) => question.id !== id) || []);
      message.success('Pregunta eliminada');
    } catch {
      message.error('No se pudo eliminar la pregunta');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Banco de preguntas"
        subtitle="Preguntas permanentes organizadas por región y vinculadas a las pistas de la microSD."
        extra={
          <>
            <Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>Crear pregunta</Button>
          </>
        }
      />
      <Card className="data-card">
        <Space wrap className="toolbar">
          <Input.Search
            placeholder="Buscar pregunta"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(search) => setFilters((current) => ({ ...current, search }))}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="Filtrar por región"
            options={regionOptions}
            onChange={(region) => setFilters((current) => ({ ...current, region: region || '' }))}
            style={{ width: 200 }}
          />
          <Select
            allowClear
            showSearch
            placeholder="Filtrar por tema"
            options={topicOptions}
            onChange={(topic) => setFilters((current) => ({ ...current, topic: topic || '' }))}
            style={{ width: 220 }}
          />
        </Space>
        <AsyncState loading={loading} error={error} empty={questions.length === 0} emptyText="Todavía no hay preguntas registradas." onRetry={reload}>
          <Table
            rowKey="id"
            dataSource={questions}
            loading={refreshing}
            scroll={{ x: 1080 }}
            columns={[
              { title: 'Título', dataIndex: 'title' },
              { title: 'Pregunta', dataIndex: 'text' },
              { title: 'Región', dataIndex: 'region', render: (value: QuestionRegion) => regionLabel[value] },
              { title: 'Tema', dataIndex: 'topic' },
              { title: 'Pista', dataIndex: 'audioTrack', render: (value: number) => <Tag>{String(value).padStart(4, '0')}.mp3</Tag> },
              { title: 'Respuesta', dataIndex: 'correctOption', render: (value) => <Tag color="green">{value}</Tag> },
              { title: 'Estado', dataIndex: 'status', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Activa' : 'Inactiva'}</Tag> },
              {
                title: 'Acciones',
                render: (_, row) => (
                  <div className="table-actions">
                    <Button icon={<EditOutlined />} onClick={() => openEditor(row)}>Editar</Button>
                    <Popconfirm title="Eliminar pregunta" description="Esta acción no se puede deshacer." onConfirm={() => deleteQuestion(row.id)}>
                      <Button danger loading={deletingId === row.id} disabled={deletingId === row.id}>Eliminar</Button>
                    </Popconfirm>
                  </div>
                ),
              },
            ]}
          />
        </AsyncState>
      </Card>
      <Modal
        title={editing ? 'Editar pregunta' : 'Nueva pregunta'}
        open={open}
        onCancel={() => !saving && setOpen(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={saveQuestion}>
          <Form.Item label="Título" name="title" rules={[{ required: true, message: 'Ingresa un título para identificar la pregunta' }]}><Input /></Form.Item>
          <Form.Item label="Región" name="region" rules={[{ required: true, message: 'Selecciona una región' }]}><Select options={regionOptions} /></Form.Item>
          <Form.Item label="Tema" name="topic" rules={[{ required: true, message: 'Indica el tema educativo' }]}><Input placeholder="Cacao, cultivos, conservación..." /></Form.Item>
          <Form.Item label="Pregunta" name="text" rules={[{ required: true, message: 'Escribe el enunciado de la pregunta' }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Opción A" name="optionA" rules={[{ required: true, message: 'Ingresa la opción A' }]}><Input /></Form.Item>
          <Form.Item label="Opción B" name="optionB" rules={[{ required: true, message: 'Ingresa la opción B' }]}><Input /></Form.Item>
          <Form.Item label="Respuesta correcta" name="correctOption" rules={[{ required: true }]}><Select options={[{ value: 'A' }, { value: 'B' }]} /></Form.Item>
          <Form.Item
            label="Número de pista DFPlayer"
            name="audioTrack"
            extra="Debe coincidir con un archivo entre 0201.mp3 y 0210.mp3 dentro de /mp3/."
            rules={[{ required: true, message: 'Ingresa la pista de la microSD' }]}
          >
            <InputNumber min={201} max={210} precision={0} className="full-width" />
          </Form.Item>
          <Form.Item label="Activa" name="status" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
