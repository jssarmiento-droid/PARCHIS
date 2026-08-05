import { FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { App as AntdApp, Button, Card, Col, Row, Space, Table } from 'antd';
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

function escapeExcelCell(value: unknown) {
  return String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildExcelTable(title: string, headers: string[], rows: Array<Array<string | number>>) {
  const headerHtml = headers.map((header) => `<th>${escapeExcelCell(header)}</th>`).join('');
  const bodyHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeExcelCell(cell)}</td>`).join('')}</tr>`)
    .join('');

  return `
    <h2>${escapeExcelCell(title)}</h2>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;
}

export function ReportsPage() {
  const { message } = AntdApp.useApp();
  const { data: report, loading, refreshing, error, reload } = useResource<ReportData>(
    async () => (await api.get('/reports')).data,
    [],
    30000,
  );

  function exportExcel() {
    if (!report) return;

    const summaryRows: Array<Array<string | number>> = [
      ['Partidas', report.totals.games],
      ['Respuestas correctas', report.totals.correctAnswers],
      ['Respuestas incorrectas', report.totals.incorrectAnswers],
      ['Tiempo promedio (segundos)', report.totals.averageDuration],
      ['Jugador con mayor puntaje educativo', report.totals.topEducationalPlayer ?? '-'],
    ];

    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #14532d; }
            h2 { margin-top: 24px; color: #166534; }
            table { border-collapse: collapse; margin-bottom: 16px; }
            th { background: #e8f5e9; font-weight: 700; }
            th, td { border: 1px solid #b7c7b2; padding: 8px 10px; min-width: 120px; }
          </style>
        </head>
        <body>
          <h1>Reporte Parchís Inclusivo</h1>
          <p>Generado: ${escapeExcelCell(new Date().toLocaleString('es-EC'))}</p>
          ${buildExcelTable('Resumen general', ['Métrica', 'Valor'], summaryRows)}
          ${buildExcelTable('Distribución de respuestas', ['Tipo', 'Cantidad'], report.chartSeries.map((item) => [item.type, item.value]))}
          ${buildExcelTable('Errores por casilla', ['Casilla', 'Errores'], report.errorsByTile.map((item) => [item.tile, item.errors]))}
          ${buildExcelTable(
            'Preguntas con menor porcentaje de aciertos',
            ['Pregunta', 'Acierto', 'Respuestas'],
            report.lowestAccuracyQuestions.map((item) => [item.title, `${item.accuracy}%`, item.total]),
          )}
        </body>
      </html>
    `;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-parchis-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Reporte de Excel exportado');
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Reportes y analítica"
        subtitle="Indicadores estadísticos para la defensa y seguimiento pedagógico."
        extra={
          <>
            <Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={exportExcel} disabled={!report}>Exportar Excel</Button>
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
