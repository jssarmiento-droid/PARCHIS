import { Alert, Button, Empty, Skeleton } from 'antd';
import { ReactNode } from 'react';

interface AsyncStateProps {
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function AsyncState({ loading, error, empty, emptyText = 'Sin datos registrados', onRetry, children }: AsyncStateProps) {
  if (loading) {
    return (
      <div className="surface-block">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
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
      <div className="empty-state">
        <Empty description={emptyText} />
      </div>
    );
  }

  return children;
}
