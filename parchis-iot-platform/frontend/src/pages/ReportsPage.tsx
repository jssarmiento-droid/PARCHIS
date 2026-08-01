import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { Button, Card, Col, Row, Space, Table, message } from 'antd';
import { AsyncState } from '../components/AsyncState';
import { MetricCard } from '../components/MetricCard';
import { PageTitle } from '../components/PageTitle';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';

interface ReportData {
  totals: {
    games: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageDuration: number;
    topEducationalPlayer?: string | null;
  };
  chartSeries: Array<{ type: string; value: number }>;
  errorsByTile: Array<{ tile: number; errors: number }>;
  lowestAccuracyQuestions: Array<{ id: string; title: string; accuracy: number; total: number }>;
}

export function ReportsPage() {
  const { data: report, loading, refreshing, error, reload } = useResource<ReportData>(
    async () => (await api.get('/reports')).data,
    [],
    30000,
  );

  function exportCsv() {
    if (!report) return;
    const rows = [
      ['Métrica', 'Valor'],
      ['Partidas', report.totals.games],
      ['Correctas', report.totals.correctAnswers],
      ['Incorrectas', report.totals.incorrectAnswers],
      ['Tiempo promedio (segundos)', report.totals.averageDuration],
      ['Jugador con mayor puntaje educativo', report.totals.topEducationalPlayer ?? '-'],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte-parchis.csv';
    link.click();
    URL.revokeObjectURL(url);
    message.success('Reporte exportado');
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Reportes y analítica"
        subtitle="Indicadores estadísticos para la defensa y seguimiento pedagógico."
        extra={
          <>
            <Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportCsv} disabled={!report}>Exportar CSV</Button>
          </>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><MetricCard loading={loading} title="Partidas" value={report?.totals.games ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard loading={loading} title="Correctas" value={report?.totals.correctAnswers ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard loading={loading} title="Incorrectas" value={report?.totals.incorrectAnswers ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard loading={loading} title="Tiempo promedio" value={Math.round((report?.totals.averageDuration ?? 0) / 60)} suffix="min" /></Col>
      </Row>
      <AsyncState loading={loading} error={error} empty={!report} emptyText="Todavía no hay datos suficientes para generar reportes." onRetry={reload}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}><Card className="data-card" title="Respuestas"><Pie data={report?.chartSeries || []} angleField="value" colorField="type" height={280} /></Card></Col>
          <Col xs={24} lg={12}><Card className="data-card" title="Errores por casilla"><Column data={report?.errorsByTile || []} xField="tile" yField="errors" height={280} /></Card></Col>
        </Row>
        <Card className="data-card" title="Preguntas con menor porcentaje de aciertos">
          <Table
            rowKey="id"
            dataSource={report?.lowestAccuracyQuestions || []}
            loading={refreshing}
            scroll={{ x: 680 }}
            columns={[
              { title: 'Pregunta', dataIndex: 'title' },
              { title: 'Acierto', dataIndex: 'accuracy', render: (value) => `${value}%` },
              { title: 'Respuestas', dataIndex: 'total' },
            ]}
          />
        </Card>
      </AsyncState>
    </Space>
  );
}
