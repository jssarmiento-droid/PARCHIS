import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Upload, message } from 'antd';
import { useEffect, useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { API_URL, api } from '../services/api';

interface AudioAsset {
  id: string;
  name: string;
  filename: string;
  relationType: string;
  createdAt: string;
}

export function AudiosPage() {
  const [audios, setAudios] = useState<AudioAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AudioAsset | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  async function loadAudios() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/audios');
      setAudios(data);
    } catch {
      setError('No se pudo cargar la biblioteca de audios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudios().catch(() => undefined);
  }, []);

  async function upload(values: { name: string; relationType: string; file: { file: File } }) {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('relationType', values.relationType);
    formData.append('file', values.file.file);
    await api.post('/audios/upload', formData);
    message.success('Audio subido');
    form.resetFields();
    loadAudios();
  }

  async function updateAudio(values: Partial<AudioAsset>) {
    if (!editing) return;
    await api.patch(`/audios/${editing.id}`, values);
    message.success('Audio actualizado');
    setEditing(null);
    loadAudios();
  }

  async function deleteAudio(id: string) {
    await api.delete(`/audios/${id}`);
    message.success('Audio eliminado');
    loadAudios();
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Gestión de audios" subtitle="Administra archivos MP3 para preguntas, casillas informativas y audios generales." />
      <Card title="Subir audio MP3">
        <Form form={form} layout="inline" onFinish={upload}>
          <Form.Item name="name" rules={[{ required: true }]}><Input placeholder="Nombre del audio" /></Form.Item>
          <Form.Item name="relationType" initialValue="GENERAL">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'QUESTION', label: 'Pregunta' },
                { value: 'INFORMATIVE_TILE', label: 'Casilla informativa' },
                { value: 'GENERAL', label: 'General' },
              ]}
            />
          </Form.Item>
          <Form.Item name="file" rules={[{ required: true }]}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".mp3">
              <Button icon={<UploadOutlined />}>Seleccionar MP3</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit">Subir</Button>
        </Form>
      </Card>
      <Card>
        <AsyncState loading={loading} error={error} empty={audios.length === 0} onRetry={loadAudios}>
          <Table
            rowKey="id"
            dataSource={audios}
            columns={[
              { title: 'Nombre', dataIndex: 'name' },
              { title: 'Archivo', dataIndex: 'filename' },
              { title: 'Relación', dataIndex: 'relationType' },
              { title: 'Vista previa', render: (_, row) => <audio controls src={`${API_URL}/api/v1/audios/${row.id}/stream`} /> },
              { title: 'Fecha', dataIndex: 'createdAt', render: (value) => new Date(value).toLocaleString() },
              {
                title: 'Acciones',
                render: (_, row) => (
                  <Space>
                    <Button onClick={() => { setEditing(row); editForm.setFieldsValue(row); }}>Editar</Button>
                    <Popconfirm title="Eliminar audio" onConfirm={() => deleteAudio(row.id)}>
                      <Button danger>Eliminar</Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </AsyncState>
      </Card>
      <Modal title="Editar audio" open={Boolean(editing)} onCancel={() => setEditing(null)} onOk={() => editForm.submit()} okText="Guardar">
        <Form form={editForm} layout="vertical" onFinish={updateAudio}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Relación" name="relationType">
            <Select options={[{ value: 'QUESTION', label: 'Pregunta' }, { value: 'INFORMATIVE_TILE', label: 'Casilla informativa' }, { value: 'GENERAL', label: 'General' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
