import { DeleteOutlined, EditOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Progress, Select, Space, Table, Upload, message } from 'antd';
import { useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { useResource } from '../hooks/useResource';
import { API_URL, api } from '../services/api';

interface AudioAsset {
  id: string;
  name: string;
  filename: string;
  relationType: string;
  createdAt: string;
}

const relationOptions = [
  { value: 'QUESTION', label: 'Pregunta' },
  { value: 'INFORMATIVE_TILE', label: 'Casilla informativa' },
  { value: 'GENERAL', label: 'General' },
];

export function AudiosPage() {
  const [editing, setEditing] = useState<AudioAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { data, loading, refreshing, error, reload, setData } = useResource<AudioAsset[]>(
    async () => (await api.get('/audios')).data,
    [],
    30000,
  );
  const audios = data || [];

  async function upload(values: { name: string; relationType: string; file: { file: File } }) {
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('relationType', values.relationType);
    formData.append('file', values.file.file);

    try {
      const { data: created } = await api.post('/audios/upload', formData, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      setData((current) => [created, ...(current || [])]);
      message.success('Audio subido correctamente');
      form.resetFields();
    } catch {
      message.error('No se pudo subir el audio MP3');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function updateAudio(values: Partial<AudioAsset>) {
    if (!editing) return;
    setSaving(true);
    try {
      const { data: updated } = await api.patch(`/audios/${editing.id}`, values);
      setData((current) => current?.map((audio) => audio.id === editing.id ? updated : audio) || [updated]);
      message.success('Audio actualizado');
      setEditing(null);
    } catch {
      message.error('No se pudo actualizar el audio');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAudio(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/audios/${id}`);
      setData((current) => current?.filter((audio) => audio.id !== id) || []);
      message.success('Audio eliminado');
    } catch {
      message.error('No se pudo eliminar el audio');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Gestión de audios"
        subtitle="Administra archivos MP3 para preguntas, casillas informativas y audios generales."
        extra={<Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>}
      />
      <Card className="action-card" title="Subir audio MP3">
        <Form form={form} layout="inline" onFinish={upload} className="mobile-stack">
          <Form.Item name="name" rules={[{ required: true, message: 'Ingresa un nombre para el audio' }]}>
            <Input placeholder="Nombre del audio" disabled={uploading} />
          </Form.Item>
          <Form.Item name="relationType" initialValue="GENERAL">
            <Select style={{ width: 190 }} options={relationOptions} disabled={uploading} />
          </Form.Item>
          <Form.Item
            name="file"
            rules={[
              { required: true, message: 'Selecciona un archivo MP3' },
              {
                validator: (_, value) => {
                  const file = value?.file as File | undefined;
                  if (!file || file.name.toLowerCase().endsWith('.mp3')) return Promise.resolve();
                  return Promise.reject(new Error('El archivo debe ser MP3'));
                },
              },
            ]}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept=".mp3,audio/mpeg" disabled={uploading}>
              <Button icon={<UploadOutlined />} disabled={uploading}>Seleccionar MP3</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>Subir</Button>
          {uploading ? <Progress className="upload-progress" percent={uploadProgress} size="small" /> : null}
        </Form>
      </Card>
      <Card className="data-card">
        <AsyncState loading={loading} error={error} empty={audios.length === 0} emptyText="Todavía no hay audios registrados." onRetry={reload}>
          <Table
            rowKey="id"
            dataSource={audios}
            loading={refreshing}
            scroll={{ x: 980 }}
            columns={[
              { title: 'Nombre', dataIndex: 'name' },
              { title: 'Archivo', dataIndex: 'filename' },
              { title: 'Relación', dataIndex: 'relationType', render: (value) => relationOptions.find((item) => item.value === value)?.label || value },
              { title: 'Vista previa', render: (_, row) => <audio controls src={`${API_URL}/api/v1/audios/${row.id}/stream`} /> },
              { title: 'Fecha', dataIndex: 'createdAt', render: (value) => new Date(value).toLocaleString('es-EC') },
              {
                title: 'Acciones',
                render: (_, row) => (
                  <div className="table-actions">
                    <Button icon={<EditOutlined />} onClick={() => { setEditing(row); editForm.setFieldsValue(row); }}>Editar</Button>
                    <Popconfirm title="Eliminar audio" description="El archivo dejará de estar disponible en la plataforma." onConfirm={() => deleteAudio(row.id)}>
                      <Button danger icon={<DeleteOutlined />} loading={deletingId === row.id} disabled={deletingId === row.id}>Eliminar</Button>
                    </Popconfirm>
                  </div>
                ),
              },
            ]}
          />
        </AsyncState>
      </Card>
      <Modal
        title="Editar audio"
        open={Boolean(editing)}
        onCancel={() => !saving && setEditing(null)}
        onOk={() => editForm.submit()}
        okText="Guardar"
        confirmLoading={saving}
      >
        <Form form={editForm} layout="vertical" onFinish={updateAudio}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingresa el nombre del audio' }]}><Input /></Form.Item>
          <Form.Item label="Relación" name="relationType"><Select options={relationOptions} /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
