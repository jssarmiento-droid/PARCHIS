import { Column, Pie } from '@ant-design/charts';
import { Button, Card, Col, Row, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { PageTitle } from '../components/PageTitle';
import { api } from '../services/api';

export function ReportsPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api.get('/reports').then(({ data }) => setReport(data)).catch(() => undefined);
  }, []);

  function exportCsv() {
    const rows = [
      ['Métrica', 'Valor'],
      ['Partidas', report?.totals.games ?? 0],
      ['Correctas', report?.totals.correctAnswers ?? 0],
      ['Incorrectas', report?.totals.incorrectAnswers ?? 0],
      ['Tiempo promedio (segundos)', report?.totals.averageDuration ?? 0],
      ['Jugador con mayor puntaje educativo', report?.totals.topEducationalPlayer ?? '-'],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte-parchis.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <div className="page-title-row">
        <PageTitle title="Reportes y analítica" subtitle="Indicadores estadísticos para la defensa y seguimiento pedagógico." />
        <Button type="primary" onClick={exportCsv} disabled={!report}>Exportar CSV</Button>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><MetricCard title="Partidas" value={report?.totals.games ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard title="Correctas" value={report?.totals.correctAnswers ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard title="Incorrectas" value={report?.totals.incorrectAnswers ?? 0} /></Col>
        <Col xs={24} md={6}><MetricCard title="Tiempo promedio" value={Math.round((report?.totals.averageDuration ?? 0) / 60)} suffix="min" /></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}><Card title="Respuestas"><Pie data={report?.chartSeries || []} angleField="value" colorField="type" height={280} /></Card></Col>
        <Col xs={24} lg={12}><Card title="Errores por casilla"><Column data={report?.errorsByTile || []} xField="tile" yField="errors" height={280} /></Card></Col>
      </Row>
      <Card title="Preguntas con menor porcentaje de aciertos">
        <Table rowKey="id" dataSource={report?.lowestAccuracyQuestions || []} columns={[
          { title: 'Pregunta', dataIndex: 'title' },
          { title: 'Acierto', dataIndex: 'accuracy', render: (value) => `${value}%` },
          { title: 'Respuestas', dataIndex: 'total' },
        ]} />
      </Card>
    </Space>
  );
}
