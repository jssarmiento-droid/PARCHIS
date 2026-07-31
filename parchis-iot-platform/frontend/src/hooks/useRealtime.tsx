import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DeviceStatus, GameSession, MoveHistory } from '../types/domain';
import { socket } from '../services/socket';

interface RealtimeState {
  connected: boolean;
  devices: DeviceStatus[];
  activeGame: GameSession | null;
  movements: MoveHistory[];
  technicalEvents: string[];
  finalReport: unknown | null;
}

const RealtimeContext = createContext<RealtimeState>({
  connected: false,
  devices: [],
  activeGame: null,
  movements: [],
  technicalEvents: [],
  finalReport: null,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [movements, setMovements] = useState<MoveHistory[]>([]);
  const [technicalEvents, setTechnicalEvents] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<unknown | null>(null);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('device:status', setDevices);
    socket.on('game:state', setActiveGame);
    socket.on('game:movement', (movement: MoveHistory) => setMovements((current) => [movement, ...current].slice(0, 60)));
    socket.on('nano:button-state', (event) => setTechnicalEvents((current) => [`Botón ${event.button}: ${event.pressed ? 'presionado' : 'liberado'}`, ...current].slice(0, 80)));
    socket.on('system:error', (event) => setTechnicalEvents((current) => [`Error: ${event.message}`, ...current].slice(0, 80)));
    socket.on('game:final-report', setFinalReport);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('device:status');
      socket.off('game:state');
      socket.off('game:movement');
      socket.off('nano:button-state');
      socket.off('system:error');
      socket.off('game:final-report');
    };
  }, []);

  const value = useMemo(
    () => ({ connected, devices, activeGame, movements, technicalEvents, finalReport }),
    [connected, devices, activeGame, movements, technicalEvents, finalReport],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
