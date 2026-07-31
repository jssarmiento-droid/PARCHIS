import { Alert, Button, Card, Empty, Skeleton } from 'antd';
import { ReactNode } from 'react';

interface AsyncStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onRetry?: () => void;
  children: ReactNode;
}

export function AsyncState({ loading, error, empty, onRetry, children }: AsyncStateProps) {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="No se pudo cargar la información"
        description={error}
        action={onRetry ? <Button onClick={onRetry}>Reintentar</Button> : undefined}
      />
    );
  }

  if (empty) {
    return (
      <Card>
        <Empty description="Sin datos registrados" />
      </Card>
    );
  }

  return children;
}
