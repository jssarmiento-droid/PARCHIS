import { Typography } from 'antd';

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-title">
      <Typography.Title level={2}>{title}</Typography.Title>
      <Typography.Paragraph>{subtitle}</Typography.Paragraph>
    </div>
  );
}
