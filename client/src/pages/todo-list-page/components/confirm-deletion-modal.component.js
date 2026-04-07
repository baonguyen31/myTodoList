import { Modal } from '@/antd-components/modal.component';

const { confirm } = Modal;

// Function to display a confirmation modal for deletion
export const ConfirmDeletionModal = options => {
  const { onOk, title } = options;

  confirm({
    title,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk,
    maskClosable: true,
    ...options,
  });
};
