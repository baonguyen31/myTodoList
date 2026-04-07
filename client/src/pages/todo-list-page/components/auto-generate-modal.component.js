import { Form } from '@/antd-components/form.component';
import { TextField } from '@/antd-components/input.component';
import { message } from '@/antd-components/message.component';
import { Modal } from '@/antd-components/modal.component';
import { API_ENDPOINTS } from '@/utilities/constants';
import { useState } from 'react';
import { useAutoGenerate } from '../config/useAutoGenerate';

export const AutoGenerateModal = ({ isOpen, onClose, onGenerate  }) => {
  const [form] = Form.useForm();
  const { generateTasks, isLoading } = useAutoGenerate();

  const handleGenerate = async () => {
    try{
        // step A: get form values (look at how AddTodoModal does this)
        const formValue = await form.validateFields();
        const { promptField, maxTasksField } = formValue;
    // step B: call generateTasks with { source: 'user_prompt', prompt: ???, maxTasks: ??? }
        const newTasks = await generateTasks({
            source: 'user_prompt',
            prompt: promptField,
            maxTasks: maxTasksField,
        });
    // step C: if result exists → tell parent + close + reset form
        if (newTasks) {
            onGenerate(newTasks);
            form.resetFields();
            onClose();
    // step D: if error → show message.error
        } else {
            message.error('Failed to generate tasks!', 1);
        }

    } catch (e) {
        if (e.errorFields) return;
        message.error('Failed to generate tasks!', 1);
    }
  };

  return (
    <Modal
      title="AI Task Generator"
      open={isOpen}
      okText="Generate"
      cancelText="Cancel"
      onOk={handleGenerate}
      onCancel={onClose}
      okButtonProps={{ loading: isLoading }}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '1.5rem' }}>

        {/* prompt field - use TextField.TextArea like the description field in AddTodoModal */}
        <Form.Item
          label="What do you need to do?"
          name="promptField"
          rules={[{ required: true, message: 'Please enter a prompt!' }]}
        >
          <TextField.TextArea
            placeholder="e.g. Prepare for the product launch next Friday..."
            rows={4}
            maxLength={500}
            style={{ resize: 'vertical' }}
            />
        </Form.Item>

        {/* maxTasks field - just a number input, between 1 and 10 */}
        <Form.Item
          label="Max tasks to generate"
          name="maxTasksField"
          initialValue={5}
        >
          <TextField type="number" min={1} max={10} />
        </Form.Item>

      </Form>
    </Modal>
  );
};