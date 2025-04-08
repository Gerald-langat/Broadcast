import { Modal } from 'flowbite-react';
import { Members } from '../atoms/modalAtom';
import React from 'react'
import { useRecoilState } from 'recoil';

function MembersModal() {
      const [open, setOpen] = useRecoilState(Members);
  return (
    <div>
      {open && (
        <Modal
          isOpen={open}
          onRequestClose={() => setOpen(false)}
          className="max-w-lg w-[90%]  absolute top-62 left-[50%] translate-x-[-50%] bg-white rounded-md shadow-md border-none"
        >
         <div>Members</div>
        </Modal>
      )}
    </div>
  )
}

export default MembersModal
