import { createMemo, createSignal, Show } from 'solid-js';
import { styled } from 'styled-system/jsx/factory';

import { useDynamicPureStore } from '@/store';
import {
  createGetCharacterById,
  removeCharacter,
  cloneCharacter,
} from '@/store/characterDrawer';

import EllipsisVerticalIcon from 'lucide-solid/icons/ellipsis-vertical';
import { IconButton } from '@/components/ui/icon-button';
import { SimpleCharacter } from '@/components/SimpleCharacter';
import { CharacterActionMenu } from './CharacterActionMenu';
import type { SelectionDetails } from '@/components/ui/menu';

export interface CharacterItemProps {
  id: string;
}
export const CharacterItem = (props: CharacterItemProps) => {
  const [open, setOpen] = createSignal(false);

  const getCharacterById = createMemo(() => createGetCharacterById(props.id));
  const characterData = useDynamicPureStore(getCharacterById);

  const handleSelect = () => {
    setOpen(!open());
  };

  const handleClone = () => {
    cloneCharacter(props.id);
  };

  const handleRemove = () => {
    removeCharacter(props.id);
  };

  const handleMenuSelect = (details: SelectionDetails) => {
    if (details.value === 'clone') {
      handleClone();
    } else if (details.value === 'delete') {
      handleRemove();
    }
  };

  return (
    <Show when={characterData()}>
      {(character) => (
        <CharacterItemContainer>
          <CharacterItemImage onClick={handleSelect}>
            <CharacterItemPositioner>
              <SimpleCharacter
                title={character().name}
                items={character().items}
                earType={character().earType}
                handType={character().handType}
              />
            </CharacterItemPositioner>
          </CharacterItemImage>
          <CharacterActionMenu
            onSelect={handleMenuSelect}
            size="xs"
            name={character().name}
          >
            <IconButton
              size="xs"
              variant="ghost"
              position="absolute"
              top="1"
              right="1"
            >
              <EllipsisVerticalIcon size={16} />
            </IconButton>
          </CharacterActionMenu>
        </CharacterItemContainer>
      )}
    </Show>
  );
};

const CharacterItemContainer = styled('div', {
  base: {
    height: 'full',
    flexBasis: '5rem',
    flexShrink: 0,
    position: 'relative',
    borderRadius: 'md',
    boxShadow: 'md',
    cursor: 'pointer',
  },
});

const CharacterItemImage = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    cursor: 'pointer',
  },
});

const CharacterItemPositioner = styled('div', {
  base: {
    position: 'absolute',
  },
});
