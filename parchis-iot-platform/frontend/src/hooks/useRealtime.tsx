import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { DeviceStatus, GameSession, MoveHistory, SystemConfig } from '../types/domain';

interface RealtimeState {
  connected: boolean;
  devices: DeviceStatus[];
  activeGame: GameSession | null;
  movements: MoveHistory[];
  technicalEvents: string[];
  finalReport: unknown | null;
  systemConfig: SystemConfig | null;
  refresh: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeState>({
  connected: false,
  devices: [],
  activeGame: null,
  movements: [],
  technicalEvents: [],
  finalReport: null,
  systemConfig: null,
  refresh: async () => undefined,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [movements, setMovements] = useState<MoveHistory[]>([]);
  const [technicalEvents, setTechnicalEvents] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<unknown | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [deviceResponse, activeGameResponse, configResponse] = await Promise.all([
        api.get('/devices/status'),
        api.get('/games/active'),
        api.get('/settings'),
      ]);
      setDevices(deviceResponse.data || []);
      setActiveGame(activeGameResponse.data || null);
      setMovements(activeGameResponse.data?.movements || []);
      setSystemConfig(configResponse.data || null);
    } catch {
      setTechnicalEvents((current) => ['No se pudo sincronizar el estado inicial del sistema', ...current].slice(0, 80));
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    const interval = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 20000);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('device:status', setDevices);
    socket.on('device:telemetry', (event) => setTechnicalEvents((current) => [`Estado ESP32 recibido: ${JSON.stringify(event)}`, ...current].slice(0, 80)));
    socket.on('game:state', (game: GameSession) => {
      setActiveGame(game);
      if (game?.movements) setMovements(game.movements);
    });
    socket.on('game:movement', (movement: MoveHistory) => {
      setMovements((current) => {
        if (current.some((item) => item.id === movement.id)) return current;
        return [movement, ...current].slice(0, 60);
      });
    });
    socket.on('nano:button-state', (event) => setTechnicalEvents((current) => [`Botón ${event.button}: ${event.pressed ? 'presionado' : 'liberado'}`, ...current].slice(0, 80)));
    socket.on('system:error', (event) => setTechnicalEvents((current) => [`Error: ${event.message}`, ...current].slice(0, 80)));
    socket.on('game:final-report', setFinalReport);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('device:status');
      socket.off('device:telemetry');
      socket.off('game:state');
      socket.off('game:movement');
      socket.off('nano:button-state');
      socket.off('system:error');
      socket.off('game:final-report');
      window.clearInterval(interval);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ connected, devices, activeGame, movements, technicalEvents, finalReport, systemConfig, refresh }),
    [connected, devices, activeGame, movements, technicalEvents, finalReport, systemConfig, refresh],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
