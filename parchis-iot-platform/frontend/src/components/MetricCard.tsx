import { Card, Skeleton, Statistic } from 'antd';
import { ReactNode } from 'react';

export function MetricCard({
  title,
  value,
  suffix,
  icon,
  loading,
}: {
  title: string;
  value: number | string;
  suffix?: string;
  icon?: ReactNode;
  loading?: boolean;
}) {
  return (
    <Card className="metric-card">
      {loading ? <Skeleton active paragraph={false} /> : <Statistic title={title} value={value} suffix={suffix} prefix={icon} />}
    </Card>
  );
}
