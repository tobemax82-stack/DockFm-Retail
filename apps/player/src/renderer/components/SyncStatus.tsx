// =====================================================
// DOCKFM RETAIL - SYNC STATUS COMPONENT
// Visual indicator for offline sync status
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudOff, 
  Download, 
  Check, 
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

// =====================================================
// SYNC STATUS INDICATOR
// =====================================================

export function SyncStatusIndicator() {
  const { syncState, storageInfo, formatBytes, requestSync } = useOfflineSync();

  const getStatusIcon = () => {
    if (syncState.isSyncing) {
      return <Download className="w-4 h-4 animate-bounce" />;
    }
    if (!syncState.isOnline) {
      return <CloudOff className="w-4 h-4" />;
    }
    if (syncState.pendingDownloads > 0) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Cloud className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (syncState.isSyncing) return 'text-blue-400';
    if (!syncState.isOnline) return 'text-orange-400';
    if (syncState.pendingDownloads > 0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    if (syncState.isSyncing) {
      return `Sincronizzazione ${syncState.totalProgress}%`;
    }
    if (!syncState.isOnline) {
      return 'Modalità Offline';
    }
    if (syncState.pendingDownloads > 0) {
      return `${syncState.pendingDownloads} in attesa`;
    }
    return 'Sincronizzato';
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={() => requestSync()}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 ${getStatusColor()} hover:bg-surface-700/50 transition-colors`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={syncState.isSyncing}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </motion.button>

      {/* Storage indicator */}
      {storageInfo && (
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-800/30 text-surface-400 text-xs">
          <HardDrive className="w-3 h-3" />
          <span>{formatBytes(storageInfo.usedStorage)}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================
// SYNC STATUS PANEL (Expanded View)
// =====================================================

interface SyncStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncStatusPanel({ isOpen, onClose }: SyncStatusPanelProps) {
  const { 
    syncState, 
    storageInfo, 
    formatBytes, 
    requestSync, 
    clearCache 
  } = useOfflineSync();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 w-80 bg-surface-900 rounded-xl border border-surface-700 shadow-xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-surface-800/50 border-b border-surface-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Stato Sincronizzazione
              </h3>
              <div className={`flex items-center gap-1.5 ${syncState.isOnline ? 'text-green-400' : 'text-orange-400'}`}>
                {syncState.isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-xs">
                  {syncState.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Sync Progress */}
            {syncState.isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-400">Download in corso...</span>
                  <span className="text-white font-medium">{syncState.totalProgress}%</span>
                </div>
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${syncState.totalProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Status Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-400">Versione manifest</span>
                <span className="text-white">v{syncState.localManifestVersion}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-400">Ultimo sync</span>
                <span className="text-white">
                  {syncState.lastSyncAt 
                    ? new Date(syncState.lastSyncAt).toLocaleTimeString('it-IT')
                    : 'Mai'}
                </span>
              </div>

              {syncState.pendingDownloads > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-400">In attesa</span>
                  <span className="text-yellow-400">{syncState.pendingDownloads} file</span>
                </div>
              )}
            </div>

            {/* Storage */}
            {storageInfo && (
              <div className="pt-3 border-t border-surface-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-surface-400">Storage locale</span>
                  <span className="text-white">
                    {formatBytes(storageInfo.usedStorage)} / {formatBytes(storageInfo.totalStorage)}
                  </span>
                </div>
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500"
                    style={{ 
                      width: `${(storageInfo.usedStorage / storageInfo.totalStorage) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-surface-500">
                  <span>{storageInfo.cachedItems} file in cache</span>
                  <span>{formatBytes(storageInfo.availableStorage)} disponibili</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3">
              <motion.button
                onClick={() => requestSync()}
                disabled={syncState.isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                Sincronizza
              </motion.button>
              
              <motion.button
                onClick={() => {
                  if (confirm('Vuoi cancellare tutta la cache locale?')) {
                    clearCache();
                  }
                }}
                className="px-3 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-surface-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Pulisci cache
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// OFFLINE MODE BANNER
// =====================================================

export function OfflineModeBanner() {
  const { syncState, requestSync } = useOfflineSync();

  if (syncState.isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-orange-500/90 backdrop-blur text-white px-4 py-2 z-50"
    >
      <div className="flex items-center justify-center gap-3">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          Modalità Offline - Riproduzione dalla cache locale
        </span>
        <button
          onClick={() => requestSync()}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Riprova connessione
        </button>
      </div>
    </motion.div>
  );
}

// =====================================================
// SYNC NOTIFICATION
// =====================================================

interface SyncNotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

export function SyncNotification({ show, message, type, onDismiss }: SyncNotificationProps) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: <Check className="w-4 h-4" />,
    error: <AlertTriangle className="w-4 h-4" />,
    info: <Download className="w-4 h-4" />,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50`}
        >
          {icons[type]}
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onDismiss}
            className="ml-2 hover:bg-white/20 rounded p-1"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SyncStatusIndicator;
