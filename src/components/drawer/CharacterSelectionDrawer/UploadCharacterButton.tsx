import UploadIcon from 'lucide-solid/icons/upload';
import { Button } from '@/components/ui/button';

import {
  type SaveCharacterData,
  appendCharacter,
  verifySaveCharacterData,
  createCharacterUniqueId,
} from '@/store/characterDrawer';
import { toaster } from '@/components/GlobalToast';

export const UploadCharacterButton = () => {
  const handleUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) {
      return;
    }

    const file = target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return;
      }

      try {
        const data = (JSON.parse(result) || {}) as SaveCharacterData;
        if (!verifySaveCharacterData(data)) {
          throw new Error('invalid character data');
        }
        data.id = createCharacterUniqueId();
        console.info('upload character', data);

        appendCharacter(data);
      } catch (error) {
        console.error(error);
        toaster.error({
          title: '上傳失敗',
          description: '檔案格式錯誤',
        });
      } finally {
        target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <Button as="label" title="上傳角色" size="xs">
      <input
        id="uploadCharacter"
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
      上傳
      <UploadIcon />
    </Button>
  );
};
