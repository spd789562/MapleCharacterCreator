import { createSignal, createMemo } from 'solid-js';
import { styled } from 'styled-system/jsx/factory';

import { usePureStore } from '@/store';
import { createEquipItemByCategory } from '@/store/character/selector';

import { HStack } from 'styled-system/jsx/hstack';
import { VStack } from 'styled-system/jsx/vstack';
import { Heading } from '@/components/ui/heading';
import { Switch, type ChangeDetails } from '@/components/ui/switch';
import { AllColorTable } from './AllColorTable';
import { MixDyeTable } from './MixDyeTable';

import { horizontalScroll } from '@/directive/horizontalScroll';

import { gatFaceAvailableColorIds, getFaceColorId } from '@/utils/mixDye';

import { FaceColorHex } from '@/const/face';

const $hairItem = createEquipItemByCategory('Face');

export const FaceDyeTab = () => {
  const [showFullCharacter, setShowFullCharacter] = createSignal(false);
  const hairItem = usePureStore($hairItem);

  const avaialbeFaceColorIds = createMemo(() => {
    const hairId = hairItem()?.id;
    if (!hairId) {
      return [];
    }
    return gatFaceAvailableColorIds(hairId);
  });

  function getFaceColorHex(colorId: number) {
    return FaceColorHex[getFaceColorId(colorId)];
  }

  function handleSwitchChange({ checked }: ChangeDetails) {
    setShowFullCharacter(checked);
  }

  return (
    <VStack>
      <CardContainer>
        <HStack alignItems="flex-end" m="2">
          <Heading size="2xl">顏色預覽</Heading>
          <Switch
            checked={showFullCharacter()}
            onCheckedChange={handleSwitchChange}
          >
            顯示完整腳色
          </Switch>
        </HStack>
        <TableContainer ref={horizontalScroll}>
          <AllColorTable
            category="Face"
            avaialbeColorIds={avaialbeFaceColorIds()}
            getColorHex={getFaceColorHex}
            showFullCharacter={showFullCharacter()}
          />
        </TableContainer>
      </CardContainer>
      <CardContainer>
        <HStack alignItems="flex-end" m="2">
          <Heading size="2xl">混染預覽</Heading>
          <Switch
            checked={showFullCharacter()}
            onCheckedChange={handleSwitchChange}
          >
            顯示完整腳色
          </Switch>
        </HStack>
        <TableContainer ref={horizontalScroll}>
          <MixDyeTable
            category="Face"
            avaialbeColorIds={avaialbeFaceColorIds()}
            getColorHex={getFaceColorHex}
            getColorId={getFaceColorId}
            showFullCharacter={showFullCharacter()}
          />
        </TableContainer>
      </CardContainer>
    </VStack>
  );
};

const CardContainer = styled('div', {
  base: {
    p: 2,
    borderRadius: 'md',
    boxShadow: 'md',
    backgroundColor: 'bg.default',
    maxWidth: '100%',
  },
});

const TableContainer = styled('div', {
  base: {
    overflowX: 'auto',
    maxWidth: '100%',
  },
});