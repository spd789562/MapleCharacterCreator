import { $equpimentDrawerOpen } from '@/store/trigger';

import { ShirtIcon } from 'lucide-solid';
import { SideOpenButton } from '@/components/ui/sideOpenButton';

export const EquipOpenButton = () => {
  function handleOpen(_: unknown) {
    $equpimentDrawerOpen.set(true);
  }

  return (
    <SideOpenButton onClick={handleOpen}>
      <ShirtIcon />
    </SideOpenButton>
  );
};