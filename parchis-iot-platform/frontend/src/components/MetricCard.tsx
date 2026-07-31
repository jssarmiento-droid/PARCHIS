import { Card, Statistic } from 'antd';
import { ReactNode } from 'react';

export function MetricCard({ title, value, suffix, icon }: { title: string; value: number | string; suffix?: string; icon?: ReactNode }) {
  return (
    <Card className="metric-card">
      <Statistic title={title} value={value} suffix={suffix} prefix={icon} />
    </Card>
  );
}
