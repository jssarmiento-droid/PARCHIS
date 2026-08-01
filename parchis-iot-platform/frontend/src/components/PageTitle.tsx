import { Space, Typography } from 'antd';
import { ReactNode } from 'react';

export function PageTitle({ title, subtitle, extra }: { title: string; subtitle: string; extra?: ReactNode }) {
  return (
    <div className="page-title-row">
      <div className="page-title">
        <Typography.Title level={2}>{title}</Typography.Title>
        <Typography.Paragraph>{subtitle}</Typography.Paragraph>
      </div>
      {extra ? <Space wrap>{extra}</Space> : null}
    </div>
  );
}
