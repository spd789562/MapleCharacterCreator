import { invoke } from '@tauri-apps/api/core';
import { atom } from 'nanostores';

import { $apiHost, $isInitialized } from '@/store/const';
import { initializeSavedCharacter } from '@/store/characterDrawer';
import {
  initializeSavedFileSelectHistory,
  appendPathToHistory,
} from '@/store/fileSelectHistory';
import { initializeSavedSetting } from '@/store/settingDialog';
import { initializeSavedEquipmentHistory } from '@/store/equipHistory';
import { prepareAndFetchEquipStrings } from '@/store/string';
import { initialGlobalRenderer } from '@/store/renderer';

import { toaster } from '@/components/GlobalToast';
import { nextTick } from '@/utils/eventLoop';

export enum InitLoadProgress {
  SaveFile = 'save_file',
  InitWz = 'init_wz',
  InitString = 'init_string',
  Done = 'done',
}

export const $isWzLoading = atom(false);
export const $initLoadProgress = atom<InitLoadProgress | undefined>();

export function initialWzBase(path: string) {
  return invoke<void>('init', { path });
}

export function getServerInfo() {
  return invoke<{ url: string; is_initialized: boolean }>('get_server_url');
}

export async function initApp() {
  $isWzLoading.set(true);
  $initLoadProgress.set(InitLoadProgress.SaveFile);
  await nextTick();
  try {
    await initializeSavedCharacter();
    await initializeSavedFileSelectHistory();
    await initializeSavedSetting();
    await initializeSavedEquipmentHistory();
  } catch (_) {
    toaster.error({
      title: '初始化錯誤',
      description: '無法建立或讀取存檔，請確認應用程式權限並重啟。',
      duration: 20000,
    });
    $isWzLoading.set(false);
    return;
  }
  /* this should infailable */
  const { url, is_initialized } = await getServerInfo();

  $apiHost.set(url);

  if (is_initialized) {
    await initStringAndRenderer();
    $isInitialized.set(is_initialized);
  }

  $initLoadProgress.set(undefined);
  $isWzLoading.set(false);
  console.info('API host:', url);
}

export async function initByWzBase(path: string) {
  $isWzLoading.set(true);
  $initLoadProgress.set(InitLoadProgress.InitWz);
  await nextTick();
  try {
    await initialWzBase(path);
  } catch (e) {
    let message = '未知錯誤';
    if (e instanceof Error) {
      message = e.message;
    }
    toaster.error({
      title: '初始化 Base.wz 錯誤',
      description: `錯誤訊息：${message}`,
    });
    $isWzLoading.set(false);
    return false;
  }

  const isSuccess = await initStringAndRenderer();

  if (!isSuccess) {
    $isWzLoading.set(false);
    return false;
  }

  $isInitialized.set(true);

  await appendPathToHistory(path);

  $isWzLoading.set(false);
  return true;
}

export async function initStringAndRenderer() {
  try {
    await prepareAndFetchEquipStrings();
  } catch (_) {
    toaster.error({
      title: '初始化錯誤',
      description: '無法讀取裝備資訊，請檢察 Wz 完整度。',
    });
    return false;
  }

  $initLoadProgress.set(InitLoadProgress.Done);
  await nextTick();

  try {
    await initialGlobalRenderer();
  } catch (_) {
    toaster.error({
      title: '初始化錯誤',
      description: '無法初始化渲染器，請更新 webview2。',
    });
    return false;
  }
  return true;
}
