import { Button } from '@/antd-components/button.component';
import { FloatButton } from '@/antd-components/float-button.component';
import { Input } from '@/antd-components/input.component';
import { message } from '@/antd-components/message.component';
import { Space } from '@/antd-components/space.component';
import { SideBar } from '@/layouts/side-bar.component';
import { TopBar } from '@/layouts/top-bar.component';
import { API_ENDPOINTS } from '@/utilities/constants';
import { useTodoList } from '@/utilities/hooks/use-todo-list.hook';
import { todoApi } from '@/utilities/services/api.service';
import { MessageOutlined } from '@ant-design/icons';
import { trim } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ContentContainerHeader } from './components/content-container-header.component';
import { TodoListTable } from './components/todo-list-table.component';
import { ViewTaskDetailsModal } from './components/view-task-details-modal.component';
import { ContentContainer, Wrapper } from './styles/todo-list-page.styled';
import { AutoGenerateModal } from './components/auto-generate-modal.component';
import { useAutoGenerate } from './config/useAutoGenerate';



const ChatPanel = styled.div`
  position: fixed;
  right: 1rem;
  bottom: 5.5rem;
  width: min(360px, calc(100vw - 2rem));
  background: var(--item-background-color);
  border: 1px solid var(--divider-color);
  border-radius: 0.75rem;
  box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.34);
  z-index: 999;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: var(--content-background-color, #fff);
  border-bottom: 1px solid var(--divider-color);
  padding: 0.8rem 0.9rem;
  font-weight: 600;
`;

const ChatBody = styled.div`
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
  background: var(--item-background-color);
`;

const ChatMessage = styled.div`
  margin-bottom: 0.65rem;
  line-height: 1.35;
  word-break: break-word;
  white-space: pre-wrap;
  border-radius: 0.45rem;
  padding: 0.5rem;
  background: ${({ from }) => (from === 'ai' ? '#f4f6fb' : from === 'user' ? '#e6f7ff' : '#fafafa')};
  color: var(--primary-text-color);
`;

const ChatFooter = styled.div`
  border-top: 1px solid var(--divider-color);
  padding: 0.8rem;
  display: flex;
  gap: 0.5rem;
`;

// Main TodoListPage component that manages the entire todo list application
export const TodoListPage = () => {
  const [openActionRowId, setOpenActionRowId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const contentRef = useRef(null);

  const {
    todoList,
    fetchedTodos,
    isLoading,
    viewTask,
    currentPriorityFilter,
    currentDueDateFilter,
    handleViewTaskDetails,
    handleCloseViewModal,
    handleCompleteTask,
    handleResetOriginalData,
    handleAddNewTodo,
    handleSearchTasksByName,
    handleFilterStatus,
    handleFilterPriority,
    handleFilterDueDate,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    userMenuItems,
    handleAddGeneratedTodos,  // Auto-generate tasks
  } = useTodoList();
  const { generateTasks } = useAutoGenerate();
  // const [isAiModalOpen, setIsAiModalOpen] = useState(false); // State to control AI modal visibility


  const handleActionMenuOpenChange = (rowId, isOpen) => setOpenActionRowId(isOpen ? rowId : null);
const handleSendPrompt = async () => {
    const promptText = promptInput.trim();
    if (!promptText) return;

    setChatMessages(prev => [...prev, {
        id: Date.now() + '-user', from: 'user', text: promptText
    }]);
    setPromptInput('');
    setIsChatSubmitting(true);

    try {
        const { data } = await todoApi.post(
            API_ENDPOINTS.CHAT,   // '/todos/chat'
            { prompt: promptText }
        );

        setChatMessages(prev => [...prev, {
            id: Date.now() + '-ai', from: 'ai', text: data.message
        }]);

        // nếu backend đã lưu task → thêm vào list ngay
        if (data.action === 'save' && data.task) {
            handleAddNewTodo(data.task);
            message.success('Task đã được tạo!', 1);
        }

    } catch (e) {
        setChatMessages(prev => [...prev, {
            id: Date.now() + '-ai', from: 'ai',
            text: 'Có lỗi xảy ra. Thử lại nhé!'
        }]);
    } finally {
        setIsChatSubmitting(false);
    }
};
  // const handleSendPrompt = async () => {
  //   const promptText = promptInput.trim();

  //   if (!promptText) {
  //     message.error('Please enter a prompt before sending.', 1);
  //     return;
  //   }

  //   setIsChatSubmitting(true);

  //   setChatMessages(prev => [...prev, { id: Date.now() + '-user', from: 'user', text: promptText }]);

  //   try {
  //     const newTasks = await generateTasks({
  //       source: 'user_prompt',
  //       prompt: promptText,
  //       maxTasks: 5, // Default max tasks for chat
  //     });

  //     if (newTasks && newTasks.length > 0) {
  //       setChatMessages(prev => [
  //         ...prev,
  //         { id: Date.now() + '-ai', from: 'ai', text: `${newTasks.length} task(s) generated and saved successfully.` },
  //       ]);
  //       setPromptInput('');
  //       setIsChatOpen(true);

  //       handleAddGeneratedTodos(newTasks);
  //       message.success(`${newTasks.length} AI task(s) created successfully!`, 1);
  //     } else {
  //       setChatMessages(prev => [
  //         ...prev,
  //         { id: Date.now() + '-ai', from: 'ai', text: 'Failed to generate tasks. Please try again.' },
  //       ]);
  //       message.error('Failed to generate tasks!', 1);
  //     }
  //   } catch (error) {
  //     setChatMessages(prev => [
  //       ...prev,
  //       { id: Date.now() + '-ai', from: 'ai', text: 'Failed to generate tasks. Please try again.' },
  //     ]);

  //     if (error.response?.status === 401) {
  //       message.error('Unauthorized. Please login again.', 1);
  //     } else {
  //       message.error('Failed to generate AI tasks.', 1);
  //     }
  //   } finally {
  //     setIsChatSubmitting(false);
  //   }
  // };

  useEffect(() => {
    if (contentRef.current) contentRef.current.style.overflow = openActionRowId ? 'hidden' : 'auto';
  }, [openActionRowId]);

  return (
    <Wrapper>
      <TopBar
        onResetOriginalData={handleResetOriginalData}
        onSearchTasksByName={handleSearchTasksByName}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />
      <Space align="start">
        <SideBar onAddNewTodo={handleAddNewTodo} onFilterStatus={handleFilterStatus} />

        <ContentContainer ref={contentRef}>
          <ContentContainerHeader
            hasCurrentTasks={fetchedTodos.length > 0}
            currentPriority={currentPriorityFilter}
            currentDueDate={currentDueDateFilter}
            onFilterPriority={handleFilterPriority}
            onFilterDueDate={handleFilterDueDate}
            onDeleteAllTasks={handleDeleteAllTasks}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />

          <TodoListTable
            todoList={todoList}
            isLoading={isLoading}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onViewDetails={handleViewTaskDetails}
            onActionMenuOpenChange={handleActionMenuOpenChange}
          />
        </ContentContainer>
      </Space>

      <ViewTaskDetailsModal isOpen={!!viewTask} task={viewTask} onClose={handleCloseViewModal} />
      
      {/* <AutoGenerateModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onGenerate={(newTasks) => {
              handleAddGeneratedTodos(newTasks);
              message.success(`${newTasks.length} tasks generated!`, 1);
          }}
      /> */}


      {isChatOpen && (
        <ChatPanel>
          <ChatHeader>
            AI Mini Chat
            <Button type="text" style={{ float: 'right', padding: 0 }} onClick={() => setIsChatOpen(false)}>
              Close
            </Button>
          </ChatHeader>

          <ChatBody>
            {chatMessages.length === 0 ? (
              <div style={{ color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>
                Enter a prompt to generate a todo.
              </div>
            ) : (
              chatMessages.map(msg => (
                <ChatMessage key={msg.id} from={msg.from}>
                  {msg.text}
                </ChatMessage>
              ))
            )}
          </ChatBody>

          <ChatFooter>
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="Type your Vietnamese prompt..."
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              disabled={isChatSubmitting}
            />
            <Button type="primary" onClick={handleSendPrompt} loading={isChatSubmitting}>
              Send
            </Button>
          </ChatFooter>
        </ChatPanel>
      )}

      <FloatButton icon={<MessageOutlined />} type="primary" onClick={() => setIsChatOpen(prev => !prev)} />
    </Wrapper>
  );
};
